using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [ApiController]
[Route("api/admin/revenue")]
    [Authorize(Roles = "Admin")]
    public class AdminRevenueController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Trạng thái "đã thanh toán" hợp lệ
        private static readonly HashSet<string> PaidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "paid", "success", "completed"
        };

        public AdminRevenueController(AppDbContext context)
        {
            _context = context;
        }

        // Thống kê tổng hợp doanh thu
        [HttpGet("overview")]
        public async Task<IActionResult> GetRevenueOverview(
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo,
            [FromQuery] string? period = "all") // all, day, month, quarter
        {
            // Thiết lập khoảng thời gian mặc định
            var startDate = dateFrom ?? DateTime.MinValue;
            var endDate = dateTo ?? DateTime.MaxValue;

            // Xử lý period
            if (period != "all" && !dateFrom.HasValue && !dateTo.HasValue)
            {
                var now = DateTime.Now;
                switch (period.ToLower())
                {
                    case "day":
                        startDate = now.Date;
                        endDate = now.Date.AddDays(1).AddTicks(-1);
                        break;
                    case "month":
                        startDate = new DateTime(now.Year, now.Month, 1);
                        endDate = startDate.AddMonths(1).AddTicks(-1);
                        break;
                    case "quarter":
                        var quarter = (now.Month - 1) / 3 + 1;
                        startDate = new DateTime(now.Year, (quarter - 1) * 3 + 1, 1);
                        endDate = startDate.AddMonths(3).AddTicks(-1);
                        break;
                }
            }

            // 1. Tổng doanh thu từ học viên (chỉ tính đơn hàng đã thanh toán)
            var totalRevenueQuery = _context.Orders
                .Include(o => o.Payments)
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                .Where(o => o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)));

            var totalRevenue = await totalRevenueQuery.SumAsync(o => o.TotalAmount);

            // Doanh thu kỳ trước để tính phần trăm thay đổi
            DateTime prevStart = startDate, prevEnd = endDate;
            switch ((period ?? "all").ToLower())
            {
                case "day":
                    prevStart = startDate.AddDays(-1);
                    prevEnd = endDate.AddDays(-1);
                    break;
                case "month":
                    prevStart = new DateTime(startDate.Year, startDate.Month, 1).AddMonths(-1);
                    prevEnd = prevStart.AddMonths(1).AddTicks(-1);
                    break;
                case "quarter":
                    // Lùi 1 quý
                    var currentQuarterStart = new DateTime(startDate.Year, ((startDate.Month - 1) / 3) * 3 + 1, 1);
                    prevStart = currentQuarterStart.AddMonths(-3);
                    prevEnd = prevStart.AddMonths(3).AddTicks(-1);
                    break;
                default:
                    // 'all' hoặc không xác định: không tính tỷ lệ thay đổi
                    prevStart = DateTime.MinValue;
                    prevEnd = DateTime.MinValue;
                    break;
            }

            decimal previousTotalRevenue = 0;
            if (prevStart != DateTime.MinValue)
            {
                previousTotalRevenue = await _context.Orders
                    .Include(o => o.Payments)
                    .Where(o => o.OrderDate >= prevStart && o.OrderDate <= prevEnd)
                    .Where(o => o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)))
                    .SumAsync(o => o.TotalAmount);
            }

            // 2. Tổng tiền đã chi trả cho giảng viên
            var totalPayoutsQuery = _context.Payouts
                // Theo schema SQL: Status có các giá trị 'pending', 'paid', 'rejected'
                .Where(p => p.Status == "paid")
                .Where(p => p.ProcessedAt >= startDate && p.ProcessedAt <= endDate);

            var totalPayouts = await totalPayoutsQuery.SumAsync(p => p.NetAmount);

            // 3. Lợi nhuận thực tế
            var actualProfit = totalRevenue - totalPayouts;

            // 4. Số lượng học viên mới (dựa trên đơn hàng đầu tiên)
            var newStudentsQuery = _context.Orders
                .Include(o => o.Payments)
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                .Where(o => o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)))
                .GroupBy(o => o.UserId)
                .Select(g => new { UserId = g.Key, FirstOrderDate = g.Min(x => x.OrderDate) })
                .Where(x => x.FirstOrderDate >= startDate && x.FirstOrderDate <= endDate);

            var newStudentsCount = await newStudentsQuery.CountAsync();

            // 5. Khóa học bán chạy (top 10)
            var bestSellingCoursesQuery = _context.OrderDetails
                .Include(od => od.Course)
                .Include(od => od.Order).ThenInclude(o => o.Payments)
                .Where(od => od.Order.OrderDate >= startDate && od.Order.OrderDate <= endDate)
                .Where(od => od.Order.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)))
                .GroupBy(od => new { od.CourseId, od.Course!.Title })
                .Select(g => new
                {
                    CourseId = g.Key.CourseId,
                    CourseTitle = g.Key.Title,
                    TotalSold = g.Sum(x => x.Quantity),
                    TotalRevenue = g.Sum(x => x.Price * x.Quantity)
                })
                .OrderByDescending(x => x.TotalSold)
                .Take(10);

            var bestSellingCourses = await bestSellingCoursesQuery.ToListAsync();

            // Thống kê bổ sung
            var totalOrders = await _context.Orders
                .Include(o => o.Payments)
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                .Where(o => o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)))
                .CountAsync();

            var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Số khóa học hoạt động (được bán trong kỳ)
            var activeCourseCount = await _context.OrderDetails
                .Include(od => od.Order).ThenInclude(o => o.Payments)
                .Where(od => od.Order.OrderDate >= startDate && od.Order.OrderDate <= endDate)
                .Where(od => od.Order.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)))
                .Select(od => od.CourseId)
                .Distinct()
                .CountAsync();

            return Ok(new
            {
                Period = new
                {
                    From = startDate == DateTime.MinValue ? (DateTime?)null : startDate,
                    To = endDate == DateTime.MaxValue ? (DateTime?)null : endDate,
                    PeriodType = period
                },
                Summary = new
                {
                    TotalRevenue = totalRevenue,
                    PreviousTotalRevenue = previousTotalRevenue,
                    RevenueChangePercent = previousTotalRevenue > 0 ? Math.Round(((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100, 2) : 0,
                    TotalPayouts = totalPayouts,
                    ActualProfit = actualProfit,
                    ProfitMargin = totalRevenue > 0 ? Math.Round((actualProfit / totalRevenue) * 100, 2) : 0,
                    NewStudentsCount = newStudentsCount,
                    TotalOrders = totalOrders,
                    AverageOrderValue = Math.Round(averageOrderValue, 2),
                    ActiveCourseCount = activeCourseCount
                },
                BestSellingCourses = bestSellingCourses
            });
        }

        // Phân tích doanh thu theo thời gian (ngày/tuần/tháng)
        [HttpGet("analysis")]
        public async Task<IActionResult> GetRevenueAnalysis(
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo,
            [FromQuery] int? courseId,
            [FromQuery] int? instructorId,
            [FromQuery] string groupBy = "month")
        {
            var startDate = dateFrom ?? DateTime.Now.AddMonths(-3);
            var endDate = dateTo ?? DateTime.Now;

            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Course).ThenInclude(c => c.Instructor)
                .Include(o => o.Payments)
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                .Where(o => o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)))
                .AsQueryable();

            // Bộ lọc
            if (courseId.HasValue)
                query = query.Where(o => o.OrderDetails.Any(od => od.CourseId == courseId.Value));

            if (instructorId.HasValue)
                query = query.Where(o => o.OrderDetails.Any(od => od.Course != null && od.Course.InstructorId == instructorId.Value));

            var orders = await query.OrderByDescending(o => o.OrderDate).ToListAsync();

            // Nhóm dữ liệu theo thời gian
            var groupedData = new List<object>();
            
            switch (groupBy.ToLower())
            {
                case "day":
                    groupedData = orders
                        .GroupBy(o => o.OrderDate.Date)
                        .Select(g => new
                        {
                            Date = g.Key,
                            Revenue = g.Sum(x => x.TotalAmount),
                            OrderCount = g.Count(),
                            StudentCount = g.Select(x => x.UserId).Distinct().Count()
                        })
                        .OrderByDescending(x => x.Date)
                        .Cast<object>()
                        .ToList();
                    break;

                case "month":
                    groupedData = orders
                        .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                        .Select(g => new
                        {
                            Year = g.Key.Year,
                            Month = g.Key.Month,
                            Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                            Revenue = g.Sum(x => x.TotalAmount),
                            OrderCount = g.Count(),
                            StudentCount = g.Select(x => x.UserId).Distinct().Count()
                        })
                        .OrderByDescending(x => x.Date)
                        .Cast<object>()
                        .ToList();
                    break;

                case "quarter":
                    groupedData = orders
                        .GroupBy(o => new { o.OrderDate.Year, Quarter = (o.OrderDate.Month - 1) / 3 + 1 })
                        .Select(g => new
                        {
                            Year = g.Key.Year,
                            Quarter = g.Key.Quarter,
                            Revenue = g.Sum(x => x.TotalAmount),
                            OrderCount = g.Count(),
                            StudentCount = g.Select(x => x.UserId).Distinct().Count()
                        })
                        .OrderByDescending(x => x.Year).ThenByDescending(x => x.Quarter)
                        .Cast<object>()
                        .ToList();
                    break;
            }

            return Ok(new
            {
                Data = groupedData,
                TotalCount = groupedData.Count,
                GroupBy = groupBy,
                Period = new { From = startDate, To = endDate }
            });
        }

        // Doanh thu theo khóa học
        [HttpGet("by-course")]
        public async Task<IActionResult> GetRevenueByCourse(
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo,
            [FromQuery] int? instructorId)
        {
            var startDate = dateFrom ?? DateTime.Now.AddMonths(-3);
            var endDate = dateTo ?? DateTime.Now;

            var query = _context.OrderDetails
                .Include(od => od.Course).ThenInclude(c => c.Instructor).ThenInclude(i => i.InstructorNavigation)
                .Include(od => od.Order).ThenInclude(o => o.Payments)
                .Where(od => od.Order.OrderDate >= startDate && od.Order.OrderDate <= endDate)
                .Where(od => od.Order.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)))
                .AsQueryable();

            if (instructorId.HasValue)
                query = query.Where(od => od.Course != null && od.Course.InstructorId == instructorId.Value);

            var courseRevenues = await query
                .GroupBy(od => new 
                { 
                    od.CourseId, 
                    CourseTitle = od.Course!.Title,
                    InstructorId = od.Course.InstructorId,
                    InstructorName = od.Course.Instructor != null ? od.Course.Instructor.InstructorNavigation!.FullName : "N/A"
                })
                .Select(g => new
                {
                    g.Key.CourseId,
                    g.Key.CourseTitle,
                    g.Key.InstructorId,
                    g.Key.InstructorName,
                    TotalRevenue = g.Sum(x => x.Price * x.Quantity),
                    TotalSold = g.Sum(x => x.Quantity),
                    OrderCount = g.Count(),
                    AveragePrice = g.Average(x => x.Price)
                })
                .OrderByDescending(x => x.TotalRevenue)
                .ToListAsync();

            // Tính toán payout cho mỗi khóa học
            var courseRevenueWithPayouts = new List<object>();
            foreach (var course in courseRevenues)
            {
                var totalPayouts = course.InstructorId.HasValue
                    ? await _context.Payouts
                        .Where(p => p.InstructorId == course.InstructorId.Value && p.Status == "paid")
                        .Where(p => p.ProcessedAt >= startDate && p.ProcessedAt <= endDate)
                        .SumAsync(p => p.NetAmount)
                    : 0;

                courseRevenueWithPayouts.Add(new
                {
                    course.CourseId,
                    course.CourseTitle,
                    course.InstructorId,
                    course.InstructorName,
                    course.TotalRevenue,
                    course.TotalSold,
                    course.OrderCount,
                    AveragePrice = Math.Round(course.AveragePrice, 2),
                    TotalPayouts = totalPayouts,
                    NetProfit = course.TotalRevenue - totalPayouts,
                    ProfitMargin = course.TotalRevenue > 0 ? Math.Round(((course.TotalRevenue - totalPayouts) / course.TotalRevenue) * 100, 2) : 0
                });
            }

            return Ok(new
            {
                Data = courseRevenueWithPayouts,
                TotalCount = courseRevenueWithPayouts.Count,
                Period = new { From = startDate, To = endDate }
            });
        }

        // Doanh thu theo giảng viên
        [HttpGet("by-instructor")]
        public async Task<IActionResult> GetRevenueByInstructor(
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo)
        {
            var startDate = dateFrom ?? DateTime.Now.AddMonths(-3);
            var endDate = dateTo ?? DateTime.Now;

            var instructorRevenues = await _context.OrderDetails
                .Include(od => od.Course).ThenInclude(c => c.Instructor).ThenInclude(i => i.InstructorNavigation)
                .Include(od => od.Order).ThenInclude(o => o.Payments)
                .Where(od => od.Order.OrderDate >= startDate && od.Order.OrderDate <= endDate)
                .Where(od => od.Order.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)))
                .Where(od => od.Course != null && od.Course.InstructorId.HasValue)
                .GroupBy(od => new 
                { 
                    InstructorId = od.Course!.InstructorId!.Value,
                    InstructorName = od.Course.Instructor!.InstructorNavigation!.FullName,
                    InstructorEmail = od.Course.Instructor.InstructorNavigation.Email
                })
                .Select(g => new
                {
                    g.Key.InstructorId,
                    g.Key.InstructorName,
                    g.Key.InstructorEmail,
                    TotalRevenue = g.Sum(x => x.Price * x.Quantity),
                    CourseCount = g.Select(x => x.CourseId).Distinct().Count(),
                    TotalSold = g.Sum(x => x.Quantity),
                    OrderCount = g.Count()
                })
                .OrderByDescending(x => x.TotalRevenue)
                .ToListAsync();

            // Tính toán payout cho mỗi giảng viên
            var instructorRevenueWithPayouts = new List<object>();
            foreach (var instructor in instructorRevenues)
            {
                var totalPayouts = await _context.Payouts
                    .Where(p => p.InstructorId == instructor.InstructorId && p.Status == "paid")
                    .Where(p => p.ProcessedAt >= startDate && p.ProcessedAt <= endDate)
                    .SumAsync(p => p.NetAmount);

                var pendingPayouts = await _context.Payouts
                    .Where(p => p.InstructorId == instructor.InstructorId && p.Status == "pending")
                    .SumAsync(p => p.NetAmount);

                instructorRevenueWithPayouts.Add(new
                {
                    instructor.InstructorId,
                    instructor.InstructorName,
                    instructor.InstructorEmail,
                    instructor.TotalRevenue,
                    instructor.CourseCount,
                    instructor.TotalSold,
                    instructor.OrderCount,
                    TotalPayouts = totalPayouts,
                    PendingPayouts = pendingPayouts,
                    NetProfit = instructor.TotalRevenue - totalPayouts,
                    AvailableForPayout = instructor.TotalRevenue - totalPayouts - pendingPayouts,
                    ProfitMargin = instructor.TotalRevenue > 0 ? Math.Round(((instructor.TotalRevenue - totalPayouts) / instructor.TotalRevenue) * 100, 2) : 0
                });
            }

            return Ok(new
            {
                Data = instructorRevenueWithPayouts,
                TotalCount = instructorRevenueWithPayouts.Count,
                Period = new { From = startDate, To = endDate }
            });
        }
        [HttpGet("trend")]
        public async Task<IActionResult> GetRevenueTrend(
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo,
            [FromQuery] string groupBy = "month")
        {
            var startDate = dateFrom ?? DateTime.Now.AddMonths(-12);
            var endDate = dateTo ?? DateTime.Now;

            var paidOrders = _context.Orders
                .Include(o => o.Payments)
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                .Where(o => o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)));

            var data = new List<object>();

            if (groupBy.Equals("day", StringComparison.OrdinalIgnoreCase))
            {
                var points = await paidOrders
                    .GroupBy(o => o.OrderDate.Date)
                    .Select(g => new
                    {
                        From = g.Key,
                        To = g.Key.AddDays(1).AddTicks(-1),
                        Label = g.Key.ToString("yyyy-MM-dd"),
                        TotalRevenue = g.Sum(x => x.TotalAmount),
                        OrderCount = g.Count(),
                        StudentCount = g.Select(x => x.UserId).Distinct().Count()
                    })
                    .OrderBy(x => x.From)
                    .ToListAsync();

                foreach (var pt in points)
                {
                    var payouts = await _context.Payouts
                        .Where(p => p.ProcessedAt >= pt.From && p.ProcessedAt <= pt.To)
                        .Where(p => p.Status == "paid")
                        .SumAsync(p => p.NetAmount);

                    data.Add(new
                    {
                        pt.From, pt.To, pt.Label,
                        pt.TotalRevenue,
                        TotalPayouts = payouts,
                        NetProfit = pt.TotalRevenue - payouts,
                        pt.OrderCount,
                        pt.StudentCount
                    });
                }
            }
            else if (groupBy.Equals("quarter", StringComparison.OrdinalIgnoreCase))
            {
                var points = await paidOrders
                    .GroupBy(o => new { o.OrderDate.Year, Quarter = ((o.OrderDate.Month - 1) / 3) + 1 })
                    .Select(g => new
                    {
                        Year = g.Key.Year,
                        Quarter = g.Key.Quarter,
                        From = new DateTime(g.Key.Year, ((g.Key.Quarter - 1) * 3) + 1, 1),
                        To = new DateTime(g.Key.Year, ((g.Key.Quarter - 1) * 3) + 1, 1).AddMonths(3).AddTicks(-1),
                        Label = $"Q{g.Key.Quarter}-{g.Key.Year}",
                        TotalRevenue = g.Sum(x => x.TotalAmount),
                        OrderCount = g.Count(),
                        StudentCount = g.Select(x => x.UserId).Distinct().Count()
                    })
                    .OrderBy(x => x.Year).ThenBy(x => x.Quarter)
                    .ToListAsync();

                foreach (var pt in points)
                {
                    var payouts = await _context.Payouts
                        .Where(p => p.ProcessedAt >= pt.From && p.ProcessedAt <= pt.To)
                        .Where(p => p.Status == "paid")
                        .SumAsync(p => p.NetAmount);

                    data.Add(new
                    {
                        pt.From, pt.To, pt.Label,
                        pt.TotalRevenue,
                        TotalPayouts = payouts,
                        NetProfit = pt.TotalRevenue - payouts,
                        pt.OrderCount,
                        pt.StudentCount
                    });
                }
            }
            else
            {
                // groupBy: month (mặc định)
                var points = await paidOrders
                    .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                    .Select(g => new
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        From = new DateTime(g.Key.Year, g.Key.Month, 1),
                        To = new DateTime(g.Key.Year, g.Key.Month, 1).AddMonths(1).AddTicks(-1),
                        Label = $"{g.Key.Year}-{g.Key.Month:D2}",
                        TotalRevenue = g.Sum(x => x.TotalAmount),
                        OrderCount = g.Count(),
                        StudentCount = g.Select(x => x.UserId).Distinct().Count()
                    })
                    .OrderBy(x => x.Year).ThenBy(x => x.Month)
                    .ToListAsync();

                foreach (var pt in points)
                {
                    var payouts = await _context.Payouts
                        .Where(p => p.ProcessedAt >= pt.From && p.ProcessedAt <= pt.To)
                        .Where(p => p.Status == "paid")
                        .SumAsync(p => p.NetAmount);

                    data.Add(new
                    {
                        pt.From, pt.To, pt.Label,
                        pt.TotalRevenue,
                        TotalPayouts = payouts,
                        NetProfit = pt.TotalRevenue - payouts,
                        pt.OrderCount,
                        pt.StudentCount
                    });
                }
            }

            return Ok(new
            {
                GroupBy = groupBy,
                Period = new { From = startDate, To = endDate },
                Data = data
            });
        }
    }
}
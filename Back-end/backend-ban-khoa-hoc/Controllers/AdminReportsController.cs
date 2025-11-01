using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;
using System.Text.Json.Serialization;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    public class CombinedRevenueResponse
    {
        [JsonPropertyName("Data")] public List<object> Data { get; set; } = new();
        [JsonPropertyName("Summary")] public RevenueSummaryDto Summary { get; set; } = new RevenueSummaryDto();
    }

    public class RevenueDailyPoint
    {
        [JsonPropertyName("Date")] public DateTime Date { get; set; }
        [JsonPropertyName("TotalAmount")] public decimal TotalAmount { get; set; }
        [JsonPropertyName("Count")] public int Count { get; set; }
    }

    public class RevenueMonthlyPoint
    {
        [JsonPropertyName("Year")] public int Year { get; set; }
        [JsonPropertyName("Month")] public int Month { get; set; }
        [JsonPropertyName("Label")] public string Label { get; set; } = string.Empty;
        [JsonPropertyName("TotalAmount")] public decimal TotalAmount { get; set; }
        [JsonPropertyName("Count")] public int Count { get; set; }
    }

    public class RevenueQuarterlyPoint
    {
        [JsonPropertyName("Year")] public int Year { get; set; }
        [JsonPropertyName("Quarter")] public int Quarter { get; set; }
        [JsonPropertyName("Label")] public string Label { get; set; } = string.Empty;
        [JsonPropertyName("TotalAmount")] public decimal TotalAmount { get; set; }
        [JsonPropertyName("Count")] public int Count { get; set; }
    }

    public class RevenueSummaryDto
    {
        [JsonPropertyName("TotalRevenue")] public decimal TotalRevenue { get; set; }
        [JsonPropertyName("TotalOrders")] public int TotalOrders { get; set; }
        [JsonPropertyName("NewStudentsCount")] public int NewStudentsCount { get; set; }
        [JsonPropertyName("ActiveCourseCount")] public int ActiveCourseCount { get; set; }
        [JsonPropertyName("AverageOrderValue")] public decimal AverageOrderValue { get; set; }
    }
    [Route("api/admin/reports")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminReportsController(AppDbContext context)
        {
            _context = context;
        }

        // Paid status hợp lệ (so sánh không phân biệt hoa thường)
        private static readonly HashSet<string> PaidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "Paid", "Success", "Completed"
        };

        // Doanh thu theo ngày
        [HttpGet("revenue/daily")]
        public async Task<IActionResult> GetRevenueDaily([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var start = from ?? DateTime.UtcNow.Date.AddDays(-30);
            var end = to ?? DateTime.UtcNow.Date;

            var data = await _context.Payments
                .AsNoTracking()
                .Where(p => p.PaidAt != null
                    && p.PaidAt!.Value.Date >= start.Date
                    && p.PaidAt!.Value.Date <= end.Date
                    && PaidStatuses.Contains(p.PaymentStatus))
                .GroupBy(p => p.PaidAt!.Value.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    TotalAmount = g.Sum(x => x.Amount),
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            return Ok(new { From = start, To = end, Data = data });
        }

        // Doanh thu theo tháng (mặc định: năm hiện tại)
        [HttpGet("revenue/monthly")]
        public async Task<IActionResult> GetRevenueMonthly([FromQuery] int? year)
        {
            var y = year ?? DateTime.UtcNow.Year;

            var data = await _context.Payments
                .AsNoTracking()
                .Where(p => p.PaidAt != null
                    && p.PaidAt!.Value.Year == y
                    && PaidStatuses.Contains(p.PaymentStatus))
                .GroupBy(p => new { p.PaidAt!.Value.Year, p.PaidAt!.Value.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Label = $"{g.Key.Year}-{g.Key.Month:D2}",
                    TotalAmount = g.Sum(x => x.Amount),
                    Count = g.Count()
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            return Ok(new { Year = y, Data = data });
        }

        // Doanh thu theo quý (mặc định: năm hiện tại)
        [HttpGet("revenue/quarterly")]
        public async Task<IActionResult> GetRevenueQuarterly([FromQuery] int? year)
        {
            var y = year ?? DateTime.UtcNow.Year;

            var data = await _context.Payments
                .AsNoTracking()
                .Where(p => p.PaidAt != null
                    && p.PaidAt!.Value.Year == y
                    && PaidStatuses.Contains(p.PaymentStatus))
                .GroupBy(p => new
                {
                    Year = p.PaidAt!.Value.Year,
                    Quarter = ((p.PaidAt!.Value.Month - 1) / 3) + 1
                })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Quarter,
                    Label = $"Q{g.Key.Quarter}-{g.Key.Year}",
                    TotalAmount = g.Sum(x => x.Amount),
                    Count = g.Count()
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Quarter)
                .ToListAsync();

            return Ok(new { Year = y, Data = data });
        }

        // Học viên đăng ký mới theo ngày
        [HttpGet("students/new")]
        public async Task<IActionResult> GetNewStudents([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var start = from ?? DateTime.UtcNow.Date.AddDays(-30);
            var end = to ?? DateTime.UtcNow.Date;

            var data = await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Where(u => u.CreatedAt.Date >= start.Date
                    && u.CreatedAt.Date <= end.Date
                    && u.UserRoles.Any(ur => ur.Role.RoleName == "student"))
                .GroupBy(u => u.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    NewStudents = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            return Ok(new { From = start, To = end, Data = data });
        }

        // Tổng hợp nhanh: doanh thu + số hóa đơn paid + số học viên mới + số lượt đăng ký mới
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var start = from ?? DateTime.UtcNow.Date.AddDays(-30);
            var end = to ?? DateTime.UtcNow.Date;

            var paidPayments = await _context.Payments
                .AsNoTracking()
                .Where(p => p.PaidAt != null
                    && p.PaidAt!.Value.Date >= start.Date
                    && p.PaidAt!.Value.Date <= end.Date
                    && PaidStatuses.Contains(p.PaymentStatus))
                .ToListAsync();

            var newStudents = await _context.Users
                .AsNoTracking()
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Where(u => u.CreatedAt.Date >= start.Date
                    && u.CreatedAt.Date <= end.Date
                    && u.UserRoles.Any(ur => ur.Role.RoleName == "student"))
                .CountAsync();

            var newEnrollments = await _context.Enrollments
                .AsNoTracking()
                .Where(e => e.EnrollDate.Date >= start.Date
                        && e.EnrollDate.Date <= end.Date)
                .CountAsync();

            return Ok(new
            {
                From = start,
                To = end,
                TotalRevenue = paidPayments.Sum(p => p.Amount),
                PaidPaymentsCount = paidPayments.Count,
                NewStudentsCount = newStudents,
                NewEnrollmentsCount = newEnrollments
            });
        }

        [HttpGet("revenue/combined")]
        public async Task<IActionResult> GetRevenueCombined([FromQuery] string? period = "month", [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null, [FromQuery] int? year = null)
        {
            var p = (period ?? "month").ToLowerInvariant();

            if (p == "day")
            {
                var start = from ?? DateTime.UtcNow.Date.AddDays(-30);
                var end = to ?? DateTime.UtcNow.Date;

                var points = await _context.Payments
                    .AsNoTracking()
                    .Where(pm => pm.PaidAt != null
                        && pm.PaidAt!.Value.Date >= start.Date
                        && pm.PaidAt!.Value.Date <= end.Date
                        && PaidStatuses.Contains(pm.PaymentStatus))
                    .GroupBy(pm => pm.PaidAt!.Value.Date)
                    .Select(g => new RevenueDailyPoint
                    {
                        Date = g.Key,
                        TotalAmount = g.Sum(x => x.Amount),
                        Count = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                var ordersQuery = _context.Orders
                    .Include(o => o.Payments)
                    .Where(o => o.OrderDate.Date >= start.Date && o.OrderDate.Date <= end.Date)
                    .Where(o => o.Payments.Any(pm => PaidStatuses.Contains(pm.PaymentStatus)));

                var totalOrders = await ordersQuery.CountAsync();
                var totalRevenue = points.Sum(pt => pt.TotalAmount);
                var avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

                var newStudents = await _context.Users
                    .AsNoTracking()
                    .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                    .Where(u => u.CreatedAt.Date >= start.Date
                        && u.CreatedAt.Date <= end.Date
                        && u.UserRoles.Any(ur => ur.Role.RoleName == "student"))
                    .CountAsync();

                var activeCourses = await _context.OrderDetails
                    .Include(od => od.Order).ThenInclude(o => o.Payments)
                    .Where(od => od.Order.OrderDate.Date >= start.Date && od.Order.OrderDate.Date <= end.Date)
                    .Where(od => od.Order.Payments.Any(pm => PaidStatuses.Contains(pm.PaymentStatus)))
                    .Select(od => od.CourseId)
                    .Distinct()
                    .CountAsync();

                var summary = new RevenueSummaryDto
                {
                    TotalRevenue = totalRevenue,
                    TotalOrders = totalOrders,
                    NewStudentsCount = newStudents,
                    ActiveCourseCount = activeCourses,
                    AverageOrderValue = avgOrder
                };

                var response = new CombinedRevenueResponse
                {
                    Data = points.Select(p => (object)p).ToList(),
                    Summary = summary
                };
                return Ok(response);
            }

            if (p == "month")
            {
                var y = year ?? DateTime.UtcNow.Year;

                var points = await _context.Payments
                    .AsNoTracking()
                    .Where(pm => pm.PaidAt != null
                        && pm.PaidAt!.Value.Year == y
                        && PaidStatuses.Contains(pm.PaymentStatus))
                    .GroupBy(pm => new { pm.PaidAt!.Value.Year, pm.PaidAt!.Value.Month })
                    .Select(g => new RevenueMonthlyPoint
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        Label = $"{g.Key.Year}-{g.Key.Month:D2}",
                        TotalAmount = g.Sum(x => x.Amount),
                        Count = g.Count()
                    })
                    .OrderBy(x => x.Year).ThenBy(x => x.Month)
                    .ToListAsync();

                // Summary for the entire requested year 'y'
                var startOfYear = new DateTime(y, 1, 1);
                var endOfYear = new DateTime(y, 12, 31, 23, 59, 59, 999);

                var ordersQuery = _context.Orders
                    .Include(o => o.Payments)
                    .Where(o => o.OrderDate >= startOfYear && o.OrderDate <= endOfYear)
                    .Where(o => o.Payments.Any(pm => PaidStatuses.Contains(pm.PaymentStatus)));

                var totalOrders = await ordersQuery.CountAsync();
                var totalRevenue = points.Sum(pt => pt.TotalAmount);
                var avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

                var newStudents = await _context.Users
                    .AsNoTracking()
                    .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                    .Where(u => u.CreatedAt >= startOfYear && u.CreatedAt <= endOfYear
                        && u.UserRoles.Any(ur => ur.Role.RoleName == "student"))
                    .CountAsync();

                var activeCourses = await _context.OrderDetails
                    .Include(od => od.Order).ThenInclude(o => o.Payments)
                    .Where(od => od.Order.OrderDate >= startOfYear && od.Order.OrderDate <= endOfYear)
                    .Where(od => od.Order.Payments.Any(pm => PaidStatuses.Contains(pm.PaymentStatus)))
                    .Select(od => od.CourseId)
                    .Distinct()
                    .CountAsync();

                var summary = new RevenueSummaryDto
                {
                    TotalRevenue = totalRevenue,
                    TotalOrders = totalOrders,
                    NewStudentsCount = newStudents,
                    ActiveCourseCount = activeCourses,
                    AverageOrderValue = avgOrder
                };

                var response = new CombinedRevenueResponse
                {
                    Data = points.Select(p => (object)p).ToList(),
                    Summary = summary
                };
                return Ok(response);
            }

            {
                var y = year ?? DateTime.UtcNow.Year;

                var points = await _context.Payments
                    .AsNoTracking()
                    .Where(pm => pm.PaidAt != null
                        && pm.PaidAt!.Value.Year == y
                        && PaidStatuses.Contains(pm.PaymentStatus))
                    .GroupBy(pm => new { Year = pm.PaidAt!.Value.Year, Quarter = ((pm.PaidAt!.Value.Month - 1) / 3) + 1 })
                    .Select(g => new RevenueQuarterlyPoint
                    {
                        Year = g.Key.Year,
                        Quarter = g.Key.Quarter,
                        Label = $"Q{g.Key.Quarter}-{g.Key.Year}",
                        TotalAmount = g.Sum(x => x.Amount),
                        Count = g.Count()
                    })
                    .OrderBy(x => x.Year).ThenBy(x => x.Quarter)
                    .ToListAsync();

                // Summary for the entire requested year 'y'
                var startOfYear = new DateTime(y, 1, 1);
                var endOfYear = new DateTime(y, 12, 31, 23, 59, 59, 999);

                var ordersQuery = _context.Orders
                    .Include(o => o.Payments)
                    .Where(o => o.OrderDate >= startOfYear && o.OrderDate <= endOfYear)
                    .Where(o => o.Payments.Any(pm => PaidStatuses.Contains(pm.PaymentStatus)));

                var totalOrders = await ordersQuery.CountAsync();
                var totalRevenue = points.Sum(pt => pt.TotalAmount);
                var avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

                var newStudents = await _context.Users
                    .AsNoTracking()
                    .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                    .Where(u => u.CreatedAt >= startOfYear && u.CreatedAt <= endOfYear
                        && u.UserRoles.Any(ur => ur.Role.RoleName == "student"))
                    .CountAsync();

                var activeCourses = await _context.OrderDetails
                    .Include(od => od.Order).ThenInclude(o => o.Payments)
                    .Where(od => od.Order.OrderDate >= startOfYear && od.Order.OrderDate <= endOfYear)
                    .Where(od => od.Order.Payments.Any(pm => PaidStatuses.Contains(pm.PaymentStatus)))
                    .Select(od => od.CourseId)
                    .Distinct()
                    .CountAsync();

                var summary = new RevenueSummaryDto
                {
                    TotalRevenue = totalRevenue,
                    TotalOrders = totalOrders,
                    NewStudentsCount = newStudents,
                    ActiveCourseCount = activeCourses,
                    AverageOrderValue = avgOrder
                };

                var response = new CombinedRevenueResponse
                {
                    Data = points.Select(p => (object)p).ToList(),
                    Summary = summary
                };
                return Ok(response);
            }
        }
    }
}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [ApiController]
    [Route("admin/dashboard")]
    [Authorize(Roles = "Admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        private static readonly HashSet<string> PaidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "paid", "success", "completed"
        };

        public AdminDashboardController(AppDbContext context)
        {
            _context = context;
        }

        // Tổng quan dashboard: doanh thu tuần, % thay đổi, tỉ lệ chốt giao dịch, mục tiêu (tỉ lệ hoàn thành khóa học)
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var now = DateTime.UtcNow;
            var startCurrent = now.Date.AddDays(-6); // 7 ngày gần nhất (bao gồm hôm nay)
            var endCurrent = now.Date.AddDays(1);
            var startPrev = startCurrent.AddDays(-7);
            var endPrev = startCurrent;

            // Doanh thu tuần hiện tại (Payments có trạng thái paid/success/completed trong khoảng PaidAt)
            var currentWeekRevenue = await _context.Payments
                .Where(p => p.PaidAt >= startCurrent && p.PaidAt < endCurrent && PaidStatuses.Contains(p.PaymentStatus))
                .SumAsync(p => (decimal?)p.Amount) ?? 0m;

            var prevWeekRevenue = await _context.Payments
                .Where(p => p.PaidAt >= startPrev && p.PaidAt < endPrev && PaidStatuses.Contains(p.PaymentStatus))
                .SumAsync(p => (decimal?)p.Amount) ?? 0m;

            var revenueChangePercent = prevWeekRevenue == 0m
                ? (currentWeekRevenue > 0m ? 100m : 0m)
                : Math.Round((currentWeekRevenue - prevWeekRevenue) / prevWeekRevenue * 100m, 2);

            // Tỉ lệ chốt giao dịch: đơn hàng tạo trong 7 ngày và có ít nhất 1 payment thành công
            var ordersCurrentQuery = _context.Orders.Where(o => o.OrderDate >= startCurrent && o.OrderDate < endCurrent);
            var ordersPrevQuery = _context.Orders.Where(o => o.OrderDate >= startPrev && o.OrderDate < endPrev);

            var totalOrdersCurrent = await ordersCurrentQuery.CountAsync();
            var totalOrdersPrev = await ordersPrevQuery.CountAsync();

            var closedOrdersCurrent = await ordersCurrentQuery
                .Where(o => o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)))
                .CountAsync();

            var closedOrdersPrev = await ordersPrevQuery
                .Where(o => o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)))
                .CountAsync();

            var successRateCurrent = totalOrdersCurrent == 0 ? 0m : Math.Round((decimal)closedOrdersCurrent / totalOrdersCurrent * 100m, 2);
            var successRatePrev = totalOrdersPrev == 0 ? 0m : Math.Round((decimal)closedOrdersPrev / totalOrdersPrev * 100m, 2);
            var successRateChangePercent = Math.Round(successRateCurrent - successRatePrev, 2);

            // Mục tiêu: tỉ lệ hoàn thành khóa học (Enrollments.Status == 'completed')
            var totalEnrollments = await _context.Enrollments.CountAsync();

            // ✅ Sửa lỗi: bỏ StringComparison, thay bằng ToLower() để EF Core có thể dịch sang SQL
            var completedEnrollments = await _context.Enrollments
                .CountAsync(e => e.Status != null && e.Status.ToLower() == "completed");

            var completionPercent = totalEnrollments == 0 ? 0m : Math.Round((decimal)completedEnrollments / totalEnrollments * 100m, 2);

            return Ok(new
            {
                revenue = new
                {
                    currentWeek = currentWeekRevenue,
                    previousWeek = prevWeekRevenue,
                    changePercent = revenueChangePercent
                },
                successRate = new
                {
                    currentWeekClosed = closedOrdersCurrent,
                    currentWeekTotal = totalOrdersCurrent,
                    currentPercent = successRateCurrent,
                    previousPercent = successRatePrev,
                    changePercent = successRateChangePercent
                },
                goals = new
                {
                    completionPercent = completionPercent
                }
            });
        }

        // Khách hàng mới nhất: danh sách sinh viên tạo gần đây
        [HttpGet("customers/recent")]
        public async Task<IActionResult> GetRecentCustomers([FromQuery] int limit = 10)
        {
            var students = await _context.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Where(u => u.UserRoles.Any(ur => ur.Role.RoleName == "student"))
                .OrderByDescending(u => u.CreatedAt)
                .Take(limit)
                .Select(u => new
                {
                    userId = u.UserId,
                    fullName = u.FullName,
                    email = u.Email,
                    status = u.Status,
                    createdAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(new { items = students });
        }

        // Tốc độ tăng trưởng người dùng: groupBy=month|year
        [HttpGet("growth/users")]
        public async Task<IActionResult> GetUserGrowth([FromQuery] string? groupBy = "year", [FromQuery] int range = 7)
        {
            if (string.Equals(groupBy, "month", StringComparison.OrdinalIgnoreCase))
            {
                var start = DateTime.UtcNow.AddMonths(-range + 1);
                var points = await _context.Users
                    .Where(u => u.Status != "deleted" && u.CreatedAt >= start)
                    .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
                    .Select(g => new { period = $"{g.Key.Year}-{g.Key.Month:D2}", newUsers = g.Count() })
                    .OrderBy(p => p.period)
                    .ToListAsync();

                return Ok(new { groupBy = "month", points });
            }
            else
            {
                var start = DateTime.UtcNow.AddYears(-range + 1);
                var points = await _context.Users
                    .Where(u => u.Status != "deleted" && u.CreatedAt >= start)
                    .GroupBy(u => u.CreatedAt.Year)
                    .Select(g => new { period = g.Key, newUsers = g.Count() })
                    .OrderBy(p => p.period)
                    .ToListAsync();

                return Ok(new { groupBy = "year", points });
            }
        }

        // Top khóa học theo doanh thu (dựa trên OrderDetails của các đơn đã có payment thành công)
        [HttpGet("courses/top")]
        public async Task<IActionResult> GetTopCourses([FromQuery] int days = 90, [FromQuery] int limit = 5)
        {
            var to = DateTime.UtcNow.Date.AddDays(1);
            var from = to.AddDays(-days);

            var paidOrderIds = await _context.Payments
                .Where(p => p.OrderId.HasValue && PaidStatuses.Contains(p.PaymentStatus) && p.PaidAt >= from && p.PaidAt < to)
                .Select(p => p.OrderId!.Value)
                .Distinct()
                .ToListAsync();

            var revenueByCourse = await _context.OrderDetails
                .Include(od => od.Course)
                .Where(od => paidOrderIds.Contains(od.OrderId))
                .GroupBy(od => new { od.CourseId, Title = od.Course.Title })
                .Select(g => new
                {
                    courseId = g.Key.CourseId,
                    title = g.Key.Title,
                    revenue = g.Sum(x => x.Price * x.Quantity)
                })
                .OrderByDescending(x => x.revenue)
                .Take(limit)
                .ToListAsync();

            // Đếm lượt đăng ký trong khoảng thời gian
            var enrollCounts = await _context.Enrollments
                .Where(e => e.EnrollDate >= from && e.EnrollDate < to)
                .GroupBy(e => e.CourseId)
                .Select(g => new { courseId = g.Key, count = g.Count() })
                .ToDictionaryAsync(x => x.courseId, x => x.count);

            var items = revenueByCourse.Select(rc => new
            {
                rc.courseId,
                rc.title,
                rc.revenue,
                enrollCount = enrollCounts.TryGetValue(rc.courseId, out var c) ? c : 0
            });

            return Ok(new { from, to, items });
        }

        // Danh sách khóa học cần duyệt (status mặc định: draft/pending)
        [HttpGet("courses/pending-approval")]
        public async Task<IActionResult> GetPendingApprovalCourses([FromQuery] string? status = "draft")
        {
            var statuses = (status ?? "draft").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(s => s.Split(':')[0].ToLowerInvariant())
                .ToHashSet();

            var query = _context.Courses
                .Include(c => c.Instructor).ThenInclude(i => i.InstructorNavigation)
                .Where(c => c.Status != null && statuses.Contains(c.Status.ToLower()));

            var items = await query
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    courseId = c.CourseId,
                    title = c.Title,
                    status = c.Status,
                    createdAt = c.CreatedAt,
                    instructorName = c.Instructor != null ? c.Instructor.InstructorNavigation.FullName : null
                })
                .ToListAsync();

            return Ok(new { items });
        }
    }
}

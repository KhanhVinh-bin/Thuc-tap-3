using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [ApiController]
    [Route("api/admin/orders")]
    [Authorize(Roles = "Admin")]
    public class AdminOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Các trạng thái thanh toán hợp lệ (không phân biệt hoa thường)
        private static readonly HashSet<string> PaidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "paid", "success", "completed"
        };

        public AdminOrdersController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<IActionResult> GetOrders(
            [FromQuery] int? studentId,
            [FromQuery] string? studentName,
            [FromQuery] int? courseId,
            [FromQuery] string? courseTitle,
            [FromQuery] string? paymentStatus, // "pending" hoặc "paid"
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo)
        {
            // Bước 1: Tải danh sách đơn cơ bản, tránh JOIN sâu để không sinh SQL lỗi
            var baseQuery = _context.Orders
                .AsNoTracking()
                .Include(o => o.User)
                .Include(o => o.Payments)
                .AsQueryable();

            if (studentId.HasValue)
                baseQuery = baseQuery.Where(o => o.UserId == studentId.Value);

            if (!string.IsNullOrWhiteSpace(studentName))
                baseQuery = baseQuery.Where(o => o.User != null && o.User.FullName.Contains(studentName));

            if (dateFrom.HasValue)
                baseQuery = baseQuery.Where(o => o.OrderDate >= dateFrom.Value);
            if (dateTo.HasValue)
                baseQuery = baseQuery.Where(o => o.OrderDate <= dateTo.Value);

            if (!string.IsNullOrWhiteSpace(paymentStatus))
            {
                var ps = paymentStatus.Trim().ToLower();
                if (ps == "paid")
                {
                    baseQuery = baseQuery.Where(o =>
                        o.Status == "paid" ||
                        o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)));
                }
                else if (ps == "pending")
                {
                    baseQuery = baseQuery.Where(o =>
                        o.Status != "paid" &&
                        !o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)));
                }
            }

            var ordersBasic = await baseQuery
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            if (ordersBasic.Count == 0)
                return Ok(Array.Empty<object>());

            var orderIds = ordersBasic.Select(o => o.OrderId).ToList();

            // Bước 2: Tải chi tiết đơn (Course + Instructor) theo OrderId, gom nhóm theo đơn
            var details = await _context.OrderDetails
                .AsNoTracking()
                .Where(od => orderIds.Contains(od.OrderId))
                .Include(od => od.Course).ThenInclude(c => c.Instructor).ThenInclude(i => i.InstructorNavigation)
                .ToListAsync();

            var detailsByOrder = details
                .GroupBy(od => od.OrderId)
                .ToDictionary(g => g.Key, g => g.ToList());

            // Lọc theo courseId và courseTitle sau khi đã có chi tiết
            IEnumerable<Du_An_Web_Ban_Khoa_Hoc.Models.Order> filtered = ordersBasic;

            if (courseId.HasValue)
            {
                filtered = filtered.Where(o =>
                    detailsByOrder.TryGetValue(o.OrderId, out var list) &&
                    list.Any(d => d.CourseId == courseId.Value));
            }

            if (!string.IsNullOrWhiteSpace(courseTitle))
            {
                var title = courseTitle.Trim();
                filtered = filtered.Where(o =>
                    detailsByOrder.TryGetValue(o.OrderId, out var list) &&
                    list.Any(d => d.Course != null && (d.Course.Title ?? "").Contains(title)));
            }

            var result = new List<object>();

            foreach (var o in filtered)
            {
                var isPaid =
                    o.Status == "paid" ||
                    o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus));

                var courseTitles = detailsByOrder.TryGetValue(o.OrderId, out var list1)
                    ? list1.Select(od => od.Course != null ? od.Course.Title : null)
                          .Where(t => !string.IsNullOrEmpty(t))
                          .ToList()
                    : new List<string>();

                var instructorNames = detailsByOrder.TryGetValue(o.OrderId, out var list2)
                    ? list2.Select(od => od.Course?.Instructor?.InstructorNavigation?.FullName)
                           .Where(n => !string.IsNullOrWhiteSpace(n))
                           .Distinct()
                           .ToList()
                    : new List<string>();

                var courseIdsForStatus = detailsByOrder.TryGetValue(o.OrderId, out var list3)
                    ? list3.Select(od => od.CourseId).Distinct().ToList()
                    : new List<int>();

                string courseStatus = "Incomplete";
                if (o.UserId.HasValue && courseIdsForStatus.Count > 0)
                {
                    var completedCount = await _context.Enrollments
                        .AsNoTracking()
                        .Where(e => e.UserId == o.UserId && courseIdsForStatus.Contains(e.CourseId)
                                    && e.Status == "completed")
                        .Select(e => e.CourseId)
                        .Distinct()
                        .CountAsync();

                    courseStatus = completedCount == courseIdsForStatus.Count ? "Completed" : "Incomplete";
                }

                result.Add(new
                {
                    OrderId = o.OrderId,
                    Student = o.User?.FullName,
                    StudentEmail = o.User?.Email,
                    Instructors = instructorNames,
                    Courses = courseTitles,
                    Price = o.TotalAmount,
                    PaymentStatus = isPaid ? "Paid" : "Pending",
                    CourseStatus = courseStatus,
                    CreatedAt = o.OrderDate
                });
            }

            return Ok(result);
        }
        [HttpGet("summary")]
        public async Task<IActionResult> GetOrdersSummary(
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo)
        {
            var ordersQuery = _context.Orders.AsNoTracking().AsQueryable();
            if (dateFrom.HasValue) ordersQuery = ordersQuery.Where(o => o.OrderDate >= dateFrom.Value);
            if (dateTo.HasValue) ordersQuery = ordersQuery.Where(o => o.OrderDate <= dateTo.Value);

            var orderIdsInRange = await ordersQuery.Select(o => o.OrderId).ToListAsync();

            // Doanh thu: tính theo Payments success (theo DB)
            var totalRevenue = await _context.Payments
                .AsNoTracking()
                .Where(p => p.OrderId.HasValue && orderIdsInRange.Contains(p.OrderId.Value))
                .Where(p => p.PaymentStatus == "success")
                .SumAsync(p => (decimal?)p.Amount) ?? 0m;

            // Đơn chờ thanh toán: chưa có payment success và Orders.Status != 'paid'
            var pendingPaymentsCount = await _context.Orders
                .AsNoTracking()
                .Where(o => orderIdsInRange.Contains(o.OrderId))
                .Where(o => o.Status != "paid")
                .Where(o => !_context.Payments.Any(p => p.OrderId == o.OrderId && p.PaymentStatus == "success"))
                .CountAsync();

            // Số đơn có khóa học hoàn thành (học viên hoàn thành tất cả khóa trong đơn)
            var ordersInRange = await _context.Orders
                .AsNoTracking()
                .Where(o => orderIdsInRange.Contains(o.OrderId))
                .Select(o => new { o.OrderId, o.UserId })
                .ToListAsync();

            var orderDetails = await _context.OrderDetails
                .AsNoTracking()
                .Where(od => orderIdsInRange.Contains(od.OrderId))
                .Select(od => new { od.OrderId, od.CourseId })
                .ToListAsync();

            var detailsMap = orderDetails.GroupBy(d => d.OrderId)
                                         .ToDictionary(g => g.Key, g => g.Select(x => x.CourseId).Distinct().ToList());

            int completedOrdersCount = 0;
            foreach (var o in ordersInRange)
            {
                var courseIds = detailsMap.TryGetValue(o.OrderId, out var list) ? list : new List<int>();
                if (o.UserId.HasValue && courseIds.Count > 0)
                {
                    var completedCount = await _context.Enrollments
                        .AsNoTracking()
                        .Where(e => e.UserId == o.UserId && courseIds.Contains(e.CourseId) && e.Status == "completed")
                        .Select(e => e.CourseId)
                        .Distinct()
                        .CountAsync();

                    if (completedCount == courseIds.Count)
                        completedOrdersCount++;
                }
            }

            // Payout giảng viên còn pending (theo DB)
            var pendingInstructorPayoutsCount = await _context.Payouts
                .AsNoTracking()
                .Where(p => p.Status == "pending")
                .CountAsync();

            return Ok(new
            {
                TotalRevenue = totalRevenue,
                PendingPayments = pendingPaymentsCount,
                CompletedOrders = completedOrdersCount,
                PendingInstructorPayouts = pendingInstructorPayoutsCount
            });
        }
    }
    // Đóng namespace bị thiếu
}
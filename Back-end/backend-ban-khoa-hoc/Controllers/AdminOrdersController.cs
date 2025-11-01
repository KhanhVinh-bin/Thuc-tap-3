using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [ApiController]
    [Route("admin/orders")]
    [Authorize(Roles = "Admin")]
    public class AdminOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Trạng thái “đã thanh toán” hợp lệ (khớp data: paid/success/completed)
        private static readonly HashSet<string> PaidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "paid", "success", "completed"
        };

        public AdminOrdersController(AppDbContext context)
        {
            _context = context;
        }

        // Trang danh sách đơn hàng: filter theo học viên, khóa học, trạng thái thanh toán, ngày tạo
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
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Course)
                .Include(o => o.Payments)
                .AsQueryable();

            if (studentId.HasValue)
                query = query.Where(o => o.UserId == studentId.Value);

            if (!string.IsNullOrWhiteSpace(studentName))
                query = query.Where(o => o.User != null && o.User.FullName.Contains(studentName));

            if (courseId.HasValue)
                query = query.Where(o => o.OrderDetails.Any(od => od.CourseId == courseId.Value));

            if (!string.IsNullOrWhiteSpace(courseTitle))
                query = query.Where(o => o.OrderDetails.Any(od => od.Course != null && od.Course.Title.Contains(courseTitle)));

            if (dateFrom.HasValue)
                query = query.Where(o => o.OrderDate >= dateFrom.Value);
            if (dateTo.HasValue)
                query = query.Where(o => o.OrderDate <= dateTo.Value);

            if (!string.IsNullOrWhiteSpace(paymentStatus))
            {
                if (paymentStatus.Equals("paid", StringComparison.OrdinalIgnoreCase))
                    query = query.Where(o => o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)));
                else if (paymentStatus.Equals("pending", StringComparison.OrdinalIgnoreCase))
                    query = query.Where(o => !o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus)));
            }

            // Materialize dữ liệu rồi mới tính trạng thái khóa học để tránh lỗi EF client projection
            var orders = await query
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var result = new List<object>();
            foreach (var o in orders)
            {
                var isPaid = o.Payments.Any(p => PaidStatuses.Contains(p.PaymentStatus));
                var courseTitles = o.OrderDetails.Select(od => od.Course != null ? od.Course.Title : null)
                                                 .Where(t => t != null)
                                                 .ToList();

                // Tính trạng thái khóa học (dựa vào Enrollments.Status == 'completed' theo DB)
                var courseIds = o.OrderDetails.Select(od => od.CourseId).Distinct().ToList();
                string courseStatus = "Incomplete";
                if (o.UserId.HasValue && courseIds.Count > 0)
                {
                    var completedCount = await _context.Enrollments
                        .Where(e => e.UserId == o.UserId && courseIds.Contains(e.CourseId) && e.Status.Equals("completed", StringComparison.OrdinalIgnoreCase))
                        .Select(e => e.CourseId)
                        .Distinct()
                        .CountAsync();

                    courseStatus = completedCount == courseIds.Count ? "Completed" : "Incomplete";
                }

                result.Add(new
                {
                    OrderId = o.OrderId,
                    Student = o.User?.FullName,
                    Courses = courseTitles,
                    Price = o.TotalAmount,
                    PaymentStatus = isPaid ? "Paid" : "Pending",
                    CourseStatus = courseStatus,
                    CreatedAt = o.OrderDate
                });
            }

            return Ok(result);
        }

        // Trang chi tiết đơn hàng
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetOrderDetail(int id)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Course).ThenInclude(c => c.Instructor).ThenInclude(i => i.InstructorNavigation)
                .Include(o => o.Payments).ThenInclude(p => p.PaymentVerifications)
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            // Lấy payment mới nhất dựa trên PaidAt/PaymentId
            var latestPayment = order.Payments
                .OrderByDescending(p => p.PaidAt.HasValue)
                .ThenByDescending(p => p.PaidAt)
                .ThenByDescending(p => p.PaymentId)
                .FirstOrDefault();

            // Nhật ký thanh toán (PaymentVerifications)
            List<PaymentLogItem> paymentLogs = latestPayment == null
                ? new List<PaymentLogItem>()
                : latestPayment.PaymentVerifications
                    .OrderBy(v => v.VerifiedAt)
                    .Select(v => new PaymentLogItem
                    {
                        VerifiedAt = v.VerifiedAt,
                        Status = v.Status,
                        VerifiedBy = v.VerifiedByNavigation?.FullName,
                        Notes = v.Notes
                    })
                    .ToList();

            // Nhật ký chi trả giảng viên: Payouts liên quan tới các giảng viên của đơn
            var instructorIds = order.OrderDetails
                .Where(od => od.Course != null && od.Course.InstructorId.HasValue)
                .Select(od => od.Course!.InstructorId!.Value)
                .Distinct()
                .ToList();

            var payouts = await _context.Payouts
                .Where(p => instructorIds.Contains(p.InstructorId) && p.Notes != null && p.Notes.Contains($"Order#{order.OrderId}"))
                .Include(p => p.Instructor).ThenInclude(i => i.InstructorNavigation)
                .OrderBy(p => p.RequestedAt)
                .Select(p => new
                {
                    p.PayoutId,
                    Instructor = (p.Instructor != null && p.Instructor.InstructorNavigation != null)
                        ? p.Instructor.InstructorNavigation.FullName
                        : null,
                    p.Amount,
                    p.PlatformFee,
                    p.NetAmount,
                    p.Status,
                    p.RequestedAt,
                    p.ProcessedAt,
                    p.Notes
                })
                .ToListAsync();

            var detail = new
            {
                OrderId = order.OrderId,
                CreatedAt = order.OrderDate,
                Student = order.User != null ? new { order.User.UserId, order.User.FullName, order.User.Email } : null,
                Items = order.OrderDetails.Select(od => new
                {
                    od.CourseId,
                    Title = od.Course != null ? od.Course.Title : null,
                    od.Price,
                    od.Quantity,
                    Instructor = (od.Course != null && od.Course.Instructor != null && od.Course.Instructor.InstructorNavigation != null)
                        ? od.Course.Instructor.InstructorNavigation.FullName
                        : null
                }).ToList(),
                Payment = latestPayment == null ? null : new
                {
                    latestPayment.PaymentMethod,
                    latestPayment.TransactionId,
                    latestPayment.Amount,
                    latestPayment.PaymentStatus,
                    latestPayment.PaidAt
                },
                PaymentHistory = paymentLogs,
                InstructorPayoutHistory = payouts
            };

            return Ok(detail);
        }
    }
}

public class PaymentLogItem
{
    public DateTime VerifiedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? VerifiedBy { get; set; }
    public string? Notes { get; set; }
}
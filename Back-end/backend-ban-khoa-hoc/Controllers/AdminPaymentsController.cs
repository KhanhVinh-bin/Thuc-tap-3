using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [ApiController]
    [Route("admin/payments")]
    [Authorize(Roles = "Admin")]
    public class AdminPaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        private static readonly HashSet<string> PaidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "paid", "success", "completed"
        };

        public AdminPaymentsController(AppDbContext context)
        {
            _context = context;
        }

        // Danh sách thanh toán + filter: học viên, khóa học, trạng thái, ngày
        [HttpGet]
        public async Task<IActionResult> GetPayments(
            [FromQuery] int? studentId,
            [FromQuery] string? studentName,
            [FromQuery] int? orderId,
            [FromQuery] int? courseId,
            [FromQuery] string? status, // pending/success/failed/paid/completed
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo)
        {
            var query = _context.Payments
                .Include(p => p.Order).ThenInclude(o => o.User)
                .Include(p => p.Order).ThenInclude(o => o.OrderDetails).ThenInclude(od => od.Course)
                .AsQueryable();

            if (orderId.HasValue)
                query = query.Where(p => p.OrderId == orderId.Value);

            if (studentId.HasValue)
                query = query.Where(p => p.Order != null && p.Order.UserId == studentId.Value);

            if (!string.IsNullOrWhiteSpace(studentName))
                query = query.Where(p => p.Order != null && p.Order.User != null && p.Order.User.FullName.Contains(studentName));

            if (courseId.HasValue)
                query = query.Where(p => p.Order != null && p.Order.OrderDetails.Any(od => od.CourseId == courseId.Value));

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(p => p.PaymentStatus.Equals(status, StringComparison.OrdinalIgnoreCase));

            if (dateFrom.HasValue)
                query = query.Where(p => p.PaidAt != null && p.PaidAt!.Value >= dateFrom.Value);
            if (dateTo.HasValue)
                query = query.Where(p => p.PaidAt != null && p.PaidAt!.Value <= dateTo.Value);

            var data = await query
                .OrderByDescending(p => p.PaidAt.HasValue)
                .ThenByDescending(p => p.PaidAt)
                .ThenByDescending(p => p.PaymentId)
                .Select(p => new
                {
                    p.PaymentId,
                    p.OrderId,
                    Student = p.Order != null && p.Order.User != null ? p.Order.User.FullName : null,
                    Amount = p.Amount,
                    Method = p.PaymentMethod,
                    TransactionId = p.TransactionId,
                    Status = p.PaymentStatus,
                    PaidAt = p.PaidAt
                })
                .ToListAsync();

            return Ok(data);
        }

        // Chi tiết thanh toán theo OrderId (bao gồm lịch sử xác minh)
        [HttpGet("order/{orderId:int}")]
        public async Task<IActionResult> GetPaymentDetailByOrder(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Payments).ThenInclude(p => p.PaymentVerifications)
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            var latestPayment = order.Payments
                .OrderByDescending(p => p.PaidAt.HasValue)
                .ThenByDescending(p => p.PaidAt)
                .ThenByDescending(p => p.PaymentId)
                .FirstOrDefault();

            var verifications = latestPayment == null
                ? new List<PaymentVerificationItem>()
                : latestPayment.PaymentVerifications
                    .OrderBy(v => v.VerifiedAt)
                    .Select(v => new PaymentVerificationItem
                    {
                        VerifiedAt = v.VerifiedAt,
                        Status = v.Status,
                        VerifiedBy = v.VerifiedByNavigation?.FullName,
                        Notes = v.Notes
                    })
                    .ToList();

            return Ok(new
            {
                OrderId = order.OrderId,
                Student = order.User != null ? new { order.User.UserId, order.User.FullName, order.User.Email } : null,
                LatestPayment = latestPayment == null ? null : new
                {
                    latestPayment.PaymentId,
                    latestPayment.PaymentMethod,
                    latestPayment.TransactionId,
                    latestPayment.Amount,
                    latestPayment.PaymentStatus,
                    latestPayment.PaidAt
                },
                Verifications = verifications
            });
        }

        // Xác nhận thanh toán (đặt PaymentStatus = "success", cập nhật PaidAt, thêm PaymentVerification)
        [HttpPatch("order/{orderId:int}/confirm")]
        public async Task<IActionResult> ConfirmPaymentForOrder(int orderId, [FromBody] ConfirmPaymentRequest request)
        {
            var order = await _context.Orders
                .Include(o => o.Payments)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            var payment = order.Payments
                .OrderByDescending(p => p.PaidAt.HasValue)
                .ThenByDescending(p => p.PaidAt)
                .ThenByDescending(p => p.PaymentId)
                .FirstOrDefault();

            if (payment == null)
            {
                payment = new Payment
                {
                    OrderId = order.OrderId,
                    PaymentMethod = request.PaymentMethod ?? "Manual",
                    TransactionId = request.TransactionId,
                    Amount = request.Amount ?? order.TotalAmount,
                    PaymentStatus = "success",
                    PaidAt = DateTime.UtcNow,
                    RawResponse = request.RawResponse
                };
                _context.Payments.Add(payment);
            }
            else
            {
                payment.PaymentMethod = request.PaymentMethod ?? payment.PaymentMethod;
                payment.TransactionId = request.TransactionId ?? payment.TransactionId;
                payment.Amount = request.Amount ?? payment.Amount;
                payment.PaymentStatus = "success";
                payment.PaidAt = DateTime.UtcNow;
                payment.RawResponse = request.RawResponse ?? payment.RawResponse;
            }

            // Thêm xác minh
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? adminId = null;
            if (int.TryParse(adminIdClaim, out var parsed)) adminId = parsed;

            _context.PaymentVerifications.Add(new PaymentVerification
            {
                Payment = payment,
                VerifiedAt = DateTime.UtcNow,
                VerifiedBy = adminId,
                Status = "verified",
                Notes = request.VerificationNotes
            });

            // Cập nhật trạng thái đơn
            order.Status = "paid";

            // Log
            _context.Logs.Add(new Log
            {
                UserId = order.UserId,
                Action = "PaymentConfirmed",
                Details = $"Order#{order.OrderId} Amount={payment.Amount}",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xác nhận thanh toán" });
        }

        // Chi trả giảng viên cho đơn hàng (yêu cầu khóa học hoàn thành nếu requireCompleted = true)
        [HttpPost("order/{orderId:int}/payout-instructors")]
        public async Task<IActionResult> PayoutInstructorsForOrder(int orderId, [FromBody] PayoutInstructorRequest request)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails).ThenInclude(od => od.Course).ThenInclude(c => c.Instructor)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            var byInstructor = order.OrderDetails
                .Where(od => od.Course != null && od.Course.InstructorId.HasValue)
                .GroupBy(od => od.Course!.InstructorId!.Value)
                .Select(g => new
                {
                    InstructorId = g.Key,
                    Amount = g.Sum(x => x.Price * x.Quantity)
                })
                .ToList();

            if (!byInstructor.Any())
                return BadRequest(new { message = "Không có giảng viên liên quan đến đơn hàng này" });

            // Yêu cầu các khóa học trong đơn đã completed (Enrollments.Status == 'completed')
            if (request.RequireCompleted == true && order.UserId.HasValue)
            {
                var courseIds = order.OrderDetails.Select(od => od.CourseId).Distinct().ToList();
                var completedCount = await _context.Enrollments
                    .Where(e => e.UserId == order.UserId && courseIds.Contains(e.CourseId) && e.Status.Equals("completed", StringComparison.OrdinalIgnoreCase))
                    .Select(e => e.CourseId)
                    .Distinct()
                    .CountAsync();

                if (completedCount != courseIds.Count)
                    return BadRequest(new { message = "Khóa học trong đơn chưa hoàn thành, chưa thể chi trả giảng viên" });
            }

            var feePercent = request.PlatformFeePercent ?? 0m;
            var created = new List<object>();

            foreach (var item in byInstructor)
            {
                var fee = Math.Round(item.Amount * feePercent / 100m, 2);
                var net = item.Amount - fee;

                var payout = new Payout
                {
                    InstructorId = item.InstructorId,
                    Amount = item.Amount,
                    RequestedAt = DateTime.UtcNow,
                    ProcessedAt = DateTime.UtcNow,
                    Status = "paid",
                    PlatformFee = fee,
                    NetAmount = net,
                    Notes = $"Order#{order.OrderId} payout"
                };
                _context.Payouts.Add(payout);

                created.Add(new { payout.InstructorId, payout.Amount, payout.PlatformFee, payout.NetAmount, payout.Status });
            }

            _context.Logs.Add(new Log
            {
                UserId = order.UserId,
                Action = "InstructorPayoutProcessed",
                Details = $"Order#{order.OrderId} items={created.Count}",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã ghi nhận chi trả giảng viên", payouts = created });
        }

        // Gửi lại email xác nhận (stub log)
        [HttpPost("order/{orderId:int}/resend-confirmation-email")]
        public async Task<IActionResult> ResendConfirmationEmail(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            _context.Logs.Add(new Log
            {
                UserId = order.UserId,
                Action = "ResendConfirmationEmail",
                Details = $"Order#{order.OrderId} resend email to {order.User?.Email}",
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã gửi lại email xác nhận (stub)" });
        }
    }

    public class ConfirmPaymentRequest
    {
        public string? PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public decimal? Amount { get; set; }
        public string? RawResponse { get; set; }
        public string? VerificationNotes { get; set; }
    }

    public class PaymentVerificationItem
    {
        public DateTime VerifiedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? VerifiedBy { get; set; }
        public string? Notes { get; set; }
    }

    public class PayoutInstructorRequest
    {
        public decimal? PlatformFeePercent { get; set; } = 0m;
        public bool? RequireCompleted { get; set; } = true;
    }
}
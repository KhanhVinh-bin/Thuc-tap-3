using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Microsoft.AspNetCore.Authorization;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [ApiController]
    [Route("api/admin/payouts")]
    [Authorize(Roles = "Admin")]
    public class AdminPayoutsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminPayoutsController(AppDbContext context)
        {
            _context = context;
        }

        // Danh sách thu nhập giảng viên với bộ lọc
        [HttpGet]
        public async Task<IActionResult> GetPayouts(
            [FromQuery] int? instructorId,
            [FromQuery] int? courseId,
            [FromQuery] string? status)
        {
            var query = _context.Payouts
                .Include(p => p.Instructor).ThenInclude(i => i.InstructorNavigation)
                .AsQueryable();

            // Bộ lọc
            if (instructorId.HasValue)
                query = query.Where(p => p.InstructorId == instructorId.Value);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(p => p.Status.ToLower() == status.ToLower());

            // Lọc theo khóa học (thông qua OrderDetails)
            if (courseId.HasValue)
            {
                var instructorIds = await _context.Courses
                    .Where(c => c.CourseId == courseId.Value && c.InstructorId.HasValue)
                    .Select(c => c.InstructorId!.Value)
                    .ToListAsync();

                query = query.Where(p => instructorIds.Contains(p.InstructorId));
            }

            var payouts = await query
                .OrderByDescending(p => p.RequestedAt)
                .ToListAsync();

            // Tính toán doanh thu khóa học cho mỗi giảng viên
            var payoutData = new List<object>();
            foreach (var payout in payouts)
            {
                // Tính tổng doanh thu từ các khóa học của giảng viên
                var courseRevenue = await _context.OrderDetails
                    .Include(od => od.Course)
                    .Where(od => od.Course != null && od.Course.InstructorId == payout.InstructorId)
                    .SumAsync(od => od.Price * od.Quantity);

                // Tính % hoa hồng (giả sử platform fee là % giữ lại)
                var commissionPercent = payout.Amount > 0 ? Math.Round((payout.PlatformFee / payout.Amount) * 100, 2) : 0;

                payoutData.Add(new
                {
                    PayoutId = payout.PayoutId,
                    Instructor = new
                    {
                        InstructorId = payout.InstructorId,
                        FullName = payout.Instructor?.InstructorNavigation?.FullName ?? "N/A",
                        Email = payout.Instructor?.InstructorNavigation?.Email ?? "N/A"
                    },
                    CourseRevenue = courseRevenue,
                    CommissionPercent = commissionPercent,
                    AmountHeld = payout.PlatformFee,
                    PayoutAmount = payout.NetAmount,
                    Status = payout.Status,
                    RequestedAt = payout.RequestedAt,
                    ProcessedAt = payout.ProcessedAt,
                    Notes = payout.Notes
                });
            }

            return Ok(payoutData);
        }

        // Chi tiết thu nhập theo giảng viên
        [HttpGet("instructor/{instructorId:int}")]
        public async Task<IActionResult> GetInstructorPayoutDetail(int instructorId)
        {
            var instructor = await _context.Instructors
                .Include(i => i.InstructorNavigation)
                .Include(i => i.Payouts)
                .Include(i => i.Courses)
                .FirstOrDefaultAsync(i => i.InstructorId == instructorId);

            if (instructor == null)
                return NotFound(new { message = "Không tìm thấy giảng viên" });

            // Tổng hợp doanh thu theo khóa học
            var courseRevenues = await _context.OrderDetails
                .Include(od => od.Course)
                .Where(od => od.Course != null && od.Course.InstructorId == instructorId)
                .GroupBy(od => new { od.Course!.CourseId, od.Course.Title })
                .Select(g => new
                {
                    CourseId = g.Key.CourseId,
                    CourseTitle = g.Key.Title,
                    TotalRevenue = g.Sum(od => od.Price * od.Quantity),
                    TotalOrders = g.Count()
                })
                .ToListAsync();

            // Lịch sử thanh toán
            var payoutHistory = instructor.Payouts
                .OrderByDescending(p => p.RequestedAt)
                .Select(p => new
                {
                    p.PayoutId,
                    p.Amount,
                    p.PlatformFee,
                    p.NetAmount,
                    p.Status,
                    p.RequestedAt,
                    p.ProcessedAt,
                    p.Notes
                })
                .ToList();

            // Tổng kết
            var totalRevenue = courseRevenues.Sum(cr => cr.TotalRevenue);
            var totalPaidOut = instructor.Payouts.Where(p => p.Status == "Processed").Sum(p => p.NetAmount);
            var totalPending = instructor.Payouts.Where(p => p.Status == "Pending").Sum(p => p.NetAmount);

            return Ok(new
            {
                Instructor = new
                {
                    instructor.InstructorId,
                    FullName = instructor.InstructorNavigation?.FullName,
                    Email = instructor.InstructorNavigation?.Email,
                    instructor.PayoutMethod,
                    instructor.PayoutAccount,
                    instructor.LastPayoutDate
                },
                Summary = new
                {
                    TotalRevenue = totalRevenue,
                    TotalPaidOut = totalPaidOut,
                    TotalPending = totalPending,
                    AvailableForPayout = totalRevenue - totalPaidOut - totalPending
                },
                CourseRevenues = courseRevenues,
                PayoutHistory = payoutHistory
            });
        }

        // Xem chi tiết hoa hồng theo payout
        [HttpGet("{payoutId:int}")]
        public async Task<IActionResult> GetPayoutDetail(int payoutId)
        {
            var payout = await _context.Payouts
                .Include(p => p.Instructor).ThenInclude(i => i.InstructorNavigation)
                .FirstOrDefaultAsync(p => p.PayoutId == payoutId);

            if (payout == null)
                return NotFound(new { message = "Không tìm thấy bản ghi payout" });

            // Tìm các khóa học liên quan (dựa trên notes hoặc thời gian)
            var relatedCourses = await _context.Courses
                .Where(c => c.InstructorId == payout.InstructorId)
                .Select(c => new
                {
                    c.CourseId,
                    c.Title,
                    c.Price,
                    StudentsEnrolled = c.OrderDetails.Sum(od => od.Quantity)
                })
                .ToListAsync();

            return Ok(new
            {
                Payout = new
                {
                    payout.PayoutId,
                    payout.Amount,
                    payout.PlatformFee,
                    payout.NetAmount,
                    payout.Status,
                    payout.RequestedAt,
                    payout.ProcessedAt,
                    payout.Notes
                },
                Instructor = new
                {
                    payout.InstructorId,
                    FullName = payout.Instructor?.InstructorNavigation?.FullName,
                    Email = payout.Instructor?.InstructorNavigation?.Email
                },
                RelatedCourses = relatedCourses,
                CommissionBreakdown = new
                {
                    GrossAmount = payout.Amount,
                    PlatformFee = payout.PlatformFee,
                    CommissionRate = payout.Amount > 0 ? Math.Round((payout.PlatformFee / payout.Amount) * 100, 2) : 0,
                    NetPayout = payout.NetAmount
                }
            });
        }

        // Xác nhận chuyển tiền cho giảng viên
        [HttpPatch("{payoutId:int}/confirm")]
        public async Task<IActionResult> ConfirmPayout(int payoutId, [FromBody] ConfirmPayoutRequest request)
        {
            var payout = await _context.Payouts
                .Include(p => p.Instructor)
                .FirstOrDefaultAsync(p => p.PayoutId == payoutId);

            if (payout == null)
                return NotFound(new { message = "Không tìm thấy bản ghi payout" });

            if (payout.Status == "Processed")
                return BadRequest(new { message = "Payout đã được xử lý trước đó" });

            // Cập nhật trạng thái
            payout.Status = "Processed";
            payout.ProcessedAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(request.Notes))
                payout.Notes = request.Notes;

            // Cập nhật LastPayoutDate cho instructor
            if (payout.Instructor != null)
                payout.Instructor.LastPayoutDate = DateTime.UtcNow;

            // Log
            _context.Logs.Add(new Log
            {
                Action = "PayoutConfirmed",
                Details = $"PayoutId#{payoutId} Amount={payout.NetAmount} InstructorId={payout.InstructorId}",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xác nhận chuyển tiền thành công" });
        }

        // Tạo payout mới cho giảng viên
        [HttpPost("create")]
        public async Task<IActionResult> CreatePayout([FromBody] CreatePayoutRequest request)
        {
            var instructor = await _context.Instructors.FindAsync(request.InstructorId);
            if (instructor == null)
                return NotFound(new { message = "Không tìm thấy giảng viên" });

            // Tính toán số tiền có thể chi trả
            var totalRevenue = await _context.OrderDetails
                .Include(od => od.Course)
                .Where(od => od.Course != null && od.Course.InstructorId == request.InstructorId)
                .SumAsync(od => od.Price * od.Quantity);

            var totalPaidOut = await _context.Payouts
                .Where(p => p.InstructorId == request.InstructorId && p.Status == "Processed")
                .SumAsync(p => p.NetAmount);

            var availableAmount = totalRevenue - totalPaidOut;

            if (request.Amount > availableAmount)
                return BadRequest(new { message = $"Số tiền yêu cầu vượt quá số tiền có thể chi trả ({availableAmount:C})" });

            var platformFee = Math.Round(request.Amount * (request.PlatformFeePercent ?? 10) / 100, 2);
            var netAmount = request.Amount - platformFee;

            var payout = new Payout
            {
                InstructorId = request.InstructorId,
                Amount = request.Amount,
                PlatformFee = platformFee,
                NetAmount = netAmount,
                Status = "Pending",
                RequestedAt = DateTime.UtcNow,
                Notes = request.Notes
            };

            _context.Payouts.Add(payout);

            // Log
            _context.Logs.Add(new Log
            {
                Action = "PayoutCreated",
                Details = $"InstructorId={request.InstructorId} Amount={request.Amount} NetAmount={netAmount}",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã tạo yêu cầu payout thành công",
                PayoutId = payout.PayoutId,
                Amount = payout.Amount,
                PlatformFee = payout.PlatformFee,
                NetAmount = payout.NetAmount
            });
        }

        // Lấy lịch sử chi trả theo giảng viên
        [HttpGet("instructor/{instructorId:int}/history")]
        public async Task<IActionResult> GetPayoutHistory(int instructorId)
        {
            var payouts = await _context.Payouts
                .Where(p => p.InstructorId == instructorId)
                .OrderByDescending(p => p.RequestedAt)
                .Select(p => new
                {
                    p.PayoutId,
                    p.Amount,
                    p.PlatformFee,
                    p.NetAmount,
                    p.Status,
                    p.RequestedAt,
                    p.ProcessedAt,
                    p.Notes
                })
                .ToListAsync();

            return Ok(payouts);
        }

        // Xuất báo cáo PDF (stub)
        [HttpGet("instructor/{instructorId:int}/report")]
        public async Task<IActionResult> ExportInstructorReport(int instructorId)
        {
            // TODO: Implement PDF generation
            return Ok(new { message = "Xuất báo cáo PDF (chức năng đang phát triển)" });
        }
    }

    // DTO Classes
    public class ConfirmPayoutRequest
    {
        public string? Notes { get; set; }
    }

    public class CreatePayoutRequest
    {
        public int InstructorId { get; set; }
        public decimal Amount { get; set; }
        public decimal? PlatformFeePercent { get; set; } = 10m;
        public string? Notes { get; set; }
    }
}
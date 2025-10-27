using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
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
    }
}
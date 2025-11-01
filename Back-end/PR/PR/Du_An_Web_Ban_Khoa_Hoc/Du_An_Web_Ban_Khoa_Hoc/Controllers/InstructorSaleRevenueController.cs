using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;
using Microsoft.AspNetCore.Authorization;
using Azure.Core;
using NuGet.Common;
using Microsoft.CodeAnalysis.Elfie.Serialization;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Hosting;
using Du_An_Web_Ban_Khoa_Hoc.Models.DTO;
using System.Security.Claims;

using ClosedXML.Excel;
using System.IO;


namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [Authorize(Roles = "instructor")]
    [Route("api/[Controller]")]
    [ApiController]
    public class InstructorSaleRevenueController : Controller
    {
      private readonly AppDbContext _context;

    public InstructorSaleRevenueController (AppDbContext context)
    {
        _context = context;
    }

        //Get: Tính tổng doanh thu hiện tại và so sánh doanh thu tháng này với tháng trước (tăng hoặc giảm)
        [Authorize(Roles = "instructor")]
        [HttpGet("summary")]
        public async Task<IActionResult> GetRevenueSummary()
        {
            // Lấy InstructorID từ token
            var instructorId = int.Parse(User.FindFirst("InstructorId").Value);

            // Xác định thời gian (dùng múi giờ VN)
            var now = DateTime.Now;
            var startCurrentMonth = new DateTime(now.Year, now.Month, 1);
            var startPreviousMonth = startCurrentMonth.AddMonths(-1);
            var endPreviousMonth = startCurrentMonth.AddDays(-1);

            // Tổng doanh thu tháng hiện tại
            var currentMonthRevenue = await (from c in _context.Courses
                                             join od in _context.OrderDetails on c.CourseId equals od.CourseId
                                             join o in _context.Orders on od.OrderId equals o.OrderId
                                             where c.InstructorId == instructorId
                                                   && o.Status == "paid"
                                                   && o.OrderDate >= startCurrentMonth
                                                   && o.OrderDate <= now
                                             select (decimal?)(od.Price * od.Quantity))
                                             .SumAsync() ?? 0;

            // Tổng doanh thu tháng trước
            var previousMonthRevenue = await (from c in _context.Courses
                                              join od in _context.OrderDetails on c.CourseId equals od.CourseId
                                              join o in _context.Orders on od.OrderId equals o.OrderId
                                              where c.InstructorId == instructorId
                                                    && o.Status == "paid"
                                                    && o.OrderDate >= startPreviousMonth
                                                    && o.OrderDate <= endPreviousMonth
                                              select (decimal?)(od.Price * od.Quantity))
                                              .SumAsync() ?? 0;

            // Tổng doanh thu tích lũy từ khi mở tài khoản
            var totalRevenue = await (from c in _context.Courses
                                      join od in _context.OrderDetails on c.CourseId equals od.CourseId
                                      join o in _context.Orders on od.OrderId equals o.OrderId
                                      where c.InstructorId == instructorId
                                            && o.Status == "paid"
                                      select (decimal?)(od.Price * od.Quantity))
                                      .SumAsync() ?? 0;

            // Tính % thay đổi doanh thu
            decimal percentChange = 0;
            if (previousMonthRevenue > 0)
            {
                percentChange = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
            }
            else if (currentMonthRevenue > 0)
            {
                percentChange = 100;
            }

            // Trả về kết quả
            return Ok(new
            {
                totalRevenue,           // Tổng doanh thu tích lũy ( từ lúc tạo tài khoản )
                currentMonthRevenue,    // Doanh thu tháng hiện tại
                previousMonthRevenue,   // Doanh thu tháng trước
                percentChange           // % tăng/giảm so với tháng trước
            });
        }


        //Get: Tính số dư khả dụng của giảng viên
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/Order/So_du_kha_dung_cua_Giang_vien")]
        public async Task<ActionResult<InstructorBalanceDTO>> GetBalance()
        {
            // Lấy InstructorID từ JWT Claims
            var instructorIdClaim = User.FindFirst("InstructorId")?.Value;
            if (string.IsNullOrEmpty(instructorIdClaim)) return Unauthorized();
            int instructorId = int.Parse(instructorIdClaim);

            // 1. Tổng doanh thu từ các khóa học đã bán (Orders đã paid)
            var totalEarnings = await (from c in _context.Courses
                                       join od in _context.OrderDetails on c.CourseId equals od.CourseId
                                       join o in _context.Orders on od.OrderId equals o.OrderId
                                       where c.InstructorId == instructorId
                                             && o.Status == "paid"
                                       select od.Price * od.Quantity).SumAsync();

            // 2. Tổng payout đang pending
            var pendingPayouts = await _context.Payouts
                                               .Where(p => p.InstructorId == instructorId && p.Status == "pending")
                                               .SumAsync(p => (decimal?)p.NetAmount) ?? 0;

            // 3. Tổng payout đã paid
            var withdrawn = await _context.Payouts
                                          .Where(p => p.InstructorId == instructorId && p.Status == "paid")
                                          .SumAsync(p => (decimal?)p.NetAmount) ?? 0;

            // 4. Số dư khả dụng
            var availableBalance = totalEarnings - withdrawn - pendingPayouts;

            var result = new InstructorBalanceDTO
            {
                TotalEarnings = totalEarnings,
                PendingPayouts = pendingPayouts,
                Withdrawn = withdrawn,
                AvailableBalance = availableBalance
            };

            return Ok(result);
        }

        //Get: Doanh thu tháng hiện tại
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/current-month/Doanh_thu_theo_thang")]
        public async Task<ActionResult<object>> GetCurrentMonthRevenue()
        {
            var instructorId = int.Parse(User.FindFirst("InstructorId").Value);

            var now = DateTime.UtcNow;
            var startMonth = new DateTime(now.Year, now.Month, 1);

            var query = from c in _context.Courses
                        join od in _context.OrderDetails on c.CourseId equals od.CourseId
                        join o in _context.Orders on od.OrderId equals o.OrderId
                        where c.InstructorId == instructorId && o.Status == "paid"
                              && o.OrderDate >= startMonth
                        select new { od.Price, od.Quantity, c.CourseId };

            var totalRevenue = await query.SumAsync(x => x.Price * x.Quantity);
            var courseCount = await query.Select(x => x.CourseId).Distinct().CountAsync();

            return Ok(new
            {
                month = $"{now.Month}/{now.Year}",
                totalRevenue,
                courseSold = courseCount
            });
        }

        //Get: Biểu đồ doanh thu 6 tháng gần nhất
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/chart/Bieu_do_doanh_thu_trong_6_thang_gan_nhat")]
        public async Task<ActionResult<IEnumerable<object>>> GetRevenueChart()
        {
            var instructorId = int.Parse(User.FindFirst("InstructorId").Value);
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-5);

            var chartData = await (from c in _context.Courses
                                   join od in _context.OrderDetails on c.CourseId equals od.CourseId
                                   join o in _context.Orders on od.OrderId equals o.OrderId
                                   where c.InstructorId == instructorId && o.Status == "paid"
                                         && o.OrderDate >= sixMonthsAgo
                                   group od by new { o.OrderDate.Year, o.OrderDate.Month } into g
                                   orderby g.Key.Year, g.Key.Month
                                   select new
                                   {
                                       label = $"T{g.Key.Month}/{g.Key.Year % 100}",
                                       revenue = g.Sum(x => x.Price * x.Quantity)
                                   }).ToListAsync();

            return Ok(chartData);
        }


        //-----Rút tiền-----

        //Get: số dư khả dụng (đã sẵn sàng rút tiền)
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/available-balance/So_du_kha_dung")]
        public async Task<IActionResult> GetAvailableBalance()
        {
            var instructorId = int.Parse(User.FindFirst("InstructorId").Value);

            // Tổng doanh thu đã thanh toán (chỉ tính đơn hàng "paid")
            var totalEarnings = await (from c in _context.Courses
                                       join od in _context.OrderDetails on c.CourseId equals od.CourseId
                                       join o in _context.Orders on od.OrderId equals o.OrderId
                                       where c.InstructorId == instructorId && o.Status == "paid"
                                       select (decimal?)(od.Price * od.Quantity))
                                       .SumAsync() ?? 0;

            // Tổng tiền đã rút thành công (Status = "paid")
            var totalWithdrawn = await _context.Payouts
                .Where(p => p.InstructorId == instructorId && p.Status == "paid")
                .Select(p => (decimal?)p.Amount)
                .SumAsync() ?? 0;

            // Tổng tiền rút đang chờ xử lý (Status = "pending")
            var totalPendingWithdraw = await _context.Payouts
                .Where(p => p.InstructorId == instructorId && p.Status == "pending")
                .Select(p => (decimal?)p.Amount)
                .SumAsync() ?? 0;

            // Số dư khả dụng (có thể rút ngay)
            var availableBalance = totalEarnings - totalWithdrawn - totalPendingWithdraw;

            return Ok(new
            {
                totalEarnings,
                totalWithdrawn,
                totalPendingWithdraw,
                availableBalance
            });
        }


        //Get: Lấy số dư đang chờ
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/pending-balance/So_du_dang_cho_xu_ly")]
        public async Task<IActionResult> GetPendingBalance()
        {
            var instructorId = int.Parse(User.FindFirst("InstructorId").Value);

            // Doanh thu từ đơn hàng đang chờ thanh toán
            var pendingOrders = await (from c in _context.Courses
                                       join od in _context.OrderDetails on c.CourseId equals od.CourseId
                                       join o in _context.Orders on od.OrderId equals o.OrderId
                                       where c.InstructorId == instructorId && o.Status == "pending"
                                       select (decimal?)(od.Price * od.Quantity))
                                       .SumAsync() ?? 0;

            // Số tiền rút đang chờ xử lý
            var pendingPayouts = await _context.Payouts
                .Where(p => p.InstructorId == instructorId && p.Status == "pending")
                .Select(p => (decimal?)p.Amount)
                .SumAsync() ?? 0;

            var totalPending = pendingOrders + pendingPayouts;

            return Ok(new
            {
                pendingOrders,
                pendingPayouts,
                totalPending
            });
        }

        //Post: Form yêu cầu rút tiền
        [Authorize]
        [HttpPost("Post/request/Form_yeu_cau_rut_tien")]
        public async Task<IActionResult> CreatePayout([FromBody] CreatePayoutRequest req)
        {
            var instructorId = int.Parse(User.FindFirst("InstructorID").Value);

            // Tổng doanh thu hợp lệ
            var totalRevenue = await (from c in _context.Courses
                                      join od in _context.OrderDetails on c.CourseId equals od.CourseId
                                      join o in _context.Orders on od.OrderId equals o.OrderId
                                      where c.InstructorId == instructorId && o.Status == "paid"
                                      select (decimal?)(od.Price * od.Quantity))
                                      .SumAsync() ?? 0;

            // Tổng tiền đã rút hoặc đang xử lý
            var totalPayouts = await _context.Payouts
                .Where(p => p.InstructorId == instructorId && (p.Status == "pending" || p.Status == "paid"))
                .Select(p => (decimal?)p.Amount)
                .SumAsync() ?? 0;

            // Tính số dư khả dụng
            var availableBalance = totalRevenue - totalPayouts;

            if (availableBalance <= 0)
                return BadRequest(new { message = "Bạn không có số dư khả dụng để rút tiền." });

            // Xử lý logic “Rút tất cả”
            decimal requestAmount = req.Amount <= 0 ? availableBalance : req.Amount;

            //  Gợi ý hợp lệ (500k, 1m, 2m, 5m, hoặc “rút tất cả”)
            var allowedSuggestions = new List<decimal> { 500000, 1000000, 2000000, 5000000, availableBalance };
            if (!allowedSuggestions.Contains(requestAmount) && requestAmount != availableBalance)
                return BadRequest(new
                {
                    message = "Số tiền rút không hợp lệ. Bạn chỉ có thể chọn 500k, 1m, 2m, 5m hoặc rút toàn bộ."
                });

            // Kiểm tra số dư
            if (requestAmount > availableBalance)
                return BadRequest(new { message = "Số dư khả dụng không đủ để rút số tiền này." });

            // Tính phí (0.5%)
            var fee = Math.Round(requestAmount * 0.005m, 0);
            var netAmount = requestAmount - fee;

            // Tạo bản ghi payout
            var payout = new Payout
            {
                InstructorId = instructorId,
                Amount = requestAmount,
                PlatformFee = fee,
                NetAmount = netAmount,
                Status = "pending",
                RequestedAt = DateTime.UtcNow,
                Notes = req.Notes ?? (requestAmount == availableBalance ? "Rút toàn bộ số dư khả dụng" : null)
            };

            _context.Payouts.Add(payout);
            await _context.SaveChangesAsync();

            // Gợi ý hiển thị phía client
            var quickOptions = new List<object>();
            if (availableBalance >= 500000) quickOptions.Add(new { label = "500.000đ", value = 500000 });
            if (availableBalance >= 1000000) quickOptions.Add(new { label = "1.000.000đ", value = 1000000 });
            if (availableBalance >= 2000000) quickOptions.Add(new { label = "2.000.000đ", value = 2000000 });
            if (availableBalance >= 5000000) quickOptions.Add(new { label = "5.000.000đ", value = 5000000 });
            if (availableBalance > 0)
                quickOptions.Add(new { label = $"💸 Rút tất cả ({availableBalance:N0}đ)", value = availableBalance });

            return Ok(new
            {
                message = "✅ Yêu cầu rút tiền đã được gửi. Hệ thống sẽ xử lý trong 1–3 ngày làm việc.",
                payout,
                quickOptions
            });
        }

        //Post: Thêm tài khoản ngân hàng mới
        // Bộ nhớ tạm lưu tài khoản ngân hàng của từng giảng viên
        private static readonly Dictionary<int, List<AddBankAccountRequest>> _instructorAccounts = new();
        [Authorize]
        [HttpPost("Post/accounts/Them_tai_khoan_ngan_hang_moi")]
        public IActionResult AddBankAccount([FromBody] AddBankAccountRequest req)
        {
            var instructorId = int.Parse(User.FindFirst("InstructorID").Value);

            if (!_instructorAccounts.ContainsKey(instructorId))
                _instructorAccounts[instructorId] = new List<AddBankAccountRequest>();

            var exists = _instructorAccounts[instructorId]
                .Any(a => a.AccountNumber == req.AccountNumber);

            if (exists)
                return BadRequest(new { message = "Tài khoản này đã tồn tại." });

            _instructorAccounts[instructorId].Add(req);

            return Ok(new
            {
                message = "Đã thêm tài khoản rút tiền (chỉ lưu tạm trong phiên).",
                bankAccounts = _instructorAccounts[instructorId]
            });
        }


        //Get: lấy danh sách tài khoản rút ( đã lưu tạm )
        [Authorize]
        [HttpGet("Get/accounts/Lay_danh_sach_rut_tien")]
        public IActionResult GetBankAccounts()
        {
            var instructorId = int.Parse(User.FindFirst("InstructorID").Value);

            if (!_instructorAccounts.TryGetValue(instructorId, out var accounts))
                accounts = new List<AddBankAccountRequest>();

            return Ok(accounts);
        }


        //Get: Lịch sử rút tiền
        [HttpGet("Get/history/Lich_su_rut_tien")]
        public async Task<IActionResult> GetPayoutHistory()
        {
            var instructorId = int.Parse(User.FindFirst("InstructorID").Value);

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

        //Post: Lọc lịch sử rút tiền (lọc nâng cao)
        [HttpPost("Post/filter/Bo_loc_cua_lich_su_rut_tien")]
        [Authorize]
        public async Task<IActionResult> FilterPayouts([FromBody] Bo_loc_History_Rut_tien req)
        {
            var instructorId = int.Parse(User.FindFirst("InstructorID").Value);

            var query = _context.Payouts
                .Where(p => p.InstructorId == instructorId)
                .AsQueryable();

            if (!string.IsNullOrEmpty(req.Status))
                query = query.Where(p => p.Status == req.Status);

            if (req.FromDate.HasValue)
                query = query.Where(p => p.RequestedAt >= req.FromDate.Value);

            if (req.ToDate.HasValue)
                query = query.Where(p => p.RequestedAt <= req.ToDate.Value);

            if (req.MinAmount.HasValue)
                query = query.Where(p => p.Amount >= req.MinAmount.Value);

            if (req.MaxAmount.HasValue)
                query = query.Where(p => p.Amount <= req.MaxAmount.Value);

            var results = await query
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

            return Ok(results);
        }


        //Post: Xuất Excel lịch sử rút tiền
        [Authorize]
        [HttpGet("Get/export/Xuat_Excel_Lich_su_rut_tien")]
        public async Task<IActionResult> ExportPayoutsToExcel([FromQuery] Bo_loc_History_Rut_tien req)
        {
            var instructorId = int.Parse(User.FindFirst("InstructorID").Value);

            var query = _context.Payouts
                .Where(p => p.InstructorId == instructorId)
                .AsQueryable();

            if (!string.IsNullOrEmpty(req.Status))
                query = query.Where(p => p.Status == req.Status);

            if (req.FromDate.HasValue)
                query = query.Where(p => p.RequestedAt >= req.FromDate.Value);

            if (req.ToDate.HasValue)
                query = query.Where(p => p.RequestedAt <= req.ToDate.Value);

            var payouts = await query
                .OrderByDescending(p => p.RequestedAt)
                .ToListAsync();

            using var workbook = new ClosedXML.Excel.XLWorkbook();
            var worksheet = workbook.Worksheets.Add("LichSuRutTien");

            // Header
            worksheet.Cell(1, 1).Value = "Mã giao dịch";
            worksheet.Cell(1, 2).Value = "Số tiền";
            worksheet.Cell(1, 3).Value = "Phí nền tảng";
            worksheet.Cell(1, 4).Value = "Thực nhận";
            worksheet.Cell(1, 5).Value = "Trạng thái";
            worksheet.Cell(1, 6).Value = "Ngày yêu cầu";
            worksheet.Cell(1, 7).Value = "Ngày xử lý";
            worksheet.Cell(1, 8).Value = "Ghi chú";

            int row = 2;
            foreach (var p in payouts)
            {
                worksheet.Cell(row, 1).Value = p.PayoutId;
                worksheet.Cell(row, 2).Value = p.Amount;
                worksheet.Cell(row, 3).Value = p.PlatformFee;
                worksheet.Cell(row, 4).Value = p.NetAmount;
                worksheet.Cell(row, 5).Value = p.Status;
                worksheet.Cell(row, 6).Value = p.RequestedAt.ToString("dd/MM/yyyy HH:mm");
                worksheet.Cell(row, 7).Value = p.ProcessedAt?.ToString("dd/MM/yyyy HH:mm") ?? "-";
                worksheet.Cell(row, 8).Value = p.Notes ?? "";
                row++;
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;

            var fileName = $"LichSuRutTien_{DateTime.UtcNow:yyyyMMddHHmmss}.xlsx";

            return File(stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName);
        }


    }
}

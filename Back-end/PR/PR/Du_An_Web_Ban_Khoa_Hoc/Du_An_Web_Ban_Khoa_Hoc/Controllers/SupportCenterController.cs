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
using System.Security.Cryptography;
using System.Text;
using Newtonsoft.Json;
using DocumentFormat.OpenXml.Spreadsheet;
using System.Net.NetworkInformation;


namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
        [Authorize(Roles = "instructor")]
        [Route("api/[Controller]")]
        [ApiController]
        public class SupportCenterController : Controller
        {
            private readonly AppDbContext _context;

            public SupportCenterController(AppDbContext context)
        {
            _context = context;
            }

        //để giảng viên nhập thông tin — gửi yêu cầu hỗ trợ đến admin.

        //→ Admin có thể xem danh sách các yêu cầu hỗ trợ, phản hồi, hoặc đánh dấu “đã xử lý”.
        [Authorize]
        [HttpPost("Post/send/Giang_vien_gui_yeu_cau_ho_tro_den_admin")]
        public async Task<IActionResult> SendSupportMessage([FromBody] SupportMessage req)
        {
            if (string.IsNullOrWhiteSpace(req.FullName) ||
                string.IsNullOrWhiteSpace(req.Email) ||
                string.IsNullOrWhiteSpace(req.Subject) ||
                string.IsNullOrWhiteSpace(req.Content))
            {
                return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin." });
            }

            var userId = int.Parse(User.FindFirst("UserID").Value);

            // 🔸 Lưu dữ liệu hỗ trợ vào cột ReportData (dạng JSON)
            var supportReport = new Report
            {
                ReportType = "support", // phân biệt với các loại report khác
                GeneratedBy = userId,
                ReportData = JsonConvert.SerializeObject(new
                {
                    req.FullName,
                    req.Email,
                    req.Subject,
                    req.Content
                }),
                CreatedAt = DateTime.UtcNow
            };

            _context.Reports.Add(supportReport);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Gửi yêu cầu hỗ trợ thành công. Quản trị viên sẽ phản hồi sớm nhất.",
                reportId = supportReport.ReportId
            });
        }

    }
}

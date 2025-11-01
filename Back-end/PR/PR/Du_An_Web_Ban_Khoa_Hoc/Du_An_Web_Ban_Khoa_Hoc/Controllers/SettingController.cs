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


namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [Authorize(Roles = "instructor")]
    [Route("api/[Controller]")]
    [ApiController]
    public class SettingController : Controller
    {
        private readonly AppDbContext _context;

        public SettingController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPut("Put/change-password/Thay_doi_mat_khau")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePassword req)
        {
            var userId = int.Parse(User.FindFirst("UserID").Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy tài khoản." });

            // Kiểm tra mật khẩu hiện tại
            bool isValid = BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash);
            if (!isValid)
                return BadRequest(new { message = "Mật khẩu hiện tại không đúng." });

            // Kiểm tra xác nhận mật khẩu mới
            if (req.NewPassword != req.ConfirmPassword)
                return BadRequest(new { message = "Xác nhận mật khẩu không khớp." });

            // Hash mật khẩu mới (BCrypt tự tạo salt nội bộ)
            string newHashedPassword = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);

            user.PasswordHash = newHashedPassword;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đổi mật khẩu thành công." });
        }

    }
}

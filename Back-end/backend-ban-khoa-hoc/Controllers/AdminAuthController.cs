using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;
using Du_An_Web_Ban_Khoa_Hoc.Models;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [ApiController]
    [Route("admin/auth")]
    public class AdminAuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AdminAuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginAdminRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Email và mật khẩu là bắt buộc" });

            var user = await _context.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return Unauthorized(new { message = "Tài khoản không tồn tại" });

            var isAdmin = user.UserRoles.Any(ur => ur.Role.RoleName == "admin");
            if (!isAdmin)
                return Unauthorized(new { message = "Bạn không có quyền Admin" });

            if (user.Status != "active")
                return Unauthorized(new { message = $"Tài khoản ở trạng thái '{user.Status}'" });

            var passwordOk = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!passwordOk)
                return Unauthorized(new { message = "Mật khẩu không đúng" });

            var token = GenerateJwtToken(user.UserId, user.FullName, "Admin"); // gắn Role = Admin
            return Ok(new
            {
                message = "Đăng nhập thành công",
                token,
                user = new { user.UserId, user.FullName, user.Email, user.Status }
            });
        }

        private string GenerateJwtToken(int userId, string fullName, string role)
        {
            var key = _configuration["Jwt:Key"];
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];
            var minutesString = _configuration["Jwt:DurationInMinutes"];
            var durationMinutes = int.TryParse(minutesString, out var m) ? m : 60;

            var tokenHandler = new JwtSecurityTokenHandler();
            var securityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(key));
            var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, fullName ?? string.Empty),
                new Claim(ClaimTypes.Role, role)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(durationMinutes),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = creds
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class LoginAdminRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
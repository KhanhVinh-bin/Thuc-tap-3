using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;
// Thêm 
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using Du_An_Web_Ban_Khoa_Hoc.Models.DTO;
using System.Text;
using System.Data;


namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AuthController(AppDbContext context, IConfiguration config, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _config = config;
            _passwordHasher = passwordHasher;
        }

        //Đăng ký 
        [HttpPost("register/instructor")]
        public async Task<IActionResult> RegisterInstructor([FromBody] RegisterDTO dto)
        {
            // 1. Kiểm tra điều kiện cơ bản
            if (!dto.AcceptTerms)
                return BadRequest("Bạn phải đồng ý với điều khoản dịch vụ.");

            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email đã tồn tại trong hệ thống.");

            if (dto.Password != dto.ConfirmPassword)
                return BadRequest("Mật khẩu và xác nhận mật khẩu không khớp.");

            if (string.IsNullOrWhiteSpace(dto.Expertise) || string.IsNullOrWhiteSpace(dto.Biography))
                return BadRequest("Vui lòng nhập đầy đủ thông tin chuyên môn và giới thiệu.");

            // 2. Tạo User mới
            var user = new User
            {
                Email = dto.Email,
                FullName = dto.FullName,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // 3. Tạo Instructor record
            var instructor = new Instructor
            {
                InstructorId = user.UserId,
                Expertise = dto.Expertise,
                ExperienceYears = dto.ExperienceYears,
                Biography = dto.Biography,
                VerificationStatus = "pending"
            };
            _context.Instructors.Add(instructor);
            await _context.SaveChangesAsync();

            // 4. Gán role Instructor
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Instructor");
            if (role == null)
            {
                role = new Role { RoleName = "Instructor" };
                _context.Roles.Add(role);
                await _context.SaveChangesAsync();
            }

            _context.UserRoles.Add(new UserRole
            {
                UserId = user.UserId,
                RoleId = role.RoleId
            });
            await _context.SaveChangesAsync();

            // 5. Tạo DTO phản hồi
            var response = new Register_Instructor_ResponseDTO
            {
                Email = user.Email,
                FullName = user.FullName,
                Role = "Instructor",
                Expertise = instructor.Expertise ?? "",
                ExperienceYears = instructor.ExperienceYears ?? 0,
                Biography = instructor.Biography ?? ""
            };

            return Ok(response);
        }



        // Đăng nhập
        [HttpPost("Post/login/Dang_Nhap")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null) return Unauthorized("Email hoặc mật khẩu không đúng");

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (result == PasswordVerificationResult.Failed) return Unauthorized("Email hoặc mật khẩu không đúng");

            var roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList();

            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, user.Email)
        };

            foreach (var r in roles)
                claims.Add(new Claim(ClaimTypes.Role, r)); 


            if (roles.Any(r => r.Equals("Instructor", StringComparison.OrdinalIgnoreCase)))
                claims.Add(new Claim("InstructorId", user.UserId.ToString()));

            // JWT
            var jwtCfg = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtCfg["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtCfg["Issuer"],
                audience: jwtCfg["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(double.Parse(jwtCfg["ExpireHours"] ?? "3")),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new { token = tokenString, roles });
        }
    }
}

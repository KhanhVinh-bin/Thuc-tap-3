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
    [Route("admin/instructors")]
    public class AdminInstructorsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AdminInstructorsController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Danh sách giảng viên
        [HttpGet]
        public async Task<IActionResult> GetInstructors(
            [FromQuery] int? id,
            [FromQuery] string? name,
            [FromQuery] string? expertise)
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(' ').Last();
            if (!IsAdminToken(token)) return Unauthorized(new { message = "Token không hợp lệ hoặc không có quyền Admin" });

            var query = _context.Instructors
                .Include(i => i.InstructorNavigation)
                .AsQueryable();

            // Chỉ những user có vai trò instructor
            query = query.Where(i =>
                _context.UserRoles
                    .Include(ur => ur.Role)
                    .Any(ur => ur.UserId == i.InstructorId && ur.Role.RoleName == "instructor"));

            if (id.HasValue)
            {
                query = query.Where(i => i.InstructorId == id.Value);
            }
            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(i => i.InstructorNavigation.FullName.Contains(name));
            }
            if (!string.IsNullOrEmpty(expertise))
            {
                query = query.Where(i => i.Expertise != null && i.Expertise.Contains(expertise));
            }

            var data = await query
                .OrderByDescending(i => i.InstructorNavigation.CreatedAt)
                .Select(i => new
                {
                    ID = i.InstructorId,
                    Ten = i.InstructorNavigation.FullName,
                    Email = i.InstructorNavigation.Email,
                    ChuyenMon = i.Expertise,
                    SoKhoaHoc = i.TotalCourses,
                    NgayTao = i.InstructorNavigation.CreatedAt
                })
                .ToListAsync();

            return Ok(data);
        }

        // Chi tiết giảng viên
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetInstructorDetail(int id)
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(' ').Last();
            if (!IsAdminToken(token)) return Unauthorized(new { message = "Token không hợp lệ hoặc không có quyền Admin" });

            var instructor = await _context.Instructors
                .Include(i => i.InstructorNavigation)
                .AsNoTracking()
                .FirstOrDefaultAsync(i => i.InstructorId == id);

            if (instructor == null) return NotFound(new { message = "Không tìm thấy giảng viên" });

            var isInstructorRole = await _context.UserRoles
                .Include(ur => ur.Role)
                .AnyAsync(ur => ur.UserId == id && ur.Role.RoleName == "instructor");
            if (!isInstructorRole) return NotFound(new { message = "Người dùng không có quyền giảng viên" });

            var courses = await _context.Courses
                .Where(c => c.InstructorId == id)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    c.CourseId,
                    c.Title,
                    c.Status,
                    c.CreatedAt
                })
                .ToListAsync();

            var detail = new
            {
                ID = instructor.InstructorId,
                FullName = instructor.InstructorNavigation.FullName,
                Email = instructor.InstructorNavigation.Email,
                PhoneNumber = instructor.InstructorNavigation.PhoneNumber,
                Address = instructor.InstructorNavigation.Address,
                AvatarUrl = instructor.InstructorNavigation.AvatarUrl,
                Gender = instructor.InstructorNavigation.Gender,
                Bio = instructor.InstructorNavigation.Bio,
                Status = instructor.InstructorNavigation.Status,
                CreatedAt = instructor.InstructorNavigation.CreatedAt,
                UpdatedAt = instructor.InstructorNavigation.UpdatedAt,

                Expertise = instructor.Expertise,
                Biography = instructor.Biography,
                ExperienceYears = instructor.ExperienceYears,
                TotalCourses = instructor.TotalCourses,
                TotalStudents = instructor.TotalStudents,
                RatingAverage = instructor.RatingAverage,
                LinkedInUrl = instructor.LinkedInUrl,
                FacebookUrl = instructor.FacebookUrl,
                YouTubeUrl = instructor.YouTubeUrl,
                Xurl = instructor.Xurl,

                Courses = courses
            };

            return Ok(detail);
        }

        // Khóa/Mở khóa tài khoản giảng viên
        [HttpPatch("{id:int}/lock")]
        public async Task<IActionResult> ToggleLock(int id)
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(' ').Last();
            if (!IsAdminToken(token)) return Unauthorized(new { message = "Token không hợp lệ hoặc không có quyền Admin" });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản giảng viên" });

            user.Status = user.Status == "locked" ? "active" : "locked";
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công", status = user.Status });
        }

        // Xóa tài khoản giảng viên (soft delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(' ').Last();
            if (!IsAdminToken(token)) return Unauthorized(new { message = "Token không hợp lệ hoặc không có quyền Admin" });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản giảng viên" });

            user.Status = "deleted";
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa tài khoản giảng viên thành công (soft delete)", status = user.Status });
        }

        // ---------- Private Helpers ----------
        private bool IsAdminToken(string? token)
        {
            if (string.IsNullOrEmpty(token)) return false;

            var principal = ValidateTokenAndGetPrincipal(token);
            if (principal == null) return false;

            var roleClaim = principal.Claims.FirstOrDefault(c =>
                c.Type == ClaimTypes.Role || c.Type == "role");

            return roleClaim?.Value == "Admin";
        }

        private ClaimsPrincipal? ValidateTokenAndGetPrincipal(string token)
        {
            try
            {
                var secret = _configuration["Jwt:SecretKey"] ?? _configuration["Jwt:Key"];
                if (string.IsNullOrEmpty(secret)) return null;

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(secret);

                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return principal;
            }
            catch
            {
                return null;
            }
        }
    }
}
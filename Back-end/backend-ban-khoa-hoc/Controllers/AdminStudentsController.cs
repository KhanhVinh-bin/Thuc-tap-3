using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.DTO;
using Microsoft.AspNetCore.Authorization;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [ApiController]
    [Route("admin/students")]
    [Authorize(Roles = "Admin")]
    public class AdminStudentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        // Allowed statuses for students
        private static readonly HashSet<string> AllowedStatuses = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "active", "inactive", "pending"
        };

        private static string NormalizeStatus(string? status)
        {
            var s = (status ?? string.Empty).Trim().ToLowerInvariant();
            if (string.IsNullOrEmpty(s)) return s;
            if (s == "locked" || s == "block" || s == "banned") return "inactive";
            return s;
        }

        public AdminStudentsController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Danh sách sinh viên: ID, Tên, Email, Ngày tạo + tìm kiếm + lọc
        [HttpGet]
        [HttpGet("danhsachsinhvien")]
        [HttpGet("/admin/student/danhsachsinhvien")]
        public async Task<IActionResult> GetStudents(
            [FromQuery] string? keyword,
            [FromQuery] string? status,
            [FromQuery] DateTime? createdFrom,
            [FromQuery] DateTime? createdTo)
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(' ').Last();
            if (!IsAdminToken(token)) return Unauthorized(new { message = "Token không hợp lệ hoặc không có quyền Admin" });

            var query = _context.Users
                .Include(u => u.Student)
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .Where(u => u.UserRoles.Any(ur => ur.Role.RoleName == "student"))
                .AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(u =>
                    u.FullName.Contains(keyword) ||
                    u.Email.Contains(keyword) ||
                    (u.PhoneNumber != null && u.PhoneNumber.Contains(keyword)));
            }

            if (!string.IsNullOrEmpty(status))
            {
                var parts = status.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Select(s => s.Split(':')[0])
                    .ToList();
                var statusFilter = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                foreach (var s in parts)
                {
                    var norm = NormalizeStatus(s);
                    if (string.Equals(norm, "inactive", StringComparison.OrdinalIgnoreCase))
                    {
                        statusFilter.Add("inactive");
                        statusFilter.Add("locked");
                    }
                    else
                    {
                        statusFilter.Add(norm);
                    }
                }
                if (statusFilter.Count > 0)
                {
                    query = query.Where(u => u.Status != null && statusFilter.Contains(u.Status));
                }
            }

            if (createdFrom.HasValue)
            {
                query = query.Where(u => u.CreatedAt >= createdFrom.Value);
            }
            if (createdTo.HasValue)
            {
                query = query.Where(u => u.CreatedAt <= createdTo.Value);
            }

            var data = await query
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new
                {
                    ID = u.UserId,
                    Ten = u.FullName,
                    Name = u.FullName,
                    Email = u.Email,
                    NgayTao = u.CreatedAt,
                    CreatedAt = u.CreatedAt,
                    Status = u.Status ?? "active",
                    StatusNormalized = string.IsNullOrEmpty(u.Status) ? "active" : NormalizeStatus(u.Status),
                    IsLocked = !string.IsNullOrEmpty(u.Status) && NormalizeStatus(u.Status) == "inactive"
                })
                .ToListAsync();

            return Ok(data);
        }

        // Chi tiết sinh viên: thông tin + lịch sử đăng ký khóa học + đơn hàng
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetStudentDetail(int id)
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(' ').Last();
            if (!IsAdminToken(token)) return Unauthorized(new { message = "Token không hợp lệ hoặc không có quyền Admin" });

            var user = await _context.Users
                .Include(u => u.Student)
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role.RoleName == "student"));

            if (user == null) return NotFound(new { message = "Không tìm thấy sinh viên" });

            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                .Where(e => e.UserId == id)
                .OrderByDescending(e => e.EnrollDate)
                .Select(e => new
                {
                    e.EnrollmentId,
                    e.CourseId,
                    CourseTitle = e.Course.Title,
                    e.EnrollDate,
                    e.Status
                })
                .ToListAsync();

            var orders = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Course)
                .Where(o => o.UserId == id)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new
                {
                    o.OrderId,
                    o.OrderDate,
                    o.Status,
                    o.TotalAmount,
                    Items = o.OrderDetails.Select(od => new
                    {
                        od.OrderDetailId,
                        od.CourseId,
                        CourseTitle = od.Course.Title
                    }).ToList()
                })
                .ToListAsync();

            var detail = new
            {
                ID = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                AvatarUrl = user.AvatarUrl,
                Gender = user.Gender,
                Bio = user.Bio,
                Status = user.Status,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                StudentStats = user.Student == null ? null : new
                {
                    user.Student.EnrollmentCount,
                    user.Student.CompletedCourses,
                    user.Student.TotalCertificates,
                    user.Student.LastActive
                },
                Enrollments = enrollments,
                Orders = orders
            };

            return Ok(detail);
        }

        // Sửa thông tin cơ bản của sinh viên
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] AdminStudentUpdateDto request)
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(' ').Last();
            if (!IsAdminToken(token)) return Unauthorized(new { message = "Token không hợp lệ hoặc không có quyền Admin" });

            var user = await _context.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role.RoleName == "student"));
            if (user == null) return NotFound(new { message = "Không tìm thấy sinh viên" });

            if (!string.IsNullOrEmpty(request.Email))
            {
                var exists = await _context.Users.AnyAsync(u => u.Email == request.Email && u.UserId != id);
                if (exists) return BadRequest(new { message = "Email đã tồn tại" });
            }

            user.FullName = request.FullName ?? user.FullName;
            user.Email = request.Email ?? user.Email;
            user.PhoneNumber = request.PhoneNumber ?? user.PhoneNumber;
            user.Address = request.Address ?? user.Address;
            user.AvatarUrl = request.AvatarUrl ?? user.AvatarUrl;
            user.Gender = request.Gender ?? user.Gender;
            user.Bio = request.Bio ?? user.Bio;

            if (!string.IsNullOrEmpty(request.Status))
            {
                var normalized = NormalizeStatus(request.Status);
                if (!AllowedStatuses.Contains(normalized))
                {
                    return BadRequest(new { message = "Trạng thái không hợp lệ. Cho phép: active, inactive, pending." });
                }
                user.Status = normalized;
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thông tin sinh viên thành công" });
        }

        // Khóa/Mở khóa tài khoản
        [HttpPatch("{id:int}/lock")]
        public async Task<IActionResult> ToggleLock(int id)
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(' ').Last();
            if (!IsAdminToken(token)) return Unauthorized(new { message = "Token không hợp lệ hoặc không có quyền Admin" });

            var user = await _context.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role.RoleName == "student"));
            if (user == null) return NotFound(new { message = "Không tìm thấy sinh viên" });

            var current = NormalizeStatus(user.Status);
            user.Status = current == "inactive" ? "active" : "inactive";
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công", status = user.Status });
        }

        // Cập nhật trạng thái cụ thể
        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto request)
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(' ').Last();
            if (!IsAdminToken(token)) return Unauthorized(new { message = "Token không hợp lệ hoặc không có quyền Admin" });

            var user = await _context.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role.RoleName == "student"));
            if (user == null) return NotFound(new { message = "Không tìm thấy sinh viên" });

            var normalized = NormalizeStatus(request?.Status);
            if (string.IsNullOrEmpty(normalized) || !AllowedStatuses.Contains(normalized))
            {
                return BadRequest(new { message = "Trạng thái không hợp lệ. Cho phép: active, inactive, pending." });
            }

            user.Status = normalized;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công", status = user.Status });
        }

        public class UpdateStatusDto
        {
            public string Status { get; set; } = string.Empty;
        }

        // Xóa sinh viên (soft delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(' ').Last();
            if (!IsAdminToken(token)) return Unauthorized(new { message = "Token không hợp lệ hoặc không có quyền Admin" });

            var user = await _context.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == id && u.UserRoles.Any(ur => ur.Role.RoleName == "student"));
            if (user == null) return NotFound(new { message = "Không tìm thấy sinh viên" });

            user.Status = "deleted";
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa sinh viên thành công (soft delete)", status = user.Status });
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
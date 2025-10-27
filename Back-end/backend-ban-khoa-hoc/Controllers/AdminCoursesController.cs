using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [ApiController]
    [Route("admin/courses")]
    [Authorize(Roles = "Admin")]
    public class AdminCoursesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminCoursesController(AppDbContext context)
        {
            _context = context;
        }

        // Test endpoint để kiểm tra kết nối
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "API is working", timestamp = DateTime.UtcNow });
        }

        // Tạo dữ liệu mẫu để test
        [HttpPost("seed")]
        public async Task<IActionResult> SeedData()
        {
            try
            {
                // Kiểm tra xem đã có dữ liệu chưa
                var existingCourses = await _context.Courses.CountAsync();
                if (existingCourses > 0)
                {
                    return Ok(new { message = "Data already exists", count = existingCourses });
                }

                // Tạo một số khóa học mẫu
                var sampleCourses = new List<Course>











































































































                
                {
                    new Course
                    {
                        Title = "Lập trình Frontend với React",
                        Description = "Khóa học lập trình frontend từ cơ bản đến nâng cao",
                        Price = 2990000,
                        Duration = "3 tháng",
                        Level = "Beginner",
                        Language = "Vietnamese",
                        Status = "active",
                        CreatedAt = DateTime.UtcNow.AddDays(-30),
                        UpdatedAt = DateTime.UtcNow.AddDays(-10)
                    },
                    new Course
                    {
                        Title = "Backend Development với Node.js",
                        Description = "Học backend development với Node.js và Express",
                        Price = 3990000,
                        Duration = "4 tháng",
                        Level = "Intermediate",
                        Language = "Vietnamese",
                        Status = "active",
                        CreatedAt = DateTime.UtcNow.AddDays(-20),
                        UpdatedAt = DateTime.UtcNow.AddDays(-5)
                    },
                    new Course
                    {
                        Title = "Data Science cơ bản",
                        Description = "Khóa học Data Science từ cơ bản",
                        Price = 4990000,
                        Duration = "6 tháng",
                        Level = "Beginner",
                        Language = "Vietnamese",
                        Status = "pending",
                        CreatedAt = DateTime.UtcNow.AddDays(-10),
                        UpdatedAt = DateTime.UtcNow.AddDays(-2)
                    }
                };

                _context.Courses.AddRange(sampleCourses);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Sample data created successfully", count = sampleCourses.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating sample data", error = ex.Message });
            }
        }

        // Danh sách khóa học: ID, Tên, Giảng viên, Giá, Số học viên + tìm kiếm/lọc
        [HttpGet]
        public async Task<IActionResult> GetCourses(
            [FromQuery] int? id,
            [FromQuery] string? title,
            [FromQuery] int? instructorId,
            [FromQuery] string? instructorName,
            [FromQuery] string? status)
        {
            try
            {
                var query = _context.Courses
                    .Include(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                    .Include(c => c.Enrollments)
                    .AsQueryable();

                if (id.HasValue)
                    query = query.Where(c => c.CourseId == id.Value);

                if (!string.IsNullOrWhiteSpace(title))
                    query = query.Where(c => c.Title.Contains(title));

                if (instructorId.HasValue)
                    query = query.Where(c => c.InstructorId == instructorId.Value);

                if (!string.IsNullOrWhiteSpace(instructorName))
                    query = query.Where(c => c.Instructor != null &&
                        c.Instructor.InstructorNavigation.FullName.Contains(instructorName));

                if (!string.IsNullOrWhiteSpace(status))
                    query = query.Where(c => c.Status == status);

                var data = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new
                    {
                        ID = c.CourseId,
                        TenKhoaHoc = c.Title,
                        GiangVien = c.Instructor != null ? c.Instructor.InstructorNavigation.FullName : null,
                        Gia = c.Price,
                        SoHocVien = c.Enrollments.Count,
                        ThoiLuong = c.Duration,
                        NgayBatDau = c.CreatedAt,
                        TrangThai = c.Status,
                        Status = c.Status
                    })
                    .ToListAsync();

                Console.WriteLine($"Found {data.Count} courses");
                return Ok(data);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetCourses: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // Chi tiết khóa học + danh sách học viên + doanh thu
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetCourseDetail(int id)
        {
            var course = await _context.Courses
                .Include(c => c.Instructor).ThenInclude(i => i.InstructorNavigation)
                .Include(c => c.Category)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.CourseId == id);

            if (course == null)
                return NotFound(new { message = "Không tìm thấy khóa học" });

            var students = await _context.Enrollments
                .Include(e => e.User)
                .Where(e => e.CourseId == id)
                .OrderByDescending(e => e.EnrollDate)
                .Select(e => new
                {
                    e.UserId,
                    HoTen = e.User.FullName,
                    Email = e.User.Email,
                    NgayDangKy = e.EnrollDate,
                    TrangThaiDangKy = e.Status
                })
                .ToListAsync();

            // Doanh thu từ OrderDetails của khóa học
            var totalRevenue = await _context.OrderDetails
                .Where(od => od.CourseId == id)
                .Select(od => od.Price * od.Quantity)
                .SumAsync();

            var detail = new
            {
                ID = course.CourseId,
                TieuDe = course.Title,
                MoTa = course.Description,
                DanhMuc = course.Category?.CategoryName,
                GiangVien = course.Instructor?.InstructorNavigation.FullName,
                Gia = course.Price,
                TrangThai = course.Status,
                CreatedAt = course.CreatedAt,
                UpdatedAt = course.UpdatedAt,
                HocVienDangKy = students,
                DoanhThu = totalRevenue
            };

            return Ok(detail);
        }

        // Xóa khóa học (soft delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> SoftDeleteCourse(int id)
        {
            var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == id);
            if (course == null)
                return NotFound(new { message = "Không tìm thấy khóa học" });

            course.Status = "deleted";
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa khóa học thành công (soft delete)", status = course.Status });
        }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;
using Du_An_Web_Ban_Khoa_Hoc.Models.DTO;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [Authorize(Roles = "instructor")]
    [Route("api/[Controller]")]
    [ApiController]
    public class StudentsController : Controller
    {
        private readonly AppDbContext _context;

        public StudentsController(AppDbContext context)
        {
            _context = context;
        }

        //Get: Student/CourseEnrollment 
        //Get: Lấy danh sách học viên đăng ký ( 1 khóa học gồm nhiều học viên )
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/instructor/Lay_danh_sach_hoc_vien_da_dang_ky")]
        public async Task<IActionResult> GetStudentsOfMyCourses()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var userId)) return Unauthorized();

            // Lấy InstructorId từ JWT token
            var instructorClaim = User.FindFirst("InstructorId")?.Value;
            if (!int.TryParse(instructorClaim, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ");

            // Lấy danh sách các khóa học của giảng viên này
            var myCourses = await _context.Courses
                .Where(c => c.InstructorId == instructorId)
                .ToListAsync();

            if (!myCourses.Any())
                return NotFound("Bạn chưa có khóa học nào.");

            var courseIds = myCourses.Select(c => c.CourseId).ToList();

            // Lấy danh sách học viên đã đăng ký các khóa học này
            var students = await _context.Enrollments
                .Where(e => courseIds.Contains(e.CourseId))
                .Select(e => new
                {
                    FullName = e.User.FullName,
                    Email = e.User.Email,
                    CourseTitle = e.Course.Title,
                    EnrollmentDate = e.EnrollDate,
                    ProgressPercent = e.Progresses.Any()
                        ? (int)(100 * e.Progresses.Count(p => p.IsCompleted) / (double)e.Course.Lessons.Count)
                        : 0,
                    LastActive = e.User.Student.LastActive,
                    EnrollmentStatus = e.Status
                })
                .ToListAsync();

            return Ok(students);
        }


        ////Get: api/courses/{courseId}/students
        ////Get: Lấy các khóa học mà học viên đã tham gia ( 1 học viên đăng ký nhiều khóa học )
        //// UserId -> Course 
        //[HttpGet("get/user/{UserId}/Lay_khoa_hoc_ma_hoc_vien_đa_tham_gia")]
        //public async Task<IActionResult> GetCoursesByStudent(int UserId)
        //{
        //    var courses = await _context.Enrollments // Xét từ bảng Enrollments
        //        .Where(e => e.UserId == UserId)
        //        .Select(e => new
        //        {
        //            e.CourseId,
        //            e.Course.Title,
        //            EnrollmentDate = e.EnrollDate,
        //            EnrollmentStatus = e.Status,
        //            Progress = e.Progresses.Select(p => new 
        //            {
        //                LessonTitle = p.Lesson.Title,
        //                IsCompleted = p.IsCompleted,
        //                CompletedAt = p.CompletedAt
        //            }).ToList()
        //        })
        //        .ToListAsync();

        //    return Ok(courses);
        //}

        ////Get: Progresses/EnrollmentId/Lesson
        ////Get: Xem tiến độ từng bài học trong 1 lần đăng ký 
        //[HttpGet("enrollments/{EnrollmentId}/progress/Xem_tien_đo_tung_bai_hoc_trong_1_lan_đang_ky")]
        //public async Task<IActionResult> GetProgressByEnrollment(int EnrollmentId)
        //{
        //    var progress = await _context.Progresses
        //        .Where(p => p.EnrollmentId == EnrollmentId)
        //        .Select(p => new
        //        {
        //            p.ProgressId,
        //            LessonTitle = p.Lesson.Title,
        //            IsCompleted = p.IsCompleted,
        //            CompletedAt = p.CompletedAt
        //        })
        //        .ToListAsync();

        //    if (!progress.Any())
        //        return NotFound("Không tìm thấy tiến độ");

        //    return Ok(progress);
        //}


        //Search có bộ lọc 
        // Get: Search + Tính % Progress (tiến độ)
        // Search có bộ lọc, không phân trang
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/instructor/students/search/Tim_kiem_co_bo_loc")]
        public async Task<ActionResult<IEnumerable<object>>> GetStudentsByInstructor([FromQuery] StudentFilterQuery query)
        {
            //  Lấy InstructorId từ JWT token
            var instructorClaim = User.FindFirst("InstructorId")?.Value;
            if (!int.TryParse(instructorClaim, out int instructorId))
                return Unauthorized();

            // Lấy danh sách khóa học của giảng viên
            var myCourses = await _context.Courses
                .Where(c => c.InstructorId == instructorId)
                .Select(c => new { c.CourseId, c.Title })
                .ToListAsync();

            if (!myCourses.Any())
                return Ok(new List<object>()); // Không có khóa học, trả về danh sách rỗng

            var myCourseIds = myCourses.Select(c => c.CourseId).ToList();

            // Lấy danh sách Enrollment trong các khóa học đó
            var enrollments = _context.Enrollments
                .Include(e => e.User)
                .Include(e => e.Course)
                .Include(e => e.Progresses)
                .Where(e => myCourseIds.Contains(e.CourseId))
                .AsQueryable();

            // Filter
            if (query.EnrollDate.HasValue)
                enrollments = enrollments.Where(s => s.EnrollDate.Date == query.EnrollDate.Value.Date);

            if (!string.IsNullOrEmpty(query.Status))
                enrollments = enrollments.Where(s => s.Status.Contains(query.Status));

            if (!string.IsNullOrEmpty(query.FullName))
                enrollments = enrollments.Where(s => s.User.FullName.Contains(query.FullName));

            if (!string.IsNullOrEmpty(query.Email))
                enrollments = enrollments.Where(s => s.User.Email.Contains(query.Email));

            if (!string.IsNullOrEmpty(query.Title))
            {
                var courseIdsFiltered = myCourses
                    .Where(c => c.Title.Contains(query.Title))
                    .Select(c => c.CourseId)
                    .ToList();
                enrollments = enrollments.Where(e => courseIdsFiltered.Contains(e.CourseId));
            }

            // Lấy dữ liệu và tính tiến độ
            var data = await enrollments
                .OrderByDescending(s => s.EnrollDate)
                .Select(s => new
                {
                    s.UserId,
                    FullName = s.User.FullName,
                    Email = s.User.Email,
                    CourseTitle = s.Course.Title,
                    EnrollmentDate = s.EnrollDate,
                    LastActive = s.User.Student.LastActive,
                    EnrollmentStatus = s.Status,
                    ProgressPercent = _context.Lessons.Count(l => l.CourseId == s.CourseId) == 0
                        ? 0
                        : Math.Round(
                            (double)s.Progresses.Count(p => p.IsCompleted) /
                            _context.Lessons.Count(l => l.CourseId == s.CourseId) * 100, 2)
                })
                .ToListAsync();


            return Ok(data);
        }




        // Enrollment -> User + Course {id}(kiểm tra đăng ký chưa -> tìm khóa học + học viên )/Lesson/ Progress
        // Tính phần trăm % Tiến độ của học viên trong 1 khóa học 
        //[HttpGet("api/course/{courseId}/students/Phan_tram_Tien_Do_1_Khoa_Hoc")]
        //public async Task<IActionResult> GetAllStudentsProgressPercent(int courseId)
        //{
        //    // Lấy danh sách enrollment của khóa học
        //    var enrollments = await _context.Enrollments
        //        .Include(e => e.Progresses)
        //        .Include(e => e.User)
        //        .Where(e => e.CourseId == courseId)
        //        .ToListAsync();

        //    // Tổng số lesson của khóa học
        //    var totalLessons = await _context.Lessons
        //        .CountAsync(l => l.CourseId == courseId);

        //    var result = enrollments.Select(e => new
        //    {
        //        e.UserId,
        //        e.User.FullName,
        //        e.User.Email,
        //        ProgressPercent = totalLessons == 0 ? 0 :
        //            Math.Round((double)e.Progresses.Count(p => p.IsCompleted) / totalLessons * 100, 2)
        //    });

        //    return Ok(result);
        //}

    }
}

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

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class StudentsController : Controller
    {
        private readonly AppDbContext _context;

        public StudentsController(AppDbContext context)
        {
            _context = context;
        }

        //Get: Student/Course/{CourseID}/Enrollment 
        //Get: Lấy danh sách học viên đăng ký ( 1 khóa học gồm nhiều học viên )
        // CourseId -> User  
        [HttpGet("Get/Course/{courseId}/Lay_danh_sach_hoc_vien_đang_ky")]
        public async Task<IActionResult> GetStudentbyCourse(int courseId)
        {
            var students = await _context.Enrollments 
            .Where(e => e.CourseId == courseId)
            .Select(e => new
            {
                e.UserId,
                FullName = e.User.FullName,
                Email = e.User.Email,
                PhoneNumber = e.User.PhoneNumber,
                EnrollmentDate = e.EnrollDate,
                EnrollmentStatus = e.Status,
                LastActive = e.User.Student.LastActive,
                Progress = e.Progresses.Select(p => new
                {
                    LessonTitle = p.Lesson.Title,
                    IsCompleted = p.IsCompleted,
                    CompletedAt = p.CompletedAt
                }).ToList()
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


        //Get: Search + Page + Tính % Progress(tiến độ)
        //Search có bộ lọc 
        [HttpGet("Student/Progress/Enrollment/Search_co_bo_loc")]
        public async Task<ActionResult<ResponsePageResult<object>>> GetStudents([FromQuery] StudentFilterQuery query)
        {
            var students = _context.Enrollments
                .Include(e => e.User)
                .Include(e => e.Course)
                .AsQueryable();

            // Filter
            if (query.EnrollDate.HasValue)
                students = students.Where(s => s.EnrollDate.Date == query.EnrollDate.Value.Date);

            if (!string.IsNullOrEmpty(query.Status))
                students = students.Where(s => s.Status == query.Status);

            if (!string.IsNullOrEmpty(query.FullName))
                students = students.Where(s => s.User.FullName.Contains(query.FullName));

            if (!string.IsNullOrEmpty(query.Email))
                students = students.Where(s => s.User.Email.Contains(query.Email));

            if (!string.IsNullOrEmpty(query.Title))
                students = students.Where(s => s.Course.Title.Contains(query.Title));

            if (query.IsCompleted.HasValue)
            {
                students = query.IsCompleted.Value
                    ? students.Where(s => s.Status == "Completed")
                    : students.Where(s => s.Status != "Completed");
            }

            // Pagination
            // Phân trang (limit fix cứng = 4)
            const int limit = 4;  // fix cứng 4 item/trang
            var totalItems = await students.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)limit);

            var data = await students
                .OrderByDescending(s => s.EnrollDate)
                .Skip((query.Page - 1) * limit)
                .Take(limit)
                .Select(s => new {
                    s.EnrollmentId,
                    s.EnrollDate,
                    s.Status,
                    UserFullName = s.User.FullName,
                    UserEmail = s.User.Email,
                    CourseTitle = s.Course.Title,
                    IsCompleted = s.Status == "Completed"
                })
                .ToListAsync();

            return Ok(new ResponsePageResult<object>
            {
                Data = data,
                Page = query.Page,
                TotalItems = totalItems,
                TotalPages = totalPages
            });
        }


        // Enrollment -> User + Course {id}(kiểm tra đăng ký chưa -> tìm khóa học + học viên )/Lesson/ Progress
        [HttpGet("api/course/{courseId}/students/Phan_tram_Tien_Do_1_Khoa_Hoc")]
        public async Task<IActionResult> GetAllStudentsProgressPercent(int courseId)
        {
            // Lấy danh sách enrollment của khóa học
            var enrollments = await _context.Enrollments
                .Include(e => e.Progresses)
                .Include(e => e.User)
                .Where(e => e.CourseId == courseId)
                .ToListAsync();

            // Tổng số lesson của khóa học
            var totalLessons = await _context.Lessons
                .CountAsync(l => l.CourseId == courseId);

            var result = enrollments.Select(e => new
            {
                e.UserId,
                e.User.FullName,
                e.User.Email,
                ProgressPercent = totalLessons == 0 ? 0 :
                    Math.Round((double)e.Progresses.Count(p => p.IsCompleted) / totalLessons * 100, 2)
            });

            return Ok(result);
        }

    }
}

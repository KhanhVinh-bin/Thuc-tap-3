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
using DocumentFormat.OpenXml.Presentation;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [Authorize(Roles = "instructor")]
    [Route("api/[Controller]")]
    [ApiController]
    public class CoursesController : Controller
    {

        private readonly AppDbContext _context;

        public CoursesController(AppDbContext context)
        {
            _context = context;
        }

        //------Dùng JWT Claims------
        //---Khi giảng viên login → hệ thống tạo JWT token có chứa InstructorId hoặc UserId.
        //---Các request tiếp theo đều có Authorization: Bearer<token>.

        //Get: CourseALL
        //Lấy thông tin khóa học theo ID giảng viên (Gồm:tiêu đề, giá khóa học,tình trạng khóa học,
        //tổng học viên, tổng đánh giá về khóa học, đánh giá trung bình, tổng doanh thu, hình đại diện)

        [Authorize(Roles = "instructor")]//database viết thường - instructor
        [HttpGet("Get/my-courses/coursesAll/Thong_Tin_Nhieu_Khoa_Hoc")]
        public async Task<IActionResult> GetMyCourses()
        {
            // Lấy InstructorId từ claim
            var instructorIdClaim = User.FindFirst("InstructorId");
            if (instructorIdClaim == null)
            {
                return Unauthorized("Không tìm thấy InstructorId trong token.");
            }

            if (!int.TryParse(instructorIdClaim.Value, out int instructorId))
            {
                return Unauthorized("InstructorId trong token không hợp lệ.");
            }

            // Kiểm tra giảng viên tồn tại
            var instructorExists = await _context.Instructors
                .AnyAsync(i => i.InstructorId == instructorId);
            if (!instructorExists)
            {
                return NotFound("Không tìm thấy giảng viên.");
            }

            // Lấy danh sách khóa học kèm thống kê
            var courses = await _context.Courses
                .Where(c => c.InstructorId == instructorId)
                .Select(c => new
                {
                    c.CourseId,
                    c.Title,
                    c.ThumbnailUrl,
                    c.Price,
                    c.Status,

                    // Thống kê
                    TotalStudents = c.Enrollments.Count(e => e.Status == "Completed"),
                    TotalReviews = c.Reviews.Count(),
                    AverageRating = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0,

                    // Revenue: chỉ tính enrollment đã thanh toán thành công
                    TotalRevenue = c.Enrollments
                        .Where(e => e.Status == "Completed" || e.Status == "Paid") // Chỉ tính "đã thanh toán Paid" và "Hoàn tất Completed"
                        .Sum(e => (decimal?)e.Course.Price) ?? 0
                })
                .ToListAsync();

            if (!courses.Any())
            {
                return NotFound("Bạn chưa có khóa học nào.");
            }

            return Ok(courses);
        }

        //Tạo khóa học với 4 Step:

        //--Step 1 – Nhập thông tin cơ bản(Title, Description, Thumbnail, …).
        //lưu vào DB 
        //Điều kiện: validate không được bỏ trống.
        //Nếu thoát đột ngột thì vẫn ok.

        //Step 2 – Nhập thông tin bổ sung(giá, level, tags, …).
        //lưu vào DB. Tags có thể chọn nhiều(nhiều–nhiều → sau này lưu vào bảng trung gian CourseTags).

        //Vẫn lưu tạm ở frontend.

        //Step 3 – Tạo Bài học(Lesson), Xóa lesson.
        // lưu DB .

        //Step 4 – Preview toàn bộ thông tin(Step 1 + Step 2 + Step 3).
        //Khi giảng viên bấm “Tạo khóa học”. Chuyển trạng thái "Draff" -> "Pending"

        // Tạo một khóa học mới ở trạng thái "draft" nếu chưa có.

        //Quy trình hoạt động
        //Cập nhật thông tin cơ bản của khóa học.
        //Gán một tag duy nhất cho khóa học(nếu có).
        //Thêm/cập nhật danh sách bài học(Lessons) kèm file nếu có(pdf/text) hoặc URL video.
        //Trả về chi tiết khóa học cùng danh sách bài học và tag hiện tại.
        //Lưu ý: khi Nhập ContentType = Video thì không cần nhập FilePath và ngược lại ( không cần nhập VideoUrl)

        [Authorize(Roles = "instructor")]
        [HttpPost("Post/CreateOrUpdateCourseStep/Tao_Khoa_hoc_4_buoc")]
        public async Task<IActionResult> CreateOrUpdateCourseStep([FromBody] Create_Course request)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var instructorId))
                return Unauthorized("Token không hợp lệ");

            // 🔹 Lấy khóa học draft
            var course = await _context.Courses
                .Where(c => c.InstructorId == instructorId && c.Status == "draft")
                .FirstOrDefaultAsync();

            if (course == null)
            {
                course = new Course
                {
                    InstructorId = instructorId,
                    Status = "draft",
                    CreatedAt = DateTime.UtcNow,
                    Title = request.Title ?? "Untitled Course"
                };
                _context.Courses.Add(course);
                await _context.SaveChangesAsync();
            }

            // 🔹 Cập nhật thông tin cơ bản
            course.Title = request.Title ?? course.Title;
            course.Description = request.Description ?? course.Description;
            course.CategoryId = request.CategoryId ?? course.CategoryId;
            course.ThumbnailUrl = request.ThumbnailUrl ?? course.ThumbnailUrl;
            course.Price = request.Price ?? course.Price;
            course.Duration = request.Duration ?? course.Duration;
            course.Level = request.Level ?? course.Level;
            course.Prerequisites = request.Prerequisites ?? course.Prerequisites;
            course.LearningOutcomes = request.LearningOutcomes ?? course.LearningOutcomes;
            course.UpdatedAt = DateTime.UtcNow;

            //----- Gán 1 tag duy nhất -----
            if (request.TagIds?.Any() == true)
            {
                // Chỉ lấy tag đầu tiên
                var tag = await _context.Tags
                    .Where(t => t.TagId == request.TagIds.First())
                    .FirstOrDefaultAsync();

                // Xóa tag cũ
                course.Tags.Clear();

                // Thêm tag mới nếu tồn tại
                if (tag != null)
                    course.Tags.Add(tag);
            }
            else
            {
                // Nếu không có tag trong request thì xóa hết tag
                course.Tags.Clear();
            }

            await _context.SaveChangesAsync();

            // 🔹 Bài học
            if (request.Lessons?.Any() == true)
            {
                foreach (var l in request.Lessons)
                {
                    var ct = l.ContentType?.ToLower() ?? "";

                    if (ct == "video" && string.IsNullOrWhiteSpace(l.VideoUrl))
                        return BadRequest($"VideoUrl là bắt buộc khi ContentType = 'video' (bài học: {l.Title})");

                    Du_An_Web_Ban_Khoa_Hoc.Models.File? fileEntity = null;
                    if ((ct == "pdf" || ct == "text") && !string.IsNullOrWhiteSpace(l.FilePath))
                    {
                        fileEntity = new Du_An_Web_Ban_Khoa_Hoc.Models.File
                        {
                            CourseId = course.CourseId,
                            Name = Path.GetFileName(l.FilePath),
                            FilePath = l.FilePath,
                            FileType = Path.GetExtension(l.FilePath)?.TrimStart('.'),
                            UploadedAt = DateTime.UtcNow,
                            UploadedBy = instructorId
                        };
                        _context.Files.Add(fileEntity);
                        await _context.SaveChangesAsync();
                    }

                    var existingLesson = await _context.Lessons
                        .FirstOrDefaultAsync(x => x.LessonId == l.LessonId && x.CourseId == course.CourseId);

                    if (existingLesson != null)
                    {
                        existingLesson.Title = l.Title ?? existingLesson.Title;
                        existingLesson.ContentType = ct;
                        existingLesson.VideoUrl = ct == "video" ? l.VideoUrl : null;
                        existingLesson.FileId = (ct == "pdf" || ct == "text") ? fileEntity?.FileId : null;
                        existingLesson.DurationSec = l.DurationSec ?? existingLesson.DurationSec;
                        existingLesson.SortOrder = l.SortOrder > 0 ? l.SortOrder : existingLesson.SortOrder;
                    }
                    else
                    {
                        var newLesson = new Lesson
                        {
                            CourseId = course.CourseId,
                            Title = l.Title,
                            ContentType = ct,
                            VideoUrl = ct == "video" ? l.VideoUrl : null,
                            FileId = (ct == "pdf" || ct == "text") ? fileEntity?.FileId : null,
                            DurationSec = l.DurationSec,
                            SortOrder = l.SortOrder > 0 ? l.SortOrder : 1,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.Lessons.Add(newLesson);
                    }
                    await _context.SaveChangesAsync();
                }
            }

            // 🔹 Lấy danh sách bài học
            var lessonsResult = await (from l in _context.Lessons
                                       where l.CourseId == course.CourseId
                                       select new
                                       {
                                           l.LessonId,
                                           l.Title,
                                           l.ContentType,
                                           l.VideoUrl,
                                           l.FileId,
                                           File = (from f in _context.Files
                                                   where f.FileId == l.FileId
                                                   select new
                                                   {
                                                       f.FileId,
                                                       f.FilePath,
                                                       f.Name,
                                                       f.FileType
                                                   }).FirstOrDefault(),
                                           l.DurationSec,
                                           l.SortOrder
                                       }).ToListAsync();

            // 🔹 Truy vấn Tag duy nhất của course
            var tagsResult = await _context.Courses
                .Where(c => c.CourseId == course.CourseId)
                .SelectMany(c => c.Tags)
                .Select(t => new { t.TagId, t.TagName })
                .AsNoTracking()
                .ToListAsync();

            // 🔹 Trả kết quả
            return Ok(new
            {
                course.CourseId,
                course.Title,
                course.Description,
                course.CategoryId,
                course.ThumbnailUrl,
                course.Price,
                course.Duration,
                course.Level,
                course.Prerequisites,
                course.LearningOutcomes,
                course.Status,
                Lessons = lessonsResult,
                Tags = tagsResult
            });
        }


        //Tạo khóa học ở trạng thái Pending 

        //frontend gửi CourseId (lấy từ Step 1/Step 4), backend sẽ dựa vào CourseId + InstructorId
        //để tìm khóa học draft và chuyển trạng thái draft → pending
        [Authorize(Roles = "instructor")]
        [HttpPost("Post/publish/Tao_Khoa_hoc_o_trang_thai_Cho_Duyet/Pending")]
        public async Task<IActionResult> PublishDraftCourse([FromBody] PublishCourseRequest request)
        {
            // Lấy InstructorId từ token
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var instructorId))
                return Unauthorized("Token không hợp lệ");

            // Tìm khóa học draft dựa vào CourseId và InstructorId
            var draftCourse = await _context.Courses
                .FirstOrDefaultAsync(c => c.CourseId == request.CourseId
                                       && c.InstructorId == instructorId
                                       && c.Status == "draft");

            if (draftCourse == null)
                return NotFound("Không tìm thấy bản nháp với CourseId này");

            // Cập nhật trạng thái draft -> published
            draftCourse.Status = "published";
            draftCourse.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                draftCourse.CourseId,
                draftCourse.Status
            });
        }


        // Xóa khóa học
        [Authorize(Roles = "instructor")]
        [HttpDelete("courses/{courseId}/delete/Xoa_khoa_hoc")]
        public async Task<IActionResult> DeleteCourse(int courseId)
        {
            // Lấy InstructorId từ token
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            // Tìm khóa học của giảng viên
            var course = await _context.Courses
                .Include(c => c.Lessons)
                .Include(c => c.Files)
                .Include(c => c.Assignments)
                .Include(c => c.Reviews)
                .Include(c => c.Enrollments)
                .Include(c => c.Tags)
                .FirstOrDefaultAsync(c => c.CourseId == courseId && c.InstructorId == instructorId);

            if (course == null)
                return NotFound("Không tìm thấy khóa học hoặc bạn không có quyền xóa.");

            // Xóa dữ liệu liên quan
            if (course.Reviews.Any()) _context.Reviews.RemoveRange(course.Reviews);
            if (course.Enrollments.Any()) _context.Enrollments.RemoveRange(course.Enrollments);
            if (course.Assignments.Any()) _context.Assignments.RemoveRange(course.Assignments);
            if (course.Files.Any()) _context.Files.RemoveRange(course.Files);
            if (course.Lessons.Any()) _context.Lessons.RemoveRange(course.Lessons);
            if (course.Tags.Any()) course.Tags.Clear();

            // Xóa khóa học
            _context.Courses.Remove(course);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Xóa khóa học thành công!",
                courseId = course.CourseId
            });
        }
    }
}

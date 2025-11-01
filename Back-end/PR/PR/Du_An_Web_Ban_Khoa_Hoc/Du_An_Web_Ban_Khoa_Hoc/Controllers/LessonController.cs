using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;
using Humanizer;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using NuGet.Protocol.Plugins;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;
using System.Net;
using Du_An_Web_Ban_Khoa_Hoc.Models.DTO;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;// dung -> Authorize(Roles = "Instructor")]
using Microsoft.EntityFrameworkCore;


namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [Authorize(Roles = "instructor")]
    [Route("api/[Controller]")]
    [ApiController]
    public class LessonController : ControllerBase
    {
        private readonly AppDbContext _context;


        public LessonController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy thông tin Tổng Quan Khóa Học
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/{courseId}/Thong_tin_tien_do_bai_hoc")]
        public async Task<IActionResult> GetLessonProgressSummary(int courseId)
        {
            // Lấy InstructorId từ token
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            // Lấy khóa học và các bài học của giảng viên
            var course = await _context.Courses
                .Include(c => c.Lessons)
                .FirstOrDefaultAsync(c => c.CourseId == courseId && c.InstructorId == instructorId);

            if (course == null)
                return NotFound("Không tìm thấy khóa học hoặc bạn không có quyền truy cập.");

            var lessonIds = course.Lessons.Select(l => l.LessonId).ToList();

            // Lấy số học viên đã hoàn thành từng bài học
            var progressCounts = await _context.Progresses
                .Where(p => lessonIds.Contains(p.LessonId) && p.IsCompleted)
                .GroupBy(p => p.LessonId)
                .Select(g => new { LessonId = g.Key, CompletedStudents = g.Count() })
                .ToListAsync();

            // Kết hợp dữ liệu
            var result = course.Lessons.Select(l => new
            {
                l.LessonId,
                l.Title,
                CompletedStudents = progressCounts.FirstOrDefault(p => p.LessonId == l.LessonId)?.CompletedStudents ?? 0
            }).ToList();

            return Ok(new
            {
                CourseId = course.CourseId,
                Lessons = result
            });
        }


        //----Cài đặt----
        // Cập nhập từng phần 
        [Authorize]
        [HttpPatch("update/{courseId}/Cap_nhap_bai_hoc_Cai_Dat")]
        public async Task<IActionResult> UpdateCourse(int courseId, [FromBody] Patch_lesson_DTO dto)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var instructorId))
                return Unauthorized("Token không hợp lệ");

            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.CourseId == courseId && c.InstructorId == instructorId);

            if (course == null)
                return NotFound("Khóa học không tồn tại hoặc bạn không có quyền chỉnh sửa.");

            // Cập nhật từng thuộc tính nếu khác null
            if (!string.IsNullOrWhiteSpace(dto.Title))
                course.Title = dto.Title;

            if (!string.IsNullOrWhiteSpace(dto.Description))
                course.Description = dto.Description;

            if (!string.IsNullOrWhiteSpace(dto.Level))
                course.Level = dto.Level;

            if (dto.CategoryId.HasValue)
                course.CategoryId = dto.CategoryId.Value;

            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Cập nhật khóa học thành công",
                courseId = course.CourseId
            });
        }

        //-----Nội dung-----
        //Quản lý bài học (CRUD+Upload)

        //Thông tin trả về gồm:
        //Tiêu đề khóa học
        //Mô tả / nội dung khóa học
        //ContentType
        //Tổng thời lượng khóa học
        //Danh sách tài liệu(video, file, v.v.)
        //Trạng thái bài học: mặc định là “Đã xuất bản” (vì dựa vào trạng thái khóa học = “Published”)

        //Get: Lấy danh sách bài học của khóa học{id}
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/courses/{courseId}/lessons/Danh_sach_bai_hoc_theo_khoa_hoc")]
        public async Task<IActionResult> GetLessons(int courseId)
        {
            // Lấy InstructorId từ token
            var instructorIdClaim = User.FindFirst("InstructorId");
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            // Kiểm tra và lấy course + lessons
            var course = await _context.Courses
                .Include(c => c.Lessons)
                .FirstOrDefaultAsync(c => c.CourseId == courseId && c.InstructorId == instructorId);

            if (course == null)
                return NotFound("Khóa học không tồn tại hoặc bạn không có quyền truy cập.");

            // Lấy tất cả files thuộc course (có FilePath)
            var files = await _context.Files
                .Where(f => f.CourseId == courseId)
                .OrderByDescending(f => f.UploadedAt)
                .Select(f => new
                {
                    f.FileId,
                    f.Name,
                    f.FileType,
                    f.FileSizeBigint,
                    f.FilePath,      // <-- đảm bảo trả về FilePath
                    f.UploadedAt
                })
                .ToListAsync();

            // Map lessons — kết hợp file nếu lesson.FileID khác null
            var lessons = course.Lessons
                .OrderBy(l => l.SortOrder)
                .Select(l =>
                {
                    // tìm file tương ứng (nếu có)
                    var linkedFile = files.FirstOrDefault(ff => ff.FileId == l.FileId);

                    return new
                    {
                        l.LessonId,
                        l.Title,
                        ContentType = l.ContentType,
                        VideoUrl = l.VideoUrl,                       // nếu cột tên VideoURL trong DB
                        DurationSec = l.DurationSec,
                        Status = (l as dynamic).Status ?? "Published", // nếu có trường Status; nếu không, mặc định
                        l.SortOrder,
                        // thông tin file gắn với lesson (nếu có)
                        File = linkedFile == null ? null : new
                        {
                            linkedFile.FileId,
                            linkedFile.Name,
                            linkedFile.FilePath,   // <-- đảm bảo FilePath ở đây
                            linkedFile.UploadedAt
                        }
                    };
                })
                .ToList();

            var totalDuration = lessons.Sum(x => (int?)(x.DurationSec) ?? 0);

            return Ok(new
            {
                CourseId = course.CourseId,
                CourseTitle = course.Title,
                CourseDescription = course.Description,
                TotalLessons = lessons.Count,
                TotalDurationSec = totalDuration,
                Lessons = lessons,
                Files = files // list tổng tài nguyên kèm FilePath
            });
        }

        //Post: Tạo bài học mới
        [Authorize(Roles = "instructor")]
        [HttpPost("Post/courses/{courseId}/lessons/Tao_bai_hoc_moi")]
        public async Task<IActionResult> CreateLesson(int courseId, [FromBody] LessonDTO dto)
        {
            // Validate model
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Lấy instructorId từ token
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            // Kiểm tra khóa học
            var course = await _context.Courses
                .Include(c => c.Lessons)
                .FirstOrDefaultAsync(c => c.CourseId == courseId && c.InstructorId == instructorId);

            if (course == null)
                return NotFound("Khóa học không tồn tại hoặc bạn không có quyền thêm bài học.");

            // Validate ContentType
            if (string.IsNullOrWhiteSpace(dto.ContentType))
                return BadRequest("ContentType là bắt buộc.");

            var ct = dto.ContentType.ToLower();

            if (ct == "video" && string.IsNullOrWhiteSpace(dto.VideoUrl))
                return BadRequest("VideoUrl bắt buộc cho bài học video.");

            if ((ct == "file" || ct == "assignment" || ct == "document")
                && string.IsNullOrWhiteSpace(dto.FilePath) && dto.FileId == null)
                return BadRequest("Phải chọn FileId hoặc FilePath cho bài học loại file.");

            // Tạo File nếu chỉ có FilePath
            Du_An_Web_Ban_Khoa_Hoc.Models.File? fileEntity = null;
            if (!string.IsNullOrWhiteSpace(dto.FilePath))
            {
                fileEntity = new Du_An_Web_Ban_Khoa_Hoc.Models.File
                {
                    CourseId = courseId,
                    FilePath = dto.FilePath,
                    Name = Path.GetFileName(dto.FilePath),
                    UploadedAt = DateTime.UtcNow,
                    UploadedBy = instructorId
                };
                _context.Files.Add(fileEntity);
                await _context.SaveChangesAsync();
            }

            // Nếu FileId được gửi, lấy entity
            if (dto.FileId != null)
            {
                fileEntity = await _context.Files
                    .FirstOrDefaultAsync(f => f.FileId == dto.FileId);

                if (fileEntity == null)
                    return BadRequest("FileId không hợp lệ hoặc không tồn tại.");
            }

            // Tạo Lesson
            var lesson = new Lesson
            {
                CourseId = courseId,
                Title = dto.Title ?? "Bài học chưa có tiêu đề",
                ContentType = dto.ContentType,
                VideoUrl = dto.VideoUrl,
                FileId = fileEntity?.FileId,
                DurationSec = dto.DurationSec,
                SortOrder = dto.SortOrder ?? (course.Lessons.Count + 1),
                CreatedAt = DateTime.UtcNow
                // Status bỏ ra
            };

            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();

            // Trả về kết quả 
            var response = new
            {
                lesson.LessonId,
                lesson.Title,
                lesson.ContentType,
                lesson.VideoUrl,
                lesson.DurationSec,
                lesson.SortOrder,
                File = fileEntity == null ? null : new
                {
                    fileEntity.FileId,
                    fileEntity.FilePath,
                    fileEntity.Name
                }
            };

            return Ok(response);
        }

        //Put: Cập nhật bài học
        //Bỏ trống status 
        [Authorize(Roles = "instructor")]
        [HttpPut("Put/{courseId}/{lessonId}/Cap_nhap_bai_hoc")]
        public async Task<IActionResult> UpdateLessonPut(int courseId, int lessonId, [FromBody] LessonDTO dto)
        {
            // 🔹 Lấy instructorId từ token
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            // 🔹 Lấy lesson kèm Course
            var lesson = await _context.Lessons
                .Include(l => l.Course)
                .FirstOrDefaultAsync(l => l.LessonId == lessonId && l.CourseId == courseId && l.Course.InstructorId == instructorId);

            if (lesson == null)
                return NotFound("Lesson không tồn tại hoặc bạn không có quyền.");

            // 🔹 Cập nhật các trường từ DTO (nếu null thì giữ giá trị cũ)
            lesson.Title = dto.Title ?? lesson.Title;
            lesson.ContentType = dto.ContentType ?? lesson.ContentType;
            lesson.VideoUrl = dto.VideoUrl ?? lesson.VideoUrl;
            lesson.DurationSec = dto.DurationSec ?? lesson.DurationSec;
            lesson.SortOrder = dto.SortOrder ?? lesson.SortOrder;
            // lesson.CreatedAt giữ nguyên
            lesson.FileId = null;

            // 🔹 Xử lý file (chỉ lấy file đầu tiên nếu có)
            if (dto.Files != null && dto.Files.Any())
            {
                var firstFile = dto.Files.First();
                var file = await _context.Files
                    .FirstOrDefaultAsync(f => f.FileId == firstFile.FileId && f.CourseId == courseId);
                if (file != null)
                    lesson.FileId = file.FileId;
            }

            await _context.SaveChangesAsync();

            // 🔹 Trả về JSON an toàn (không vòng lặp)
            var fileEntity = lesson.FileId != null
                ? await _context.Files.FirstOrDefaultAsync(f => f.FileId == lesson.FileId)
                : null;

            var response = new
            {
                Message = "Cập nhật Lesson thành công",
                Lesson = new
                {
                    lesson.LessonId,
                    lesson.Title,
                    lesson.ContentType,
                    lesson.VideoUrl,
                    lesson.DurationSec,
                    lesson.SortOrder,
                    lesson.CreatedAt,
                    Course = new
                    {
                        lesson.Course.CourseId,
                        lesson.Course.Title
                    },
                    File = fileEntity != null
                        ? new
                        {
                            fileEntity.FileId,
                            fileEntity.Name,
                            fileEntity.FilePath
                        }
                        : null
                }
            };

            return Ok(response);
        }


        //Patch: Cập nhập 1 phần bài học 
        [Authorize(Roles = "instructor")]
        [HttpPatch("Patch/{courseId}/{lessonId}/Cap_nhap_tung_phan_bai_hoc")]
        public async Task<IActionResult> PatchLesson(int courseId, int lessonId, [FromBody] LessonDTO dto)
        {
            // Lấy instructorId từ token
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            // Lấy lesson cùng course
            var lesson = await _context.Lessons
                .Include(l => l.Course)
                .FirstOrDefaultAsync(l => l.LessonId == lessonId
                                       && l.CourseId == courseId
                                       && l.Course.InstructorId == instructorId);

            if (lesson == null)
                return NotFound("Lesson không tồn tại hoặc bạn không có quyền.");

            // --- Helper update string ---
            string? UpdateStringSafe(string? current, string? incoming)
                => !string.IsNullOrWhiteSpace(incoming) && incoming != "string" ? incoming : current;

            // --- Update các trường ---
            lesson.Title = UpdateStringSafe(lesson.Title, dto.Title);
            lesson.ContentType = UpdateStringSafe(lesson.ContentType, dto.ContentType);
            lesson.VideoUrl = UpdateStringSafe(lesson.VideoUrl, dto.VideoUrl);

            // Update int trực tiếp với nullable
            if (dto.DurationSec.HasValue && dto.DurationSec.Value != 0)
                lesson.DurationSec = dto.DurationSec.Value;

            if (dto.SortOrder.HasValue && dto.SortOrder.Value != 0)
                lesson.SortOrder = dto.SortOrder.Value;

            // --- FileId: chỉ update nếu có file hợp lệ ---
            if (dto.Files != null && dto.Files.Any())
            {
                var firstFile = dto.Files.First();
                var file = await _context.Files
                    .FirstOrDefaultAsync(f => f.FileId == firstFile.FileId && f.CourseId == courseId);
                if (file != null)
                    lesson.FileId = file.FileId; // update nếu có file
            }

            await _context.SaveChangesAsync();

            // --- Trả về dữ liệu gọn gàng ---
            return Ok(new
            {
                lesson.LessonId,
                lesson.CourseId,
                lesson.Title,
                lesson.ContentType,
                lesson.VideoUrl,
                lesson.FileId,
                lesson.DurationSec,
                lesson.SortOrder,
                lesson.CreatedAt
            });
        }




        //Delete: Xóa 1 bài học của 1 khóa học
        [Authorize(Roles = "instructor")]
        [HttpDelete("Delete/{courseId}/lessons/{lessonId}/Xoa_1_bai_hoc")]
        public async Task<IActionResult> DeleteLesson(int courseId, int lessonId)
        {
            // 🔹 Lấy InstructorId từ token
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            // 🔹 Tìm bài học thuộc khóa học của giảng viên
            var lesson = await _context.Lessons
                .Include(l => l.Course)
                .FirstOrDefaultAsync(l => l.LessonId == lessonId &&
                                          l.CourseId == courseId &&
                                          l.Course.InstructorId == instructorId);

            if (lesson == null)
                return NotFound("Bài học không tồn tại hoặc bạn không có quyền xóa.");

            // 🔹 Xóa bài học
            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã xóa bài học: {lesson.Title}"
            });
        }


        //Xóa toàn bộ bài học của 1 khóa học
        [Authorize(Roles = "instructor")]
        [HttpDelete("courses/{courseId}/lessons/all/Xoa_toan_bo_bai_hoc")]
        public async Task<IActionResult> DeleteAllLessons(int courseId)
        {
            // 🔹 Lấy InstructorId từ token
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            // 🔹 Kiểm tra khóa học thuộc về giảng viên này không
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.CourseId == courseId && c.InstructorId == instructorId);

            if (course == null)
                return NotFound("Không tìm thấy khóa học hoặc bạn không có quyền.");

            // 🔹 Lấy danh sách bài học trong khóa
            var lessons = await _context.Lessons
                .Where(l => l.CourseId == courseId)
                .ToListAsync();

            if (!lessons.Any())
                return NotFound("Không có bài học nào để xóa.");

            // 🔹 Xóa toàn bộ
            _context.Lessons.RemoveRange(lessons);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã xóa {lessons.Count} bài học trong khóa học '{course.Title}'."
            });
        }


        //Post: Upload file cho bài học
        [Authorize(Roles = "instructor")]
        [HttpPost("Post/{courseId}/lessons/{lessonId}/upload_File_cho_bai_hoc")]
        public async Task<IActionResult> UploadFile(int courseId, int lessonId, IFormFile file)
        {
            // 🔹 Lấy InstructorId từ token
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            // 🔹 Kiểm tra khóa học và bài học có thuộc về giảng viên không
            var lesson = await _context.Lessons
                .Include(l => l.Course)
                .FirstOrDefaultAsync(l => l.LessonId == lessonId &&
                                          l.CourseId == courseId &&
                                          l.Course.InstructorId == instructorId);

            if (lesson == null)
                return NotFound("Không tìm thấy bài học hoặc bạn không có quyền upload.");

            if (file == null || file.Length == 0)
                return BadRequest("Không có tệp nào được tải lên.");

            // 🔹 Tạo thư mục nếu chưa tồn tại
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "lessons");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            // 🔹 Đặt tên file duy nhất để tránh trùng
            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadPath, uniqueFileName);

            // 🔹 Ghi file vào ổ đĩa
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 🔹 Lưu thông tin file vào CSDL
            var dbFile = new Models.File
            {
                CourseId = courseId,
                Name = uniqueFileName,
                FilePath = $"/uploads/lessons/{uniqueFileName}",
                FileType = file.ContentType,
                FileSizeBigint = file.Length,
                UploadedBy = instructorId,
                UploadedAt = DateTime.UtcNow
            };

            _context.Files.Add(dbFile);
            await _context.SaveChangesAsync();

            // 🔹 Gắn file vào bài học (nếu có liên kết)
            lesson.FileId = dbFile.FileId;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Tải file lên thành công!",
                file = new
                {
                    dbFile.FileId,
                    dbFile.Name,
                    dbFile.FilePath,
                    dbFile.FileType,
                    dbFile.FileSizeBigint
                }
            });
        }


        //----Phân Tích-----

        //xem hiệu suất học viên cho một khóa học - 3api nhỏ

        //Get1: Lấy danh sách bài học của khóa học
        //Mục đích: chỉ trả về danh sách bài học và thông tin cơ bản.
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/{courseId}/lessons/Lay_danh_sach_tieu_de_cac_bai_hoc_cua_1_khoa_hoc")]
        public async Task<IActionResult> GetCourseLessons(int courseId)
        {
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            var lessons = await _context.Lessons
                .Where(l => l.CourseId == courseId && l.Course!.InstructorId == instructorId)
                .Select(l => new
                {
                    l.LessonId,
                    l.Title,
                })
                .ToListAsync();

            if (!lessons.Any())
                return NotFound("Không tìm thấy bài học hoặc bạn không có quyền truy cập.");

            return Ok(new
            {
                CourseId = courseId,
                Lessons = lessons
            });
        }

        //Api2: Lấy số học viên đã hoàn thành từng bài học
        //Mục đích: trả về số học viên hoàn thành từng bài học, có thể dùng cho biểu đồ.
        [Authorize(Roles = "instructor")]
        [HttpGet("courses/{courseId}/lessons/progress-count/Lay_tung_hoc_vien_da_hoan_thanh_bai_hoc")]
        public async Task<IActionResult> GetLessonProgressCounts(int courseId)
        {
            // Lấy instructorId từ claim
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            // Query trực tiếp progress với join, groupBy trên DB
            var progressCounts = await (from l in _context.Lessons
                                        join p in _context.Progresses
                                        on l.LessonId equals p.LessonId into lp
                                        from p in lp.DefaultIfEmpty()
                                        where l.CourseId == courseId && l.Course.InstructorId == instructorId
                                        group p by l.LessonId into g
                                        select new
                                        {
                                            LessonId = g.Key,
                                            CompletedStudents = g.Count(x => x != null && x.IsCompleted)
                                        })
                                       .AsNoTracking()  // giảm memory, query gọn
                                       .ToListAsync();

            if (!progressCounts.Any())
                return NotFound("Không tìm thấy bài học hoặc bạn không có quyền truy cập.");

            return Ok(new
            {
                CourseId = courseId,
                ProgressCounts = progressCounts
            });
        }



        //Api3: Lấy tổng số học viên ghi danh và tỷ lệ hoàn thành trung bình
        //Mục đích: trả về tổng số học viên và tỷ lệ hoàn thành trung bình, phục vụ thống kê tổng quan.
        [Authorize(Roles = "instructor")]
        [HttpGet("courses/{courseId}/lessons/completion-rate/Tong_hoc_vien_va_ty_le_hoan_thanh_trung_binh")]
        public async Task<IActionResult> GetLessonCompletionRate(int courseId)
        {
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            var lessons = await _context.Lessons
                .Where(l => l.CourseId == courseId && l.Course!.InstructorId == instructorId)
                .ToListAsync();

            if (!lessons.Any())
                return NotFound("Không tìm thấy bài học hoặc bạn không có quyền truy cập.");

            var totalLessons = lessons.Count;

            var enrollmentIds = await _context.Enrollments
                .Where(e => e.CourseId == courseId)
                .Select(e => e.EnrollmentId)
                .ToListAsync();

            double avgCompletionRate = 0;

            if (enrollmentIds.Any() && totalLessons > 0)
            {
                var completionRates = await _context.Progresses
                    .Where(p => enrollmentIds.Contains(p.EnrollmentId) && p.IsCompleted)
                    .GroupBy(p => p.EnrollmentId)
                    .Select(g => (double)g.Count() / totalLessons)
                    .ToListAsync();

                avgCompletionRate = completionRates.Any() ? completionRates.Average() : 0;
            }

            return Ok(new
            {
                CourseId = courseId,
                TotalStudents = enrollmentIds.Count,
                AvgCompletionRate = Math.Round(avgCompletionRate * 100, 2) // %
            });
        }

        //thống kê khóa học - 3Api
        //Gồm:
        //Lấy tổng số lượt xem và lượt hoàn thành
        //Lấy tỷ lệ hoàn thành trung bình
        //Lấy top 3 bài học được xem nhiều nhất

        //Api1: Tổng lượt xem & tổng lượt hoàn thành
        [Authorize(Roles = "instructor")]
        [HttpGet("courses/{courseId}/lessons/progress-summary/Tong_so_luot_xem_va_luot_hoan_thanh")]
        public async Task<IActionResult> GetLessonsProgressSummary(int courseId)
        {
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            // Query trực tiếp tổng lượt xem & hoàn thành join Lessons + Progresses
            var stats = await (from l in _context.Lessons
                               join p in _context.Progresses
                                   on l.LessonId equals p.LessonId into lp
                               from p in lp.DefaultIfEmpty()
                               where l.CourseId == courseId && l.Course.InstructorId == instructorId
                               group p by 1 into g // group tất cả để tính tổng
                               select new
                               {
                                   TotalViews = g.Count(x => x != null),
                                   TotalCompleted = g.Count(x => x != null && x.IsCompleted)
                               })
                              .AsNoTracking()
                              .FirstOrDefaultAsync();

            if (stats == null)
                return NotFound("Không tìm thấy bài học hoặc bạn không có quyền truy cập.");

            return Ok(new
            {
                CourseId = courseId,
                TotalViews = stats.TotalViews,
                TotalCompleted = stats.TotalCompleted
            });
        }


        //Api2: Tỷ lệ hoàn thành trung bình
        [Authorize(Roles = "instructor")]
        [HttpGet("courses/{courseId}/lessons/avg-completion-rate/Ty_le_hoan_thanh_trung_binh")]
        public async Task<IActionResult> GetLessonsAvgCompletionRate(int courseId)
        {
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            // Lấy số học viên ghi danh
            var studentCount = await _context.Enrollments
                .Where(e => e.CourseId == courseId)
                .CountAsync();

            if (studentCount == 0)
                return Ok(new { CourseId = courseId, AvgCompletionRate = 0 });

            // Tính tổng lượt hoàn thành & số lượng bài học trực tiếp trên DB
            var stats = await (from l in _context.Lessons
                               join p in _context.Progresses
                                   on l.LessonId equals p.LessonId into lp
                               from p in lp.DefaultIfEmpty()
                               where l.CourseId == courseId && l.Course.InstructorId == instructorId
                               group p by 1 into g
                               select new
                               {
                                   LessonCount = g.Select(x => x.LessonId).Distinct().Count(),
                                   TotalCompleted = g.Count(x => x != null && x.IsCompleted)
                               })
                              .AsNoTracking()
                              .FirstOrDefaultAsync();

            if (stats == null || stats.LessonCount == 0)
                return Ok(new { CourseId = courseId, AvgCompletionRate = 0 });

            double avgCompletionRate = (double)stats.TotalCompleted / (studentCount * stats.LessonCount);

            return Ok(new
            {
                CourseId = courseId,
                AvgCompletionRate = Math.Round(avgCompletionRate * 100, 2)
            });
        }


        //Api3: Top 3 bài học được xem nhiều nhất
        [Authorize(Roles = "instructor")]
        [HttpGet("courses/{courseId}/lessons/top-viewed/Top_3_bai_hoc_duoc_xem_nhieu_nhat")]
        public async Task<IActionResult> GetTopViewedLessons(int courseId, int top = 3)
        {
            var instructorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            var topLessons = await (from l in _context.Lessons
                                    join p in _context.Progresses
                                        on l.LessonId equals p.LessonId into lp
                                    from p in lp.DefaultIfEmpty()
                                    where l.CourseId == courseId && l.Course.InstructorId == instructorId
                                    group p by new { l.LessonId, l.Title } into g
                                    select new
                                    {
                                        g.Key.LessonId,
                                        g.Key.Title,
                                        Views = g.Count(x => x != null)
                                    })
                                   .OrderByDescending(l => l.Views)
                                   .Take(top)
                                   .AsNoTracking()
                                   .ToListAsync();

            return Ok(new
            {
                CourseId = courseId,
                TopLessons = topLessons
            });
        }



    }
}

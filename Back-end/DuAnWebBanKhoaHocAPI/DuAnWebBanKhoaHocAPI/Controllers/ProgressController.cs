using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProgressController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public ProgressController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Progress
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProgressDTO>>> GetProgresses()
        {
            var progresses = await _context.Set<Progress>()
                .Include(p => p.Enrollment)
                .ThenInclude(e => e.Course)
                .Include(p => p.Enrollment)
                .ThenInclude(e => e.User)
                .Include(p => p.Lesson)
                .Select(p => new ProgressDTO
                {
                    ProgressId = p.ProgressId,
                    EnrollmentId = p.EnrollmentId,
                    LessonId = p.LessonId,
                    IsCompleted = p.IsCompleted,
                    CompletedAt = p.CompletedAt,
                    Enrollment = new EnrollmentDTO
                    {
                        EnrollmentId = p.Enrollment.EnrollmentId,
                        CourseId = p.Enrollment.CourseId,
                        UserId = p.Enrollment.UserId,
                        EnrollDate = p.Enrollment.EnrollDate,
                        Status = p.Enrollment.Status,
                        Course = new CourseSimpleDTO
                        {
                            CourseId = p.Enrollment.Course.CourseId,
                            Title = p.Enrollment.Course.Title,
                            Description = p.Enrollment.Course.Description,
                            Price = p.Enrollment.Course.Price,
                            ThumbnailUrl = p.Enrollment.Course.ThumbnailUrl
                        },
                        User = new UserSimpleDTO
                        {
                            UserId = p.Enrollment.User.UserId,
                            FullName = p.Enrollment.User.FullName,
                            Email = p.Enrollment.User.Email,
                            AvatarUrl = p.Enrollment.User.AvatarUrl
                        },
                        CompletedLessons = _context.Set<Progress>()
                            .Count(pr => pr.EnrollmentId == p.EnrollmentId && pr.IsCompleted),
                        TotalLessons = _context.Lessons
                            .Count(l => l.CourseId == p.Enrollment.CourseId),
                        LastActivity = _context.Set<Progress>()
                            .Where(pr => pr.EnrollmentId == p.EnrollmentId)
                            .Max(pr => (DateTime?)pr.CompletedAt)
                    },
                    Lesson = new LessonDTO
                    {
                        LessonId = p.Lesson.LessonId,
                        Title = p.Lesson.Title,
                        ContentType = p.Lesson.ContentType,
                        VideoUrl = p.Lesson.VideoUrl,
                        FileId = p.Lesson.FileId,
                        DurationSec = p.Lesson.DurationSec,
                        SortOrder = p.Lesson.SortOrder,
                        CreatedAt = p.Lesson.CreatedAt,
                        CourseId = p.Lesson.CourseId
                    }
                })
                .ToListAsync();

            return Ok(progresses);
        }

        // GET: api/Progress/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProgressDTO>> GetProgress(int id)
        {
            var progress = await _context.Set<Progress>()
                .Include(p => p.Enrollment)
                .ThenInclude(e => e.Course)
                .Include(p => p.Enrollment)
                .ThenInclude(e => e.User)
                .Include(p => p.Lesson)
                .Where(p => p.ProgressId == id)
                .Select(p => new ProgressDTO
                {
                    ProgressId = p.ProgressId,
                    EnrollmentId = p.EnrollmentId,
                    LessonId = p.LessonId,
                    IsCompleted = p.IsCompleted,
                    CompletedAt = p.CompletedAt,
                    Enrollment = new EnrollmentDTO
                    {
                        EnrollmentId = p.Enrollment.EnrollmentId,
                        CourseId = p.Enrollment.CourseId,
                        UserId = p.Enrollment.UserId,
                        EnrollDate = p.Enrollment.EnrollDate,
                        Status = p.Enrollment.Status,
                        Course = new CourseSimpleDTO
                        {
                            CourseId = p.Enrollment.Course.CourseId,
                            Title = p.Enrollment.Course.Title,
                            Description = p.Enrollment.Course.Description,
                            Price = p.Enrollment.Course.Price,
                            ThumbnailUrl = p.Enrollment.Course.ThumbnailUrl
                        },
                        User = new UserSimpleDTO
                        {
                            UserId = p.Enrollment.User.UserId,
                            FullName = p.Enrollment.User.FullName,
                            Email = p.Enrollment.User.Email,
                            AvatarUrl = p.Enrollment.User.AvatarUrl
                        }
                    },
                    Lesson = new LessonDTO
                    {
                        LessonId = p.Lesson.LessonId,
                        Title = p.Lesson.Title,
                        ContentType = p.Lesson.ContentType,
                        VideoUrl = p.Lesson.VideoUrl,
                        FileId = p.Lesson.FileId,
                        DurationSec = p.Lesson.DurationSec,
                        SortOrder = p.Lesson.SortOrder,
                        CreatedAt = p.Lesson.CreatedAt,
                        CourseId = p.Lesson.CourseId
                    }
                })
                .FirstOrDefaultAsync();

            if (progress == null)
            {
                return NotFound(new { message = $"Progress with ID {id} not found" });
            }

            return progress;
        }

        // GET: api/Progress/ByEnrollment/5
        [HttpGet("ByEnrollment/{enrollmentId}")]
        public async Task<ActionResult<IEnumerable<ProgressDTO>>> GetProgressByEnrollment(int enrollmentId)
        {
            var progresses = await _context.Set<Progress>()
                .Where(p => p.EnrollmentId == enrollmentId)
                .Include(p => p.Lesson)
                .Select(p => new ProgressDTO
                {
                    ProgressId = p.ProgressId,
                    EnrollmentId = p.EnrollmentId,
                    LessonId = p.LessonId,
                    IsCompleted = p.IsCompleted,
                    CompletedAt = p.CompletedAt,
                    Lesson = new LessonDTO
                    {
                        LessonId = p.Lesson.LessonId,
                        Title = p.Lesson.Title,
                        ContentType = p.Lesson.ContentType,
                        VideoUrl = p.Lesson.VideoUrl,
                        FileId = p.Lesson.FileId,
                        DurationSec = p.Lesson.DurationSec,
                        SortOrder = p.Lesson.SortOrder,
                        CreatedAt = p.Lesson.CreatedAt,
                        CourseId = p.Lesson.CourseId
                    }
                })
                .OrderBy(p => p.Lesson.SortOrder)
                .ToListAsync();

            return Ok(progresses);
        }

        // GET: api/Progress/ByUser/5
        [HttpGet("ByUser/{userId}")]
        public async Task<ActionResult<IEnumerable<ProgressDTO>>> GetProgressByUser(int userId)
        {
            var progresses = await _context.Set<Progress>()
                .Include(p => p.Enrollment)
                .Where(p => p.Enrollment.UserId == userId)
                .Include(p => p.Lesson)
                .ThenInclude(l => l.Course)
                .Select(p => new ProgressDTO
                {
                    ProgressId = p.ProgressId,
                    EnrollmentId = p.EnrollmentId,
                    LessonId = p.LessonId,
                    IsCompleted = p.IsCompleted,
                    CompletedAt = p.CompletedAt,
                    Enrollment = new EnrollmentDTO
                    {
                        EnrollmentId = p.Enrollment.EnrollmentId,
                        CourseId = p.Enrollment.CourseId,
                        UserId = p.Enrollment.UserId,
                        Status = p.Enrollment.Status
                    },
                    Lesson = new LessonDTO
                    {
                        LessonId = p.Lesson.LessonId,
                        Title = p.Lesson.Title,
                        ContentType = p.Lesson.ContentType,
                        VideoUrl = p.Lesson.VideoUrl,
                        FileId = p.Lesson.FileId,
                        DurationSec = p.Lesson.DurationSec,
                        SortOrder = p.Lesson.SortOrder,
                        CreatedAt = p.Lesson.CreatedAt,
                        CourseId = p.Lesson.CourseId
                    }
                })
                .OrderByDescending(p => p.CompletedAt)
                .ToListAsync();

            return Ok(progresses);
        }

        // GET: api/Progress/Student/5/Summary
        [HttpGet("Student/{studentId}/Summary")]
        public async Task<ActionResult<StudentProgressSummaryDTO>> GetStudentProgressSummary(int studentId)
        {
            // Check if student exists
            var student = await _context.Students
                .Include(s => s.StudentNavigation)
                .FirstOrDefaultAsync(s => s.StudentId == studentId);

            if (student == null)
            {
                return NotFound(new { message = $"Student with ID {studentId} not found" });
            }

            // Get all enrollments for the student
            var enrollments = await _context.Enrollments
                .Where(e => e.UserId == studentId)
                .Include(e => e.Course)
                .ToListAsync();

            var courseProgressList = new List<CourseProgressDTO>();

            foreach (var enrollment in enrollments)
            {
                // ĐỔI TÊN: totalLessons -> totalLessonsInCourse
                var totalLessonsInCourse = await _context.Lessons
                    .CountAsync(l => l.CourseId == enrollment.CourseId);

                var completedLessons = await _context.Set<Progress>()
                    .CountAsync(p => p.EnrollmentId == enrollment.EnrollmentId && p.IsCompleted);

                var lastActivity = await _context.Set<Progress>()
                    .Where(p => p.EnrollmentId == enrollment.EnrollmentId)
                    .MaxAsync(p => (DateTime?)p.CompletedAt);

                courseProgressList.Add(new CourseProgressDTO
                {
                    CourseId = enrollment.CourseId,
                    CourseTitle = enrollment.Course.Title,
                    EnrollmentId = enrollment.EnrollmentId,
                    TotalLessons = totalLessonsInCourse, // Sử dụng tên mới
                    CompletedLessons = completedLessons,
                    ProgressPercentage = totalLessonsInCourse > 0 ? (decimal)completedLessons / totalLessonsInCourse * 100 : 0,
                    LastActivity = lastActivity,
                    EnrollmentDate = enrollment.EnrollDate
                });
            }

            var totalCompletedLessons = courseProgressList.Sum(cp => cp.CompletedLessons);
            var totalLessons = courseProgressList.Sum(cp => cp.TotalLessons); // Giữ nguyên tên này

            var summary = new StudentProgressSummaryDTO
            {
                StudentId = studentId,
                FullName = student.StudentNavigation.FullName,
                Email = student.StudentNavigation.Email,
                TotalEnrollments = enrollments.Count,
                TotalLessons = totalLessons,
                CompletedLessons = totalCompletedLessons,
                OverallProgressPercentage = totalLessons > 0 ? (decimal)totalCompletedLessons / totalLessons * 100 : 0,
                LastActivity = courseProgressList.Max(cp => cp.LastActivity),
                CourseProgress = courseProgressList.OrderByDescending(cp => cp.LastActivity).ToList()
            };

            return Ok(summary);
        }

        // GET: api/Progress/Course/5/Statistics
        [HttpGet("Course/{courseId}/Statistics")]
        public async Task<ActionResult> GetCourseProgressStatistics(int courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                return NotFound(new { message = $"Course with ID {courseId} not found" });
            }

            var totalLessons = await _context.Lessons
                .CountAsync(l => l.CourseId == courseId);

            var enrollments = await _context.Enrollments
                .Where(e => e.CourseId == courseId)
                .Include(e => e.User)
                .ToListAsync();

            var statistics = new
            {
                CourseId = courseId,
                CourseTitle = course.Title,
                TotalEnrollments = enrollments.Count,
                TotalLessons = totalLessons,
                AverageProgress = enrollments.Any() ?
                    enrollments.Average(e =>
                    {
                        var completed = _context.Set<Progress>()
                            .Count(p => p.EnrollmentId == e.EnrollmentId && p.IsCompleted);
                        return totalLessons > 0 ? (double)completed / totalLessons * 100 : 0;
                    }) : 0,
                CompletionRate = enrollments.Any() ?
                    (double)enrollments.Count(e =>
                    {
                        var completed = _context.Set<Progress>()
                            .Count(p => p.EnrollmentId == e.EnrollmentId && p.IsCompleted);
                        return completed == totalLessons && totalLessons > 0;
                    }) / enrollments.Count * 100 : 0,
                StudentProgress = enrollments.Select(e => new
                {
                    UserId = e.UserId,
                    FullName = e.User.FullName,
                    CompletedLessons = _context.Set<Progress>()
                        .Count(p => p.EnrollmentId == e.EnrollmentId && p.IsCompleted),
                    TotalLessons = totalLessons,
                    ProgressPercentage = totalLessons > 0 ?
                        (decimal)_context.Set<Progress>()
                            .Count(p => p.EnrollmentId == e.EnrollmentId && p.IsCompleted) / totalLessons * 100 : 0,
                    LastActivity = _context.Set<Progress>()
                        .Where(p => p.EnrollmentId == e.EnrollmentId)
                        .Max(p => (DateTime?)p.CompletedAt)
                }).OrderByDescending(sp => sp.ProgressPercentage).ToList()
            };

            return Ok(statistics);
        }

        // POST: api/Progress
        [HttpPost]
        public async Task<ActionResult<ProgressDTO>> PostProgress(ProgressCreateDTO progressCreateDTO)
        {
            // Check if enrollment exists
            var enrollment = await _context.Enrollments.FindAsync(progressCreateDTO.EnrollmentId);
            if (enrollment == null)
            {
                return BadRequest(new { message = "Enrollment not found" });
            }

            // Check if lesson exists
            var lesson = await _context.Lessons.FindAsync(progressCreateDTO.LessonId);
            if (lesson == null)
            {
                return BadRequest(new { message = "Lesson not found" });
            }

            // Check if progress already exists for this enrollment and lesson
            var existingProgress = await _context.Set<Progress>()
                .FirstOrDefaultAsync(p => p.EnrollmentId == progressCreateDTO.EnrollmentId &&
                                         p.LessonId == progressCreateDTO.LessonId);

            if (existingProgress != null)
            {
                // Update existing progress
                existingProgress.IsCompleted = progressCreateDTO.IsCompleted;
                existingProgress.CompletedAt = progressCreateDTO.IsCompleted ? DateTime.UtcNow : null;

                _context.Entry(existingProgress).State = EntityState.Modified;
            }
            else
            {
                // Create new progress
                var progress = new Progress
                {
                    EnrollmentId = progressCreateDTO.EnrollmentId,
                    LessonId = progressCreateDTO.LessonId,
                    IsCompleted = progressCreateDTO.IsCompleted,
                    CompletedAt = progressCreateDTO.IsCompleted ? DateTime.UtcNow : null
                };

                _context.Set<Progress>().Add(progress);
            }

            // Update student's last active
            var student = await _context.Students.FindAsync(enrollment.UserId);
            if (student != null)
            {
                student.LastActive = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Return the created/updated progress
            var progressDTO = new ProgressDTO
            {
                EnrollmentId = progressCreateDTO.EnrollmentId,
                LessonId = progressCreateDTO.LessonId,
                IsCompleted = progressCreateDTO.IsCompleted,
                CompletedAt = progressCreateDTO.IsCompleted ? DateTime.UtcNow : null
            };

            return CreatedAtAction("GetProgress", new { id = existingProgress?.ProgressId }, progressDTO);
        }

        // POST: api/Progress/Bulk
        [HttpPost("Bulk")]
        public async Task<ActionResult> PostProgressBulk(ProgressBulkCreateDTO progressBulkCreateDTO)
        {
            // Check if enrollment exists
            var enrollment = await _context.Enrollments.FindAsync(progressBulkCreateDTO.EnrollmentId);
            if (enrollment == null)
            {
                return BadRequest(new { message = "Enrollment not found" });
            }

            var progressRecords = new List<Progress>();

            foreach (var lessonId in progressBulkCreateDTO.LessonIds)
            {
                // Check if lesson exists
                var lesson = await _context.Lessons.FindAsync(lessonId);
                if (lesson == null)
                {
                    continue; // Skip invalid lesson IDs
                }

                // Check if progress already exists
                var existingProgress = await _context.Set<Progress>()
                    .FirstOrDefaultAsync(p => p.EnrollmentId == progressBulkCreateDTO.EnrollmentId &&
                                             p.LessonId == lessonId);

                if (existingProgress != null)
                {
                    // Update existing progress
                    existingProgress.IsCompleted = progressBulkCreateDTO.IsCompleted;
                    existingProgress.CompletedAt = progressBulkCreateDTO.IsCompleted ? DateTime.UtcNow : null;
                }
                else
                {
                    // Create new progress
                    var progress = new Progress
                    {
                        EnrollmentId = progressBulkCreateDTO.EnrollmentId,
                        LessonId = lessonId,
                        IsCompleted = progressBulkCreateDTO.IsCompleted,
                        CompletedAt = progressBulkCreateDTO.IsCompleted ? DateTime.UtcNow : null
                    };
                    progressRecords.Add(progress);
                }
            }

            if (progressRecords.Any())
            {
                _context.Set<Progress>().AddRange(progressRecords);
            }

            // Update student's last active
            var student = await _context.Students.FindAsync(enrollment.UserId);
            if (student != null)
            {
                student.LastActive = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"{progressBulkCreateDTO.LessonIds.Count} progress records processed successfully",
                created = progressRecords.Count,
                updated = progressBulkCreateDTO.LessonIds.Count - progressRecords.Count
            });
        }

        // PUT: api/Progress/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProgress(int id, ProgressUpdateDTO progressUpdateDTO)
        {
            var progress = await _context.Set<Progress>().FindAsync(id);
            if (progress == null)
            {
                return NotFound();
            }

            progress.IsCompleted = progressUpdateDTO.IsCompleted;
            progress.CompletedAt = progressUpdateDTO.IsCompleted ? DateTime.UtcNow : null;

            _context.Entry(progress).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProgressExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // PATCH: api/Progress/5/Complete
        [HttpPatch("{id}/Complete")]
        public async Task<IActionResult> CompleteProgress(int id)
        {
            var progress = await _context.Set<Progress>().FindAsync(id);
            if (progress == null)
            {
                return NotFound();
            }

            progress.IsCompleted = true;
            progress.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Progress/5/Incomplete
        [HttpPatch("{id}/Incomplete")]
        public async Task<IActionResult> MarkProgressIncomplete(int id)
        {
            var progress = await _context.Set<Progress>().FindAsync(id);
            if (progress == null)
            {
                return NotFound();
            }

            progress.IsCompleted = false;
            progress.CompletedAt = null;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Progress/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProgress(int id)
        {
            var progress = await _context.Set<Progress>().FindAsync(id);
            if (progress == null)
            {
                return NotFound();
            }

            _context.Set<Progress>().Remove(progress);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Progress/ByEnrollment/5
        [HttpDelete("ByEnrollment/{enrollmentId}")]
        public async Task<IActionResult> DeleteProgressByEnrollment(int enrollmentId)
        {
            var progresses = await _context.Set<Progress>()
                .Where(p => p.EnrollmentId == enrollmentId)
                .ToListAsync();

            if (!progresses.Any())
            {
                return NotFound(new { message = $"No progress records found for enrollment ID {enrollmentId}" });
            }

            _context.Set<Progress>().RemoveRange(progresses);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{progresses.Count} progress records deleted successfully" });
        }

        private bool ProgressExists(int id)
        {
            return _context.Set<Progress>().Any(e => e.ProgressId == id);
        }
    }
}
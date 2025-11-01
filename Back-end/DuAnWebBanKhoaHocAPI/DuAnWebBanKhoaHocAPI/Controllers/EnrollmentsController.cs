using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnrollmentsController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public EnrollmentsController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Enrollments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EnrollmentDTO>>> GetEnrollments()
        {
            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                .Include(e => e.User)
                .Select(e => new EnrollmentDTO
                {
                    EnrollmentId = e.EnrollmentId,
                    CourseId = e.CourseId,
                    UserId = e.UserId,
                    EnrollDate = e.EnrollDate,
                    Status = e.Status,
                    Course = new CourseSimpleDTO
                    {
                        CourseId = e.Course.CourseId,
                        Title = e.Course.Title,
                        Description = e.Course.Description,
                        Price = e.Course.Price,
                        ThumbnailUrl = e.Course.ThumbnailUrl
                    },
                    User = new UserSimpleDTO
                    {
                        UserId = e.User.UserId,
                        FullName = e.User.FullName,
                        Email = e.User.Email,
                        AvatarUrl = e.User.AvatarUrl
                    },
                    CompletedLessons = _context.Set<Progress>()
                        .Count(p => p.EnrollmentId == e.EnrollmentId && p.IsCompleted),
                    TotalLessons = _context.Lessons
                        .Count(l => l.CourseId == e.CourseId),
                    LastActivity = _context.Set<Progress>()
                        .Where(p => p.EnrollmentId == e.EnrollmentId)
                        .Max(p => (DateTime?)p.CompletedAt)
                })
                .ToListAsync();

            return Ok(enrollments);
        }

        // GET: api/Enrollments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EnrollmentDTO>> GetEnrollment(int id)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.Course)
                .Include(e => e.User)
                .Where(e => e.EnrollmentId == id)
                .Select(e => new EnrollmentDTO
                {
                    EnrollmentId = e.EnrollmentId,
                    CourseId = e.CourseId,
                    UserId = e.UserId,
                    EnrollDate = e.EnrollDate,
                    Status = e.Status,
                    Course = new CourseSimpleDTO
                    {
                        CourseId = e.Course.CourseId,
                        Title = e.Course.Title,
                        Description = e.Course.Description,
                        Price = e.Course.Price,
                        ThumbnailUrl = e.Course.ThumbnailUrl
                    },
                    User = new UserSimpleDTO
                    {
                        UserId = e.User.UserId,
                        FullName = e.User.FullName,
                        Email = e.User.Email,
                        AvatarUrl = e.User.AvatarUrl
                    },
                    CompletedLessons = _context.Set<Progress>()
                        .Count(p => p.EnrollmentId == e.EnrollmentId && p.IsCompleted),
                    TotalLessons = _context.Lessons
                        .Count(l => l.CourseId == e.CourseId),
                    LastActivity = _context.Set<Progress>()
                        .Where(p => p.EnrollmentId == e.EnrollmentId)
                        .Max(p => (DateTime?)p.CompletedAt)
                })
                .FirstOrDefaultAsync();

            if (enrollment == null)
            {
                return NotFound(new { message = $"Enrollment with ID {id} not found" });
            }

            return enrollment;
        }

        // GET: api/Enrollments/ByUser/5
        [HttpGet("ByUser/{userId}")]
        public async Task<ActionResult<IEnumerable<EnrollmentProgressDTO>>> GetEnrollmentsByUser(int userId)
        {
            var enrollments = await _context.Enrollments
                .Where(e => e.UserId == userId)
                .Include(e => e.Course)
                .Select(e => new EnrollmentProgressDTO
                {
                    EnrollmentId = e.EnrollmentId,
                    CourseId = e.CourseId,
                    CourseTitle = e.Course.Title,
                    CompletedLessons = _context.Set<Progress>()
                        .Count(p => p.EnrollmentId == e.EnrollmentId && p.IsCompleted),
                    TotalLessons = _context.Lessons
                        .Count(l => l.CourseId == e.CourseId),
                    ProgressPercentage = _context.Lessons.Count(l => l.CourseId == e.CourseId) > 0 ?
                        (decimal)_context.Set<Progress>()
                            .Count(p => p.EnrollmentId == e.EnrollmentId && p.IsCompleted) /
                        _context.Lessons.Count(l => l.CourseId == e.CourseId) * 100 : 0,
                    LastActivity = _context.Set<Progress>()
                        .Where(p => p.EnrollmentId == e.EnrollmentId)
                        .Max(p => (DateTime?)p.CompletedAt)
                })
                .ToListAsync();

            return Ok(enrollments);
        }

        // GET: api/Enrollments/ByCourse/5
        [HttpGet("ByCourse/{courseId}")]
        public async Task<ActionResult<IEnumerable<EnrollmentDTO>>> GetEnrollmentsByCourse(int courseId)
        {
            var enrollments = await _context.Enrollments
                .Where(e => e.CourseId == courseId)
                .Include(e => e.User)
                .Select(e => new EnrollmentDTO
                {
                    EnrollmentId = e.EnrollmentId,
                    CourseId = e.CourseId,
                    UserId = e.UserId,
                    EnrollDate = e.EnrollDate,
                    Status = e.Status,
                    User = new UserSimpleDTO
                    {
                        UserId = e.User.UserId,
                        FullName = e.User.FullName,
                        Email = e.User.Email,
                        AvatarUrl = e.User.AvatarUrl
                    },
                    CompletedLessons = _context.Set<Progress>()
                        .Count(p => p.EnrollmentId == e.EnrollmentId && p.IsCompleted),
                    TotalLessons = _context.Lessons
                        .Count(l => l.CourseId == e.CourseId),
                    LastActivity = _context.Set<Progress>()
                        .Where(p => p.EnrollmentId == e.EnrollmentId)
                        .Max(p => (DateTime?)p.CompletedAt)
                })
                .ToListAsync();

            return Ok(enrollments);
        }

        // GET: api/Enrollments/5/Progress
        [HttpGet("{id}/Progress")]
        public async Task<ActionResult<EnrollmentProgressDTO>> GetEnrollmentProgress(int id)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.Course)
                .Where(e => e.EnrollmentId == id)
                .Select(e => new EnrollmentProgressDTO
                {
                    EnrollmentId = e.EnrollmentId,
                    CourseId = e.CourseId,
                    CourseTitle = e.Course.Title,
                    CompletedLessons = _context.Set<Progress>()
                        .Count(p => p.EnrollmentId == e.EnrollmentId && p.IsCompleted),
                    TotalLessons = _context.Lessons
                        .Count(l => l.CourseId == e.CourseId),
                    ProgressPercentage = _context.Lessons.Count(l => l.CourseId == e.CourseId) > 0 ?
                        (decimal)_context.Set<Progress>()
                            .Count(p => p.EnrollmentId == e.EnrollmentId && p.IsCompleted) /
                        _context.Lessons.Count(l => l.CourseId == e.CourseId) * 100 : 0,
                    LastActivity = _context.Set<Progress>()
                        .Where(p => p.EnrollmentId == e.EnrollmentId)
                        .Max(p => (DateTime?)p.CompletedAt),
                    Lessons = _context.Lessons
                        .Where(l => l.CourseId == e.CourseId)
                        .OrderBy(l => l.SortOrder)
                        .Select(l => new LessonProgressDTO
                        {
                            LessonId = l.LessonId,
                            Title = l.Title,
                            SortOrder = l.SortOrder,
                            IsCompleted = _context.Set<Progress>()
                                .Any(p => p.EnrollmentId == e.EnrollmentId &&
                                         p.LessonId == l.LessonId &&
                                         p.IsCompleted),
                            CompletedAt = _context.Set<Progress>()
                                .Where(p => p.EnrollmentId == e.EnrollmentId &&
                                           p.LessonId == l.LessonId &&
                                           p.IsCompleted)
                                .Select(p => p.CompletedAt)
                                .FirstOrDefault()
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (enrollment == null)
            {
                return NotFound(new { message = $"Enrollment with ID {id} not found" });
            }

            return enrollment;
        }

        // POST: api/Enrollments
        [HttpPost]
        public async Task<ActionResult<EnrollmentDTO>> PostEnrollment(EnrollmentCreateDTO enrollmentCreateDTO)
        {
            // Check if user exists
            var user = await _context.Users.FindAsync(enrollmentCreateDTO.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            // Check if course exists
            var course = await _context.Courses.FindAsync(enrollmentCreateDTO.CourseId);
            if (course == null)
            {
                return BadRequest(new { message = "Course not found" });
            }

            // Check if already enrolled
            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == enrollmentCreateDTO.UserId &&
                                         e.CourseId == enrollmentCreateDTO.CourseId);
            if (existingEnrollment != null)
            {
                return Conflict(new { message = "User is already enrolled in this course" });
            }

            var enrollment = new Enrollment
            {
                CourseId = enrollmentCreateDTO.CourseId,
                UserId = enrollmentCreateDTO.UserId,
                EnrollDate = DateTime.UtcNow,
                Status = enrollmentCreateDTO.Status
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            // Update student's enrollment count
            var student = await _context.Students.FindAsync(enrollmentCreateDTO.UserId);
            if (student != null)
            {
                student.EnrollmentCount = await _context.Enrollments
                    .CountAsync(e => e.UserId == enrollmentCreateDTO.UserId && e.Status == "active");
                student.LastActive = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            // Return the created enrollment
            var enrollmentDTO = new EnrollmentDTO
            {
                EnrollmentId = enrollment.EnrollmentId,
                CourseId = enrollment.CourseId,
                UserId = enrollment.UserId,
                EnrollDate = enrollment.EnrollDate,
                Status = enrollment.Status,
                CompletedLessons = 0,
                TotalLessons = await _context.Lessons.CountAsync(l => l.CourseId == enrollment.CourseId)
            };

            return CreatedAtAction("GetEnrollment", new { id = enrollment.EnrollmentId }, enrollmentDTO);
        }

        // PUT: api/Enrollments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEnrollment(int id, EnrollmentUpdateDTO enrollmentUpdateDTO)
        {
            var enrollment = await _context.Enrollments.FindAsync(id);
            if (enrollment == null)
            {
                return NotFound();
            }

            enrollment.Status = enrollmentUpdateDTO.Status;

            _context.Entry(enrollment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EnrollmentExists(id))
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

        // PATCH: api/Enrollments/5/Complete
        [HttpPatch("{id}/Complete")]
        public async Task<IActionResult> CompleteEnrollment(int id)
        {
            var enrollment = await _context.Enrollments.FindAsync(id);
            if (enrollment == null)
            {
                return NotFound();
            }

            enrollment.Status = "completed";

            // Update student's completed courses count
            var student = await _context.Students.FindAsync(enrollment.UserId);
            if (student != null)
            {
                student.CompletedCourses = await _context.Enrollments
                    .CountAsync(e => e.UserId == enrollment.UserId && e.Status == "completed");
                student.LastActive = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Enrollments/5/Progress/3/Complete
        [HttpPost("{enrollmentId}/Progress/{lessonId}/Complete")]
        public async Task<IActionResult> MarkLessonComplete(int enrollmentId, int lessonId)
        {
            var enrollment = await _context.Enrollments.FindAsync(enrollmentId);
            if (enrollment == null)
            {
                return NotFound(new { message = "Enrollment not found" });
            }

            var lesson = await _context.Lessons.FindAsync(lessonId);
            if (lesson == null)
            {
                return NotFound(new { message = "Lesson not found" });
            }

            // Check if progress already exists
            var existingProgress = await _context.Set<Progress>()
                .FirstOrDefaultAsync(p => p.EnrollmentId == enrollmentId && p.LessonId == lessonId);

            if (existingProgress != null)
            {
                // Update existing progress
                existingProgress.IsCompleted = true;
                existingProgress.CompletedAt = DateTime.UtcNow;
            }
            else
            {
                // Create new progress
                var progress = new Progress
                {
                    EnrollmentId = enrollmentId,
                    LessonId = lessonId,
                    IsCompleted = true,
                    CompletedAt = DateTime.UtcNow
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

            return NoContent();
        }

        // DELETE: api/Enrollments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEnrollment(int id)
        {
            var enrollment = await _context.Enrollments.FindAsync(id);
            if (enrollment == null)
            {
                return NotFound();
            }

            _context.Enrollments.Remove(enrollment);

            // Update student's enrollment count
            var student = await _context.Students.FindAsync(enrollment.UserId);
            if (student != null)
            {
                student.EnrollmentCount = await _context.Enrollments
                    .CountAsync(e => e.UserId == enrollment.UserId && e.Status == "active");
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Enrollments/ByUserAndCourse
        [HttpDelete("ByUserAndCourse")]
        public async Task<IActionResult> DeleteEnrollmentByUserAndCourse(int userId, int courseId)
        {
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

            if (enrollment == null)
            {
                return NotFound();
            }

            _context.Enrollments.Remove(enrollment);

            // Update student's enrollment count
            var student = await _context.Students.FindAsync(userId);
            if (student != null)
            {
                student.EnrollmentCount = await _context.Enrollments
                    .CountAsync(e => e.UserId == userId && e.Status == "active");
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EnrollmentExists(int id)
        {
            return _context.Enrollments.Any(e => e.EnrollmentId == id);
        }
    }
}
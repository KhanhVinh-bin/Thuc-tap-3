using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public CoursesController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Courses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseDTO>>> GetCourses()
        {
            var courses = await _context.Courses
                .Include(c => c.Instructor)
                .Include(c => c.Category)
                .Select(c => new CourseDTO
                {
                    CourseId = c.CourseId,
                    Title = c.Title,
                    Description = c.Description,
                    Price = c.Price,
                    ThumbnailUrl = c.ThumbnailUrl,
                    PreviewVideoUrl = c.PreviewVideoUrl,
                    InstructorId = c.InstructorId,
                    CategoryId = c.CategoryId,
                    Language = c.Language,
                    Duration = c.Duration,
                    Level = c.Level,
                    Status = c.Status,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    Category = c.Category != null ? new CategoryDTO
                    {
                        CategoryId = c.Category.CategoryId,
                        CategoryName = c.Category.CategoryName,
                        ParentId = c.Category.ParentId
                    } : null,
                    Instructor = c.Instructor != null ? new InstructorDTO
                    {
                        InstructorId = c.Instructor.InstructorId,
                        Expertise = c.Instructor.Expertise,
                        Biography = c.Instructor.Biography,
                        ExperienceYears = c.Instructor.ExperienceYears,
                        Education = c.Instructor.Education,
                        RatingAverage = c.Instructor.RatingAverage,
                        TotalStudents = c.Instructor.TotalStudents,
                        TotalCourses = c.Instructor.TotalCourses,
                        VerificationStatus = c.Instructor.VerificationStatus
                    } : null
                })
                .ToListAsync();

            return Ok(courses);
        }

        // GET: api/Courses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CourseDTO>> GetCourse(int id)
        {
            var course = await _context.Courses
                .Include(c => c.Instructor)
                .Include(c => c.Category)
                .Where(c => c.CourseId == id)
                .Select(c => new CourseDTO
                {
                    CourseId = c.CourseId,
                    Title = c.Title,
                    Description = c.Description,
                    Price = c.Price,
                    ThumbnailUrl = c.ThumbnailUrl,
                    PreviewVideoUrl = c.PreviewVideoUrl,
                    InstructorId = c.InstructorId,
                    CategoryId = c.CategoryId,
                    Language = c.Language,
                    Duration = c.Duration,
                    Level = c.Level,
                    Status = c.Status,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    Category = c.Category != null ? new CategoryDTO
                    {
                        CategoryId = c.Category.CategoryId,
                        CategoryName = c.Category.CategoryName,
                        ParentId = c.Category.ParentId
                    } : null,
                    Instructor = c.Instructor != null ? new InstructorDTO
                    {
                        InstructorId = c.Instructor.InstructorId,
                        Expertise = c.Instructor.Expertise,
                        Biography = c.Instructor.Biography,
                        ExperienceYears = c.Instructor.ExperienceYears,
                        Education = c.Instructor.Education,
                        RatingAverage = c.Instructor.RatingAverage,
                        TotalStudents = c.Instructor.TotalStudents,
                        TotalCourses = c.Instructor.TotalCourses,
                        VerificationStatus = c.Instructor.VerificationStatus
                    } : null
                })
                .FirstOrDefaultAsync();

            if (course == null)
            {
                return NotFound();
            }

            return course;
        }

        // POST: api/Courses
        [HttpPost]
        public async Task<ActionResult<CourseDTO>> PostCourse(CourseCreateDTO courseCreateDTO)
        {
            var course = new Course
            {
                Title = courseCreateDTO.Title,
                Description = courseCreateDTO.Description,
                Price = courseCreateDTO.Price,
                ThumbnailUrl = courseCreateDTO.ThumbnailUrl,
                PreviewVideoUrl = courseCreateDTO.PreviewVideoUrl,
                InstructorId = courseCreateDTO.InstructorId,
                CategoryId = courseCreateDTO.CategoryId,
                Language = courseCreateDTO.Language,
                Duration = courseCreateDTO.Duration,
                Level = courseCreateDTO.Level,
                Status = courseCreateDTO.Status,
                CreatedAt = DateTime.UtcNow
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            // Return the created course as DTO
            var courseDTO = new CourseDTO
            {
                CourseId = course.CourseId,
                Title = course.Title,
                Description = course.Description,
                Price = course.Price,
                ThumbnailUrl = course.ThumbnailUrl,
                PreviewVideoUrl = course.PreviewVideoUrl,
                InstructorId = course.InstructorId,
                CategoryId = course.CategoryId,
                Language = course.Language,
                Duration = course.Duration,
                Level = course.Level,
                Status = course.Status,
                CreatedAt = course.CreatedAt
            };

            return CreatedAtAction("GetCourse", new { id = course.CourseId }, courseDTO);
        }

        // PUT: api/Courses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCourse(int id, CourseUpdateDTO courseUpdateDTO)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            course.Title = courseUpdateDTO.Title;
            course.Description = courseUpdateDTO.Description;
            course.Price = courseUpdateDTO.Price;
            course.ThumbnailUrl = courseUpdateDTO.ThumbnailUrl;
            course.PreviewVideoUrl = courseUpdateDTO.PreviewVideoUrl;
            course.InstructorId = courseUpdateDTO.InstructorId;
            course.CategoryId = courseUpdateDTO.CategoryId;
            course.Language = courseUpdateDTO.Language;
            course.Duration = courseUpdateDTO.Duration;
            course.Level = courseUpdateDTO.Level;
            course.Status = courseUpdateDTO.Status;
            course.UpdatedAt = DateTime.UtcNow;

            _context.Entry(course).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CourseExists(id))
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

        // DELETE: api/Courses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CourseExists(int id)
        {
            return _context.Courses.Any(e => e.CourseId == id);
        }
    }
}
using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LessonsController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public LessonsController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Lessons
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LessonDTO>>> GetLessons()
        {
            var lessons = await _context.Lessons
                .Include(l => l.Course)
                .Include(l => l.File)
                .Select(l => new LessonDTO
                {
                    LessonId = l.LessonId,
                    CourseId = l.CourseId,
                    Title = l.Title,
                    ContentType = l.ContentType,
                    VideoUrl = l.VideoUrl,
                    FileId = l.FileId,
                    DurationSec = l.DurationSec,
                    SortOrder = l.SortOrder,
                    CreatedAt = l.CreatedAt,
                    Course = l.Course != null ? new CourseSimpleDTO
                    {
                        CourseId = l.Course.CourseId,
                        Title = l.Course.Title,
                        Description = l.Course.Description,
                        Price = l.Course.Price,
                        ThumbnailUrl = l.Course.ThumbnailUrl
                    } : null,
                    File = l.File != null ? new FileSimpleDTO
                    {
                        FileId = l.File.FileId,
                        Name = l.File.Name,
                        FilePath = l.File.FilePath,
                        FileType = l.File.FileType,
                        FileSizeBigint = l.File.FileSizeBigint
                    } : null
                })
                .ToListAsync();

            return Ok(lessons);
        }

        // GET: api/Lessons/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LessonDTO>> GetLesson(int id)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Course)
                .Include(l => l.File)
                .Where(l => l.LessonId == id)
                .Select(l => new LessonDTO
                {
                    LessonId = l.LessonId,
                    CourseId = l.CourseId,
                    Title = l.Title,
                    ContentType = l.ContentType,
                    VideoUrl = l.VideoUrl,
                    FileId = l.FileId,
                    DurationSec = l.DurationSec,
                    SortOrder = l.SortOrder,
                    CreatedAt = l.CreatedAt,
                    Course = l.Course != null ? new CourseSimpleDTO
                    {
                        CourseId = l.Course.CourseId,
                        Title = l.Course.Title,
                        Description = l.Course.Description,
                        Price = l.Course.Price,
                        ThumbnailUrl = l.Course.ThumbnailUrl
                    } : null,
                    File = l.File != null ? new FileSimpleDTO
                    {
                        FileId = l.File.FileId,
                        Name = l.File.Name,
                        FilePath = l.File.FilePath,
                        FileType = l.File.FileType,
                        FileSizeBigint = l.File.FileSizeBigint
                    } : null
                })
                .FirstOrDefaultAsync();

            if (lesson == null)
            {
                return NotFound(new { message = $"Lesson with ID {id} not found" });
            }

            return lesson;
        }

        // GET: api/Lessons/ByCourse/5
        [HttpGet("ByCourse/{courseId}")]
        public async Task<ActionResult<IEnumerable<LessonDTO>>> GetLessonsByCourse(int courseId)
        {
            var lessons = await _context.Lessons
                .Where(l => l.CourseId == courseId)
                .Include(l => l.File)
                .Select(l => new LessonDTO
                {
                    LessonId = l.LessonId,
                    CourseId = l.CourseId,
                    Title = l.Title,
                    ContentType = l.ContentType,
                    VideoUrl = l.VideoUrl,
                    FileId = l.FileId,
                    DurationSec = l.DurationSec,
                    SortOrder = l.SortOrder,
                    CreatedAt = l.CreatedAt,
                    File = l.File != null ? new FileSimpleDTO
                    {
                        FileId = l.File.FileId,
                        Name = l.File.Name,
                        FilePath = l.File.FilePath,
                        FileType = l.File.FileType,
                        FileSizeBigint = l.File.FileSizeBigint
                    } : null
                })
                .OrderBy(l => l.SortOrder)
                .ToListAsync();

            return Ok(lessons);
        }

        // GET: api/Lessons/ByCourse/5/WithProgress?userId=1
        [HttpGet("ByCourse/{courseId}/WithProgress")]
        public async Task<ActionResult> GetLessonsWithProgress(int courseId, [FromQuery] int userId)
        {
            var lessonsWithProgress = await _context.Lessons
                .Where(l => l.CourseId == courseId)
                .Select(l => new
                {
                    LessonId = l.LessonId,
                    Title = l.Title,
                    ContentType = l.ContentType,
                    VideoUrl = l.VideoUrl,
                    FileId = l.FileId,
                    DurationSec = l.DurationSec,
                    SortOrder = l.SortOrder,
                    IsCompleted = _context.Set<Progress>()
                        .Any(p => p.LessonId == l.LessonId &&
                                 p.Enrollment.UserId == userId &&
                                 p.IsCompleted)
                })
                .OrderBy(l => l.SortOrder)
                .ToListAsync();

            return Ok(lessonsWithProgress);
        }

        // POST: api/Lessons
        [HttpPost]
        public async Task<ActionResult<LessonDTO>> PostLesson(LessonCreateDTO lessonCreateDTO)
        {
            var lesson = new Lesson
            {
                CourseId = lessonCreateDTO.CourseId,
                Title = lessonCreateDTO.Title,
                ContentType = lessonCreateDTO.ContentType,
                VideoUrl = lessonCreateDTO.VideoUrl,
                FileId = lessonCreateDTO.FileId,
                DurationSec = lessonCreateDTO.DurationSec,
                SortOrder = lessonCreateDTO.SortOrder,
                CreatedAt = DateTime.UtcNow
            };

            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();

            // Return the created lesson as DTO
            var lessonDTO = new LessonDTO
            {
                LessonId = lesson.LessonId,
                CourseId = lesson.CourseId,
                Title = lesson.Title,
                ContentType = lesson.ContentType,
                VideoUrl = lesson.VideoUrl,
                FileId = lesson.FileId,
                DurationSec = lesson.DurationSec,
                SortOrder = lesson.SortOrder,
                CreatedAt = lesson.CreatedAt
            };

            return CreatedAtAction("GetLesson", new { id = lesson.LessonId }, lessonDTO);
        }

        // POST: api/Lessons/Bulk
        [HttpPost("Bulk")]
        public async Task<ActionResult> PostLessonsBulk(List<LessonCreateDTO> lessonCreateDTOs)
        {
            var lessons = lessonCreateDTOs.Select(dto => new Lesson
            {
                CourseId = dto.CourseId,
                Title = dto.Title,
                ContentType = dto.ContentType,
                VideoUrl = dto.VideoUrl,
                FileId = dto.FileId,
                DurationSec = dto.DurationSec,
                SortOrder = dto.SortOrder,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _context.Lessons.AddRange(lessons);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{lessons.Count} lessons created successfully" });
        }

        // PUT: api/Lessons/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLesson(int id, LessonUpdateDTO lessonUpdateDTO)
        {
            var lesson = await _context.Lessons.FindAsync(id);
            if (lesson == null)
            {
                return NotFound();
            }

            lesson.CourseId = lessonUpdateDTO.CourseId;
            lesson.Title = lessonUpdateDTO.Title;
            lesson.ContentType = lessonUpdateDTO.ContentType;
            lesson.VideoUrl = lessonUpdateDTO.VideoUrl;
            lesson.FileId = lessonUpdateDTO.FileId;
            lesson.DurationSec = lessonUpdateDTO.DurationSec;
            lesson.SortOrder = lessonUpdateDTO.SortOrder;

            _context.Entry(lesson).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LessonExists(id))
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

        // PATCH: api/Lessons/5/Reorder
        [HttpPatch("{id}/Reorder")]
        public async Task<IActionResult> ReorderLesson(int id, [FromBody] int newSortOrder)
        {
            var lesson = await _context.Lessons.FindAsync(id);
            if (lesson == null)
            {
                return NotFound();
            }

            lesson.SortOrder = newSortOrder;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Lessons/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLesson(int id)
        {
            var lesson = await _context.Lessons.FindAsync(id);
            if (lesson == null)
            {
                return NotFound();
            }

            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Lessons/ByCourse/5
        [HttpDelete("ByCourse/{courseId}")]
        public async Task<IActionResult> DeleteLessonsByCourse(int courseId)
        {
            var lessons = await _context.Lessons
                .Where(l => l.CourseId == courseId)
                .ToListAsync();

            if (!lessons.Any())
            {
                return NotFound(new { message = $"No lessons found for course ID {courseId}" });
            }

            _context.Lessons.RemoveRange(lessons);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{lessons.Count} lessons deleted successfully" });
        }

        private bool LessonExists(int id)
        {
            return _context.Lessons.Any(e => e.LessonId == id);
        }
    }
}
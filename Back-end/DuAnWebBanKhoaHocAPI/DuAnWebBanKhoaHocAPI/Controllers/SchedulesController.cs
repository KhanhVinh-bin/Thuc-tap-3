using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SchedulesController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public SchedulesController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Schedules
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScheduleDTO>>> GetSchedules()
        {
            var schedules = await _context.Schedules
                .Include(s => s.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(s => s.Instructor)
                    .ThenInclude(i => i.InstructorNavigation)
                .Select(s => new ScheduleDTO
                {
                    ScheduleId = s.ScheduleId,
                    CourseId = s.CourseId,
                    InstructorId = s.InstructorId,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Type = s.Type,
                    MeetingLink = s.MeetingLink,
                    Course = s.Course != null ? new CourseSimpleDTO
                    {
                        CourseId = s.Course.CourseId,
                        Title = s.Course.Title,
                        ThumbnailUrl = s.Course.ThumbnailUrl,
                        Price = s.Course.Price,
                        InstructorId = s.Course.InstructorId,
                        InstructorName = s.Course.Instructor != null ?
                            s.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    } : null,
                    Instructor = s.Instructor != null ? new UserSimpleDTO
                    {
                        UserId = s.Instructor.InstructorNavigation.UserId,
                        FullName = s.Instructor.InstructorNavigation.FullName,
                        Email = s.Instructor.InstructorNavigation.Email,
                        AvatarUrl = s.Instructor.InstructorNavigation.AvatarUrl
                    } : null
                })
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            return Ok(schedules);
        }

        // GET: api/Schedules/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ScheduleDTO>> GetSchedule(int id)
        {
            var schedule = await _context.Schedules
                .Include(s => s.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(s => s.Instructor)
                    .ThenInclude(i => i.InstructorNavigation)
                .Where(s => s.ScheduleId == id)
                .Select(s => new ScheduleDTO
                {
                    ScheduleId = s.ScheduleId,
                    CourseId = s.CourseId,
                    InstructorId = s.InstructorId,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Type = s.Type,
                    MeetingLink = s.MeetingLink,
                    Course = s.Course != null ? new CourseSimpleDTO
                    {
                        CourseId = s.Course.CourseId,
                        Title = s.Course.Title,
                        ThumbnailUrl = s.Course.ThumbnailUrl,
                        Price = s.Course.Price,
                        InstructorId = s.Course.InstructorId,
                        InstructorName = s.Course.Instructor != null ?
                            s.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    } : null,
                    Instructor = s.Instructor != null ? new UserSimpleDTO
                    {
                        UserId = s.Instructor.InstructorNavigation.UserId,
                        FullName = s.Instructor.InstructorNavigation.FullName,
                        Email = s.Instructor.InstructorNavigation.Email,
                        AvatarUrl = s.Instructor.InstructorNavigation.AvatarUrl
                    } : null
                })
                .FirstOrDefaultAsync();

            if (schedule == null)
            {
                return NotFound(new { message = $"Schedule with ID {id} not found" });
            }

            return schedule;
        }

        // GET: api/Schedules/ByCourse/5
        [HttpGet("ByCourse/{courseId}")]
        public async Task<ActionResult<IEnumerable<ScheduleDTO>>> GetSchedulesByCourse(int courseId)
        {
            var courseExists = await _context.Courses.AnyAsync(c => c.CourseId == courseId);
            if (!courseExists)
            {
                return NotFound(new { message = $"Course with ID {courseId} not found" });
            }

            var schedules = await _context.Schedules
                .Include(s => s.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(s => s.Instructor)
                    .ThenInclude(i => i.InstructorNavigation)
                .Where(s => s.CourseId == courseId)
                .Select(s => new ScheduleDTO
                {
                    ScheduleId = s.ScheduleId,
                    CourseId = s.CourseId,
                    InstructorId = s.InstructorId,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Type = s.Type,
                    MeetingLink = s.MeetingLink,
                    Course = s.Course != null ? new CourseSimpleDTO
                    {
                        CourseId = s.Course.CourseId,
                        Title = s.Course.Title,
                        ThumbnailUrl = s.Course.ThumbnailUrl,
                        Price = s.Course.Price,
                        InstructorId = s.Course.InstructorId,
                        InstructorName = s.Course.Instructor != null ?
                            s.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    } : null,
                    Instructor = s.Instructor != null ? new UserSimpleDTO
                    {
                        UserId = s.Instructor.InstructorNavigation.UserId,
                        FullName = s.Instructor.InstructorNavigation.FullName,
                        Email = s.Instructor.InstructorNavigation.Email,
                        AvatarUrl = s.Instructor.InstructorNavigation.AvatarUrl
                    } : null
                })
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            return Ok(schedules);
        }

        // GET: api/Schedules/ByInstructor/5
        [HttpGet("ByInstructor/{instructorId}")]
        public async Task<ActionResult<IEnumerable<ScheduleDTO>>> GetSchedulesByInstructor(int instructorId)
        {
            var instructorExists = await _context.Instructors.AnyAsync(i => i.InstructorId == instructorId);
            if (!instructorExists)
            {
                return NotFound(new { message = $"Instructor with ID {instructorId} not found" });
            }

            var schedules = await _context.Schedules
                .Include(s => s.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(s => s.Instructor)
                    .ThenInclude(i => i.InstructorNavigation)
                .Where(s => s.InstructorId == instructorId)
                .Select(s => new ScheduleDTO
                {
                    ScheduleId = s.ScheduleId,
                    CourseId = s.CourseId,
                    InstructorId = s.InstructorId,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Type = s.Type,
                    MeetingLink = s.MeetingLink,
                    Course = s.Course != null ? new CourseSimpleDTO
                    {
                        CourseId = s.Course.CourseId,
                        Title = s.Course.Title,
                        ThumbnailUrl = s.Course.ThumbnailUrl,
                        Price = s.Course.Price,
                        InstructorId = s.Course.InstructorId,
                        InstructorName = s.Course.Instructor != null ?
                            s.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    } : null,
                    Instructor = s.Instructor != null ? new UserSimpleDTO
                    {
                        UserId = s.Instructor.InstructorNavigation.UserId,
                        FullName = s.Instructor.InstructorNavigation.FullName,
                        Email = s.Instructor.InstructorNavigation.Email,
                        AvatarUrl = s.Instructor.InstructorNavigation.AvatarUrl
                    } : null
                })
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            return Ok(schedules);
        }

        // GET: api/Schedules/Upcoming
        [HttpGet("Upcoming")]
        public async Task<ActionResult<IEnumerable<ScheduleDTO>>> GetUpcomingSchedules(int days = 7)
        {
            var startDate = DateTime.UtcNow;
            var endDate = startDate.AddDays(days);

            var schedules = await _context.Schedules
                .Include(s => s.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(s => s.Instructor)
                    .ThenInclude(i => i.InstructorNavigation)
                .Where(s => s.StartTime >= startDate && s.StartTime <= endDate)
                .Select(s => new ScheduleDTO
                {
                    ScheduleId = s.ScheduleId,
                    CourseId = s.CourseId,
                    InstructorId = s.InstructorId,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Type = s.Type,
                    MeetingLink = s.MeetingLink,
                    Course = s.Course != null ? new CourseSimpleDTO
                    {
                        CourseId = s.Course.CourseId,
                        Title = s.Course.Title,
                        ThumbnailUrl = s.Course.ThumbnailUrl,
                        Price = s.Course.Price,
                        InstructorId = s.Course.InstructorId,
                        InstructorName = s.Course.Instructor != null ?
                            s.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    } : null,
                    Instructor = s.Instructor != null ? new UserSimpleDTO
                    {
                        UserId = s.Instructor.InstructorNavigation.UserId,
                        FullName = s.Instructor.InstructorNavigation.FullName,
                        Email = s.Instructor.InstructorNavigation.Email,
                        AvatarUrl = s.Instructor.InstructorNavigation.AvatarUrl
                    } : null
                })
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            return Ok(schedules);
        }

        // GET: api/Schedules/Current
        [HttpGet("Current")]
        public async Task<ActionResult<IEnumerable<ScheduleDTO>>> GetCurrentSchedules()
        {
            var currentTime = DateTime.UtcNow;

            var schedules = await _context.Schedules
                .Include(s => s.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(s => s.Instructor)
                    .ThenInclude(i => i.InstructorNavigation)
                .Where(s => s.StartTime <= currentTime &&
                           (!s.EndTime.HasValue || s.EndTime >= currentTime))
                .Select(s => new ScheduleDTO
                {
                    ScheduleId = s.ScheduleId,
                    CourseId = s.CourseId,
                    InstructorId = s.InstructorId,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Type = s.Type,
                    MeetingLink = s.MeetingLink,
                    Course = s.Course != null ? new CourseSimpleDTO
                    {
                        CourseId = s.Course.CourseId,
                        Title = s.Course.Title,
                        ThumbnailUrl = s.Course.ThumbnailUrl,
                        Price = s.Course.Price,
                        InstructorId = s.Course.InstructorId,
                        InstructorName = s.Course.Instructor != null ?
                            s.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    } : null,
                    Instructor = s.Instructor != null ? new UserSimpleDTO
                    {
                        UserId = s.Instructor.InstructorNavigation.UserId,
                        FullName = s.Instructor.InstructorNavigation.FullName,
                        Email = s.Instructor.InstructorNavigation.Email,
                        AvatarUrl = s.Instructor.InstructorNavigation.AvatarUrl
                    } : null
                })
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            return Ok(schedules);
        }

        // GET: api/Schedules/Stats
        [HttpGet("Stats")]
        public async Task<ActionResult<ScheduleStatsDTO>> GetScheduleStats()
        {
            var totalSchedules = await _context.Schedules.CountAsync();
            var upcomingSchedules = await _context.Schedules.CountAsync(s => s.StartTime > DateTime.UtcNow);
            var pastSchedules = await _context.Schedules.CountAsync(s => s.StartTime <= DateTime.UtcNow);
            var onlineSchedules = await _context.Schedules.CountAsync(s => s.Type == "online");
            var offlineSchedules = await _context.Schedules.CountAsync(s => s.Type == "offline");

            var stats = new ScheduleStatsDTO
            {
                TotalSchedules = totalSchedules,
                UpcomingSchedules = upcomingSchedules,
                PastSchedules = pastSchedules,
                OnlineSchedules = onlineSchedules,
                OfflineSchedules = offlineSchedules
            };

            return Ok(stats);
        }

        // POST: api/Schedules
        [HttpPost]
        public async Task<ActionResult<ScheduleDTO>> PostSchedule(ScheduleCreateDTO scheduleCreateDTO)
        {
            // Validate Course exists (if provided)
            if (scheduleCreateDTO.CourseId.HasValue)
            {
                var course = await _context.Courses.FindAsync(scheduleCreateDTO.CourseId.Value);
                if (course == null)
                {
                    return BadRequest(new { message = "Course not found" });
                }
            }

            // Validate Instructor exists (if provided)
            if (scheduleCreateDTO.InstructorId.HasValue)
            {
                var instructor = await _context.Instructors.FindAsync(scheduleCreateDTO.InstructorId.Value);
                if (instructor == null)
                {
                    return BadRequest(new { message = "Instructor not found" });
                }
            }

            // Validate StartTime is in the future
            if (scheduleCreateDTO.StartTime <= DateTime.UtcNow)
            {
                return BadRequest(new { message = "Start time must be in the future" });
            }

            // Validate EndTime is after StartTime (if provided)
            if (scheduleCreateDTO.EndTime.HasValue &&
                scheduleCreateDTO.EndTime <= scheduleCreateDTO.StartTime)
            {
                return BadRequest(new { message = "End time must be after start time" });
            }

            var schedule = new Schedule
            {
                CourseId = scheduleCreateDTO.CourseId,
                InstructorId = scheduleCreateDTO.InstructorId,
                StartTime = scheduleCreateDTO.StartTime,
                EndTime = scheduleCreateDTO.EndTime,
                Type = scheduleCreateDTO.Type,
                MeetingLink = scheduleCreateDTO.MeetingLink
            };

            _context.Schedules.Add(schedule);
            await _context.SaveChangesAsync();

            // Return the created schedule with details
            var createdSchedule = await _context.Schedules
                .Include(s => s.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(s => s.Instructor)
                    .ThenInclude(i => i.InstructorNavigation)
                .Where(s => s.ScheduleId == schedule.ScheduleId)
                .Select(s => new ScheduleDTO
                {
                    ScheduleId = s.ScheduleId,
                    CourseId = s.CourseId,
                    InstructorId = s.InstructorId,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Type = s.Type,
                    MeetingLink = s.MeetingLink,
                    Course = s.Course != null ? new CourseSimpleDTO
                    {
                        CourseId = s.Course.CourseId,
                        Title = s.Course.Title,
                        ThumbnailUrl = s.Course.ThumbnailUrl,
                        Price = s.Course.Price,
                        InstructorId = s.Course.InstructorId,
                        InstructorName = s.Course.Instructor != null ?
                            s.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    } : null,
                    Instructor = s.Instructor != null ? new UserSimpleDTO
                    {
                        UserId = s.Instructor.InstructorNavigation.UserId,
                        FullName = s.Instructor.InstructorNavigation.FullName,
                        Email = s.Instructor.InstructorNavigation.Email,
                        AvatarUrl = s.Instructor.InstructorNavigation.AvatarUrl
                    } : null
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction("GetSchedule", new { id = schedule.ScheduleId }, createdSchedule);
        }

        // PUT: api/Schedules/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSchedule(int id, ScheduleUpdateDTO scheduleUpdateDTO)
        {
            var schedule = await _context.Schedules.FindAsync(id);
            if (schedule == null)
            {
                return NotFound();
            }

            // Validate Course exists (if provided)
            if (scheduleUpdateDTO.CourseId.HasValue)
            {
                var course = await _context.Courses.FindAsync(scheduleUpdateDTO.CourseId.Value);
                if (course == null)
                {
                    return BadRequest(new { message = "Course not found" });
                }
            }

            // Validate Instructor exists (if provided)
            if (scheduleUpdateDTO.InstructorId.HasValue)
            {
                var instructor = await _context.Instructors.FindAsync(scheduleUpdateDTO.InstructorId.Value);
                if (instructor == null)
                {
                    return BadRequest(new { message = "Instructor not found" });
                }
            }

            // Validate StartTime is in the future
            if (scheduleUpdateDTO.StartTime <= DateTime.UtcNow)
            {
                return BadRequest(new { message = "Start time must be in the future" });
            }

            // Validate EndTime is after StartTime (if provided)
            if (scheduleUpdateDTO.EndTime.HasValue &&
                scheduleUpdateDTO.EndTime <= scheduleUpdateDTO.StartTime)
            {
                return BadRequest(new { message = "End time must be after start time" });
            }

            schedule.CourseId = scheduleUpdateDTO.CourseId;
            schedule.InstructorId = scheduleUpdateDTO.InstructorId;
            schedule.StartTime = scheduleUpdateDTO.StartTime;
            schedule.EndTime = scheduleUpdateDTO.EndTime;
            schedule.Type = scheduleUpdateDTO.Type;
            schedule.MeetingLink = scheduleUpdateDTO.MeetingLink;

            _context.Entry(schedule).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ScheduleExists(id))
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

        // DELETE: api/Schedules/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var schedule = await _context.Schedules.FindAsync(id);
            if (schedule == null)
            {
                return NotFound();
            }

            _context.Schedules.Remove(schedule);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Schedules/ByDate
        [HttpGet("ByDate")]
        public async Task<ActionResult<IEnumerable<ScheduleDTO>>> GetSchedulesByDate(DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1).AddTicks(-1);

            var schedules = await _context.Schedules
                .Include(s => s.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(s => s.Instructor)
                    .ThenInclude(i => i.InstructorNavigation)
                .Where(s => s.StartTime >= startOfDay && s.StartTime <= endOfDay)
                .Select(s => new ScheduleDTO
                {
                    ScheduleId = s.ScheduleId,
                    CourseId = s.CourseId,
                    InstructorId = s.InstructorId,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Type = s.Type,
                    MeetingLink = s.MeetingLink,
                    Course = s.Course != null ? new CourseSimpleDTO
                    {
                        CourseId = s.Course.CourseId,
                        Title = s.Course.Title,
                        ThumbnailUrl = s.Course.ThumbnailUrl,
                        Price = s.Course.Price,
                        InstructorId = s.Course.InstructorId,
                        InstructorName = s.Course.Instructor != null ?
                            s.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    } : null,
                    Instructor = s.Instructor != null ? new UserSimpleDTO
                    {
                        UserId = s.Instructor.InstructorNavigation.UserId,
                        FullName = s.Instructor.InstructorNavigation.FullName,
                        Email = s.Instructor.InstructorNavigation.Email,
                        AvatarUrl = s.Instructor.InstructorNavigation.AvatarUrl
                    } : null
                })
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            return Ok(schedules);
        }

        private bool ScheduleExists(int id)
        {
            return _context.Schedules.Any(e => e.ScheduleId == id);
        }
    }
}
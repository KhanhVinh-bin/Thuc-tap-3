using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public StudentsController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Students
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentDTO>>> GetStudents()
        {
            var students = await _context.Students
                .Include(s => s.StudentNavigation) // SỬA: s.Student -> s.StudentNavigation
                .ThenInclude(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Select(s => new StudentDTO
                {
                    StudentId = s.StudentId,
                    Email = s.StudentNavigation.Email, // SỬA: s.Student -> s.StudentNavigation
                    FullName = s.StudentNavigation.FullName,
                    PhoneNumber = s.StudentNavigation.PhoneNumber,
                    Address = s.StudentNavigation.Address,
                    AvatarUrl = s.StudentNavigation.AvatarUrl,
                    DateOfBirth = s.StudentNavigation.DateOfBirth,
                    Gender = s.StudentNavigation.Gender,
                    Bio = s.StudentNavigation.Bio,
                    Status = s.StudentNavigation.Status,
                    CreatedAt = s.StudentNavigation.CreatedAt,
                    EnrollmentCount = s.EnrollmentCount,
                    CompletedCourses = s.CompletedCourses,
                    TotalCertificates = s.TotalCertificates,
                    LastActive = s.LastActive,
                    Roles = s.StudentNavigation.UserRoles.Select(ur => ur.Role.RoleName).ToList()
                })
                .ToListAsync();

            return Ok(students);
        }

        // GET: api/Students/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StudentDTO>> GetStudent(int id)
        {
            var student = await _context.Students
                .Include(s => s.StudentNavigation) // SỬA: s.Student -> s.StudentNavigation
                .ThenInclude(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Where(s => s.StudentId == id)
                .Select(s => new StudentDTO
                {
                    StudentId = s.StudentId,
                    Email = s.StudentNavigation.Email, // SỬA: s.Student -> s.StudentNavigation
                    FullName = s.StudentNavigation.FullName,
                    PhoneNumber = s.StudentNavigation.PhoneNumber,
                    Address = s.StudentNavigation.Address,
                    AvatarUrl = s.StudentNavigation.AvatarUrl,
                    DateOfBirth = s.StudentNavigation.DateOfBirth,
                    Gender = s.StudentNavigation.Gender,
                    Bio = s.StudentNavigation.Bio,
                    Status = s.StudentNavigation.Status,
                    CreatedAt = s.StudentNavigation.CreatedAt,
                    EnrollmentCount = s.EnrollmentCount,
                    CompletedCourses = s.CompletedCourses,
                    TotalCertificates = s.TotalCertificates,
                    LastActive = s.LastActive,
                    Roles = s.StudentNavigation.UserRoles.Select(ur => ur.Role.RoleName).ToList()
                })
                .FirstOrDefaultAsync();

            if (student == null)
            {
                return NotFound(new { message = $"Student with ID {id} not found" });
            }

            return student;
        }

        // GET: api/Students/stats
        [HttpGet("stats")]
        public async Task<ActionResult<IEnumerable<StudentStatsDTO>>> GetStudentStats()
        {
            var stats = await _context.Students
                .Include(s => s.StudentNavigation) // SỬA: s.Student -> s.StudentNavigation
                .Select(s => new StudentStatsDTO
                {
                    StudentId = s.StudentId,
                    FullName = s.StudentNavigation.FullName, // SỬA: s.Student -> s.StudentNavigation
                    EnrollmentCount = s.EnrollmentCount,
                    CompletedCourses = s.CompletedCourses,
                    TotalCertificates = s.TotalCertificates,
                    LastActive = s.LastActive
                })
                .OrderByDescending(s => s.CompletedCourses)
                .ToListAsync();

            return Ok(stats);
        }

        // GET: api/Students/5/enrollments
        [HttpGet("{id}/enrollments")]
        public async Task<ActionResult> GetStudentEnrollments(int id)
        {
            var enrollments = await _context.Enrollments
                .Where(e => e.UserId == id)
                .Include(e => e.Course)
                .Select(e => new
                {
                    e.EnrollmentId,
                    e.CourseId,
                    CourseTitle = e.Course.Title,
                    e.EnrollDate,
                    e.Status,
                    // SỬA: _context.Progress -> _context.Set<Progress>()
                    Progress = _context.Set<Progress>()
                        .Where(p => p.EnrollmentId == e.EnrollmentId && p.IsCompleted)
                        .Count(),
                    TotalLessons = _context.Lessons
                        .Where(l => l.CourseId == e.CourseId)
                        .Count()
                })
                .ToListAsync();

            return Ok(enrollments);
        }

        // POST: api/Students
        [HttpPost]
        public async Task<ActionResult<StudentDTO>> PostStudent(StudentCreateDTO studentCreateDTO)
        {
            // Validate input
            if (string.IsNullOrEmpty(studentCreateDTO.Email))
            {
                return BadRequest(new { message = "Email is required" });
            }

            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == studentCreateDTO.Email))
            {
                return Conflict(new { message = "Email already exists" });
            }

            // Create User first
            var user = new User
            {
                Email = studentCreateDTO.Email,
                PasswordHash = studentCreateDTO.PasswordHash,
                FullName = studentCreateDTO.FullName,
                PhoneNumber = studentCreateDTO.PhoneNumber,
                Address = studentCreateDTO.Address,
                DateOfBirth = studentCreateDTO.DateOfBirth,
                Gender = studentCreateDTO.Gender,
                Bio = studentCreateDTO.Bio,
                CreatedAt = DateTime.UtcNow,
                Status = "active"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create Student record
            var student = new Student
            {
                StudentId = user.UserId,
                EnrollmentCount = 0,
                CompletedCourses = 0,
                TotalCertificates = 0,
                LastActive = DateTime.UtcNow,
                StudentNavigation = user // THÊM DÒNG NÀY để set navigation property
            };

            _context.Students.Add(student);

            // Add student role (RoleId = 1 for student)
            var userRole = new UserRole
            {
                UserId = user.UserId,
                RoleId = 1,
                AssignedAt = DateTime.UtcNow
            };
            _context.UserRoles.Add(userRole);

            await _context.SaveChangesAsync();

            // Return the created student
            var studentDTO = new StudentDTO
            {
                StudentId = student.StudentId,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                DateOfBirth = user.DateOfBirth,
                Gender = user.Gender,
                Bio = user.Bio,
                Status = user.Status,
                CreatedAt = user.CreatedAt,
                EnrollmentCount = student.EnrollmentCount,
                CompletedCourses = student.CompletedCourses,
                TotalCertificates = student.TotalCertificates,
                LastActive = student.LastActive,
                Roles = new List<string> { "student" }
            };

            return CreatedAtAction("GetStudent", new { id = student.StudentId }, studentDTO);
        }

        // PUT: api/Students/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStudent(int id, StudentUpdateDTO studentUpdateDTO)
        {
            // Find student and related user
            var student = await _context.Students
                .Include(s => s.StudentNavigation) // SỬA: s.Student -> s.StudentNavigation
                .FirstOrDefaultAsync(s => s.StudentId == id);

            if (student == null)
            {
                return NotFound();
            }

            // Update User properties through StudentNavigation
            student.StudentNavigation.FullName = studentUpdateDTO.FullName; // SỬA: student.Student -> student.StudentNavigation
            student.StudentNavigation.PhoneNumber = studentUpdateDTO.PhoneNumber;
            student.StudentNavigation.Address = studentUpdateDTO.Address;
            student.StudentNavigation.AvatarUrl = studentUpdateDTO.AvatarUrl;
            student.StudentNavigation.DateOfBirth = studentUpdateDTO.DateOfBirth;
            student.StudentNavigation.Gender = studentUpdateDTO.Gender;
            student.StudentNavigation.Bio = studentUpdateDTO.Bio;
            student.StudentNavigation.Status = studentUpdateDTO.Status;
            student.StudentNavigation.UpdatedAt = DateTime.UtcNow;

            // Update Student specific properties
            student.EnrollmentCount = studentUpdateDTO.EnrollmentCount;
            student.CompletedCourses = studentUpdateDTO.CompletedCourses;
            student.TotalCertificates = studentUpdateDTO.TotalCertificates;
            student.LastActive = studentUpdateDTO.LastActive ?? student.LastActive;

            _context.Entry(student).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StudentExists(id))
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

        // PATCH: api/Students/5/last-active
        [HttpPatch("{id}/last-active")]
        public async Task<IActionResult> UpdateLastActive(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound();
            }

            student.LastActive = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Students/5/stats
        [HttpPatch("{id}/stats")]
        public async Task<IActionResult> UpdateStudentStats(int id, [FromBody] StudentStatsUpdateDTO statsUpdate)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound();
            }

            if (statsUpdate.EnrollmentCount.HasValue)
                student.EnrollmentCount = statsUpdate.EnrollmentCount.Value;

            if (statsUpdate.CompletedCourses.HasValue)
                student.CompletedCourses = statsUpdate.CompletedCourses.Value;

            if (statsUpdate.TotalCertificates.HasValue)
                student.TotalCertificates = statsUpdate.TotalCertificates.Value;

            student.LastActive = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Students/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound();
            }

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool StudentExists(int id)
        {
            return _context.Students.Any(e => e.StudentId == id);
        }
    }

    // Additional DTO for partial updates
    public class StudentStatsUpdateDTO
    {
        public int? EnrollmentCount { get; set; }
        public int? CompletedCourses { get; set; }
        public int? TotalCertificates { get; set; }
    }
}
using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CertificatesController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public CertificatesController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Certificates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CertificateDTO>>> GetCertificates()
        {
            var certificates = await _context.Certificates
                .Include(c => c.User)
                .Include(c => c.Course)
                .Select(c => new CertificateDTO
                {
                    CertificateId = c.CertificateId,
                    UserId = c.UserId,
                    CourseId = c.CourseId,
                    CertificateUrl = c.CertificateUrl,
                    IssuedAt = c.IssuedAt,
                    User = new UserSimpleDTO
                    {
                        UserId = c.User.UserId,
                        FullName = c.User.FullName,
                        Email = c.User.Email,
                        AvatarUrl = c.User.AvatarUrl
                    },
                    Course = new CourseSimpleDTO
                    {
                        CourseId = c.Course.CourseId,
                        Title = c.Course.Title,
                        Description = c.Course.Description,
                        Price = c.Course.Price,
                        ThumbnailUrl = c.Course.ThumbnailUrl
                    }
                })
                .OrderByDescending(c => c.IssuedAt)
                .ToListAsync();

            return Ok(certificates);
        }

        // GET: api/Certificates/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CertificateDTO>> GetCertificate(int id)
        {
            var certificate = await _context.Certificates
                .Include(c => c.User)
                .Include(c => c.Course)
                .Where(c => c.CertificateId == id)
                .Select(c => new CertificateDTO
                {
                    CertificateId = c.CertificateId,
                    UserId = c.UserId,
                    CourseId = c.CourseId,
                    CertificateUrl = c.CertificateUrl,
                    IssuedAt = c.IssuedAt,
                    User = new UserSimpleDTO
                    {
                        UserId = c.User.UserId,
                        FullName = c.User.FullName,
                        Email = c.User.Email,
                        AvatarUrl = c.User.AvatarUrl
                    },
                    Course = new CourseSimpleDTO
                    {
                        CourseId = c.Course.CourseId,
                        Title = c.Course.Title,
                        Description = c.Course.Description,
                        Price = c.Course.Price,
                        ThumbnailUrl = c.Course.ThumbnailUrl
                    }
                })
                .FirstOrDefaultAsync();

            if (certificate == null)
            {
                return NotFound(new { message = $"Certificate with ID {id} not found" });
            }

            return certificate;
        }

        // GET: api/Certificates/ByUser/5
        [HttpGet("ByUser/{userId}")]
        public async Task<ActionResult<IEnumerable<CertificateDTO>>> GetCertificatesByUser(int userId)
        {
            var certificates = await _context.Certificates
                .Where(c => c.UserId == userId)
                .Include(c => c.Course)
                .Select(c => new CertificateDTO
                {
                    CertificateId = c.CertificateId,
                    UserId = c.UserId,
                    CourseId = c.CourseId,
                    CertificateUrl = c.CertificateUrl,
                    IssuedAt = c.IssuedAt,
                    Course = new CourseSimpleDTO
                    {
                        CourseId = c.Course.CourseId,
                        Title = c.Course.Title,
                        Description = c.Course.Description,
                        Price = c.Course.Price,
                        ThumbnailUrl = c.Course.ThumbnailUrl
                    }
                })
                .OrderByDescending(c => c.IssuedAt)
                .ToListAsync();

            return Ok(certificates);
        }

        // GET: api/Certificates/ByCourse/5
        [HttpGet("ByCourse/{courseId}")]
        public async Task<ActionResult<IEnumerable<CertificateDTO>>> GetCertificatesByCourse(int courseId)
        {
            var certificates = await _context.Certificates
                .Where(c => c.CourseId == courseId)
                .Include(c => c.User)
                .Select(c => new CertificateDTO
                {
                    CertificateId = c.CertificateId,
                    UserId = c.UserId,
                    CourseId = c.CourseId,
                    CertificateUrl = c.CertificateUrl,
                    IssuedAt = c.IssuedAt,
                    User = new UserSimpleDTO
                    {
                        UserId = c.User.UserId,
                        FullName = c.User.FullName,
                        Email = c.User.Email,
                        AvatarUrl = c.User.AvatarUrl
                    }
                })
                .OrderByDescending(c => c.IssuedAt)
                .ToListAsync();

            return Ok(certificates);
        }

        // GET: api/Certificates/Stats
        [HttpGet("Stats")]
        public async Task<ActionResult<CertificateStatsDTO>> GetCertificateStats()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var startOfYear = new DateTime(now.Year, 1, 1);

            var totalCertificates = await _context.Certificates.CountAsync();
            var certificatesThisMonth = await _context.Certificates
                .CountAsync(c => c.IssuedAt >= startOfMonth);
            var certificatesThisYear = await _context.Certificates
                .CountAsync(c => c.IssuedAt >= startOfYear);

            var topCourses = await _context.Certificates
                .GroupBy(c => new { c.CourseId, c.Course.Title })
                .Select(g => new CourseCertificateCountDTO
                {
                    CourseId = g.Key.CourseId,
                    CourseTitle = g.Key.Title,
                    CertificateCount = g.Count()
                })
                .OrderByDescending(x => x.CertificateCount)
                .Take(10)
                .ToListAsync();

            var stats = new CertificateStatsDTO
            {
                TotalCertificates = totalCertificates,
                CertificatesThisMonth = certificatesThisMonth,
                CertificatesThisYear = certificatesThisYear,
                TopCourses = topCourses
            };

            return Ok(stats);
        }

        // GET: api/Certificates/Student/5/Summary
        [HttpGet("Student/{studentId}/Summary")]
        public async Task<ActionResult<StudentCertificateSummaryDTO>> GetStudentCertificateSummary(int studentId)
        {
            var student = await _context.Students
                .Include(s => s.StudentNavigation)
                .FirstOrDefaultAsync(s => s.StudentId == studentId);

            if (student == null)
            {
                return NotFound(new { message = $"Student with ID {studentId} not found" });
            }

            var certificates = await _context.Certificates
                .Where(c => c.UserId == studentId)
                .Include(c => c.Course)
                .OrderByDescending(c => c.IssuedAt)
                .ToListAsync();

            var summary = new StudentCertificateSummaryDTO
            {
                StudentId = studentId,
                FullName = student.StudentNavigation.FullName,
                Email = student.StudentNavigation.Email,
                TotalCertificates = certificates.Count,
                FirstCertificateDate = certificates.Min(c => c.IssuedAt),
                LastCertificateDate = certificates.Max(c => c.IssuedAt),
                Certificates = certificates.Select(c => new CertificateDTO
                {
                    CertificateId = c.CertificateId,
                    UserId = c.UserId,
                    CourseId = c.CourseId,
                    CertificateUrl = c.CertificateUrl,
                    IssuedAt = c.IssuedAt,
                    Course = new CourseSimpleDTO
                    {
                        CourseId = c.Course.CourseId,
                        Title = c.Course.Title,
                        Description = c.Course.Description,
                        Price = c.Course.Price,
                        ThumbnailUrl = c.Course.ThumbnailUrl
                    }
                }).ToList()
            };

            return Ok(summary);
        }

        // GET: api/Certificates/Verify
        [HttpGet("Verify")]
        public async Task<ActionResult> VerifyCertificate(int certificateId, int userId, int courseId)
        {
            var certificate = await _context.Certificates
                .Include(c => c.User)
                .Include(c => c.Course)
                .FirstOrDefaultAsync(c => c.CertificateId == certificateId &&
                                         c.UserId == userId &&
                                         c.CourseId == courseId);

            if (certificate == null)
            {
                return NotFound(new
                {
                    isValid = false,
                    message = "Certificate not found or credentials do not match"
                });
            }

            var verificationResult = new
            {
                isValid = true,
                certificateId = certificate.CertificateId,
                studentName = certificate.User.FullName,
                courseName = certificate.Course.Title,
                issuedAt = certificate.IssuedAt,
                certificateUrl = certificate.CertificateUrl,
                message = "Certificate is valid"
            };

            return Ok(verificationResult);
        }

        // POST: api/Certificates
        [HttpPost]
        public async Task<ActionResult<CertificateDTO>> PostCertificate(CertificateCreateDTO certificateCreateDTO)
        {
            // Check if user exists
            var user = await _context.Users.FindAsync(certificateCreateDTO.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            // Check if course exists
            var course = await _context.Courses.FindAsync(certificateCreateDTO.CourseId);
            if (course == null)
            {
                return BadRequest(new { message = "Course not found" });
            }

            // Check if certificate already exists for this user and course
            var existingCertificate = await _context.Certificates
                .FirstOrDefaultAsync(c => c.UserId == certificateCreateDTO.UserId &&
                                         c.CourseId == certificateCreateDTO.CourseId);

            if (existingCertificate != null)
            {
                return Conflict(new { message = "Certificate already exists for this user and course" });
            }

            var certificate = new Certificate
            {
                UserId = certificateCreateDTO.UserId,
                CourseId = certificateCreateDTO.CourseId,
                CertificateUrl = certificateCreateDTO.CertificateUrl,
                IssuedAt = DateTime.UtcNow
            };

            _context.Certificates.Add(certificate);
            await _context.SaveChangesAsync();

            // Update student's total certificates count
            await UpdateStudentCertificateCount(certificateCreateDTO.UserId);

            var certificateDTO = new CertificateDTO
            {
                CertificateId = certificate.CertificateId,
                UserId = certificate.UserId,
                CourseId = certificate.CourseId,
                CertificateUrl = certificate.CertificateUrl,
                IssuedAt = certificate.IssuedAt
            };

            return CreatedAtAction("GetCertificate", new { id = certificate.CertificateId }, certificateDTO);
        }

        // POST: api/Certificates/Generate
        [HttpPost("Generate")]
        public async Task<ActionResult<CertificateDTO>> GenerateCertificate(CertificateGenerateDTO generateDTO)
        {
            // Check if user exists and is enrolled in the course
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == generateDTO.UserId &&
                                         e.CourseId == generateDTO.CourseId &&
                                         e.Status == "completed");

            if (enrollment == null)
            {
                return BadRequest(new { message = "User has not completed this course" });
            }

            // Check if certificate already exists
            var existingCertificate = await _context.Certificates
                .FirstOrDefaultAsync(c => c.UserId == generateDTO.UserId &&
                                         c.CourseId == generateDTO.CourseId);

            if (existingCertificate != null)
            {
                return Conflict(new { message = "Certificate already exists for this user and course" });
            }

            // Generate certificate URL (in real application, you might generate a PDF and store it)
            var certificateUrl = $"/certificates/{generateDTO.UserId}_{generateDTO.CourseId}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";

            var certificate = new Certificate
            {
                UserId = generateDTO.UserId,
                CourseId = generateDTO.CourseId,
                CertificateUrl = certificateUrl,
                IssuedAt = DateTime.UtcNow
            };

            _context.Certificates.Add(certificate);
            await _context.SaveChangesAsync();

            // Update student's total certificates count
            await UpdateStudentCertificateCount(generateDTO.UserId);

            // Get the created certificate with details
            var createdCertificate = await _context.Certificates
                .Include(c => c.User)
                .Include(c => c.Course)
                .Where(c => c.CertificateId == certificate.CertificateId)
                .Select(c => new CertificateDTO
                {
                    CertificateId = c.CertificateId,
                    UserId = c.UserId,
                    CourseId = c.CourseId,
                    CertificateUrl = c.CertificateUrl,
                    IssuedAt = c.IssuedAt,
                    User = new UserSimpleDTO
                    {
                        UserId = c.User.UserId,
                        FullName = c.User.FullName,
                        Email = c.User.Email
                    },
                    Course = new CourseSimpleDTO
                    {
                        CourseId = c.Course.CourseId,
                        Title = c.Course.Title,
                        Description = c.Course.Description
                    }
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction("GetCertificate", new { id = certificate.CertificateId }, createdCertificate);
        }

        // PUT: api/Certificates/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCertificate(int id, CertificateUpdateDTO certificateUpdateDTO)
        {
            var certificate = await _context.Certificates.FindAsync(id);
            if (certificate == null)
            {
                return NotFound();
            }

            certificate.CertificateUrl = certificateUpdateDTO.CertificateUrl;

            _context.Entry(certificate).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CertificateExists(id))
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

        // PATCH: api/Certificates/5/Regenerate
        [HttpPatch("{id}/Regenerate")]
        public async Task<IActionResult> RegenerateCertificate(int id)
        {
            var certificate = await _context.Certificates
                .Include(c => c.User)
                .Include(c => c.Course)
                .FirstOrDefaultAsync(c => c.CertificateId == id);

            if (certificate == null)
            {
                return NotFound();
            }

            // Generate new certificate URL
            certificate.CertificateUrl = $"/certificates/{certificate.UserId}_{certificate.CourseId}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
            certificate.IssuedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Certificates/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCertificate(int id)
        {
            var certificate = await _context.Certificates.FindAsync(id);
            if (certificate == null)
            {
                return NotFound();
            }

            var userId = certificate.UserId;

            _context.Certificates.Remove(certificate);
            await _context.SaveChangesAsync();

            // Update student's total certificates count
            await UpdateStudentCertificateCount(userId);

            return NoContent();
        }

        // DELETE: api/Certificates/ByUserAndCourse
        [HttpDelete("ByUserAndCourse")]
        public async Task<IActionResult> DeleteCertificateByUserAndCourse(int userId, int courseId)
        {
            var certificate = await _context.Certificates
                .FirstOrDefaultAsync(c => c.UserId == userId && c.CourseId == courseId);

            if (certificate == null)
            {
                return NotFound();
            }

            _context.Certificates.Remove(certificate);
            await _context.SaveChangesAsync();

            // Update student's total certificates count
            await UpdateStudentCertificateCount(userId);

            return NoContent();
        }

        private bool CertificateExists(int id)
        {
            return _context.Certificates.Any(e => e.CertificateId == id);
        }

        private async Task UpdateStudentCertificateCount(int userId)
        {
            var student = await _context.Students.FindAsync(userId);
            if (student != null)
            {
                student.TotalCertificates = await _context.Certificates
                    .CountAsync(c => c.UserId == userId);
                await _context.SaveChangesAsync();
            }
        }
    }
}
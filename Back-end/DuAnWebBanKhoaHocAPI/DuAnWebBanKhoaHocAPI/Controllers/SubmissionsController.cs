using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubmissionsController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public SubmissionsController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Submissions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubmissionDTO>>> GetSubmissions()
        {
            var submissions = await _context.Submissions
                .Include(s => s.Assignment)
                .ThenInclude(a => a.Course)
                .Include(s => s.User)
                .Include(s => s.File)
                // LOẠI BỎ: .Include(s => s.GradedByNavigation)
                .Select(s => new SubmissionDTO
                {
                    SubmissionId = s.SubmissionId,
                    AssignmentId = s.AssignmentId,
                    UserId = s.UserId,
                    Answer = s.Answer,
                    FileId = s.FileId,
                    Score = s.Score,
                    SubmittedAt = s.SubmittedAt,
                    GradedAt = s.GradedAt,
                    GradedBy = s.GradedBy,
                    Assignment = new AssignmentDTO
                    {
                        AssignmentId = s.Assignment.AssignmentId,
                        CourseId = s.Assignment.CourseId,
                        Title = s.Assignment.Title,
                        Description = s.Assignment.Description,
                        DueDate = s.Assignment.DueDate,
                        MaxScore = s.Assignment.MaxScore,
                        CreatedAt = s.Assignment.CreatedAt
                    },
                    User = new UserSimpleDTO
                    {
                        UserId = s.User.UserId,
                        FullName = s.User.FullName,
                        Email = s.User.Email,
                        AvatarUrl = s.User.AvatarUrl
                    },
                    // LOẠI BỎ: Grader property
                    File = s.File != null ? new FileSimpleDTO
                    {
                        FileId = s.File.FileId,
                        Name = s.File.Name,
                        FilePath = s.File.FilePath,
                        FileType = s.File.FileType,
                        FileSizeBigint = s.File.FileSizeBigint
                    } : null
                })
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync();

            return Ok(submissions);
        }

        // GET: api/Submissions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SubmissionDTO>> GetSubmission(int id)
        {
            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .ThenInclude(a => a.Course)
                .Include(s => s.User)
                .Include(s => s.File)
                // LOẠI BỎ: .Include(s => s.GradedByNavigation)
                .Where(s => s.SubmissionId == id)
                .Select(s => new SubmissionDTO
                {
                    SubmissionId = s.SubmissionId,
                    AssignmentId = s.AssignmentId,
                    UserId = s.UserId,
                    Answer = s.Answer,
                    FileId = s.FileId,
                    Score = s.Score,
                    SubmittedAt = s.SubmittedAt,
                    GradedAt = s.GradedAt,
                    GradedBy = s.GradedBy,
                    Assignment = new AssignmentDTO
                    {
                        AssignmentId = s.Assignment.AssignmentId,
                        CourseId = s.Assignment.CourseId,
                        Title = s.Assignment.Title,
                        Description = s.Assignment.Description,
                        DueDate = s.Assignment.DueDate,
                        MaxScore = s.Assignment.MaxScore,
                        CreatedAt = s.Assignment.CreatedAt
                    },
                    User = new UserSimpleDTO
                    {
                        UserId = s.User.UserId,
                        FullName = s.User.FullName,
                        Email = s.User.Email,
                        AvatarUrl = s.User.AvatarUrl
                    },
                    // LOẠI BỎ: Grader property
                    File = s.File != null ? new FileSimpleDTO
                    {
                        FileId = s.File.FileId,
                        Name = s.File.Name,
                        FilePath = s.File.FilePath,
                        FileType = s.File.FileType,
                        FileSizeBigint = s.File.FileSizeBigint
                    } : null
                })
                .FirstOrDefaultAsync();

            if (submission == null)
            {
                return NotFound(new { message = $"Submission with ID {id} not found" });
            }

            return submission;
        }

        // GET: api/Submissions/ByAssignment/5
        [HttpGet("ByAssignment/{assignmentId}")]
        public async Task<ActionResult<IEnumerable<SubmissionDTO>>> GetSubmissionsByAssignment(int assignmentId)
        {
            var submissions = await _context.Submissions
                .Where(s => s.AssignmentId == assignmentId)
                .Include(s => s.User)
                .Include(s => s.File)
                // LOẠI BỎ: .Include(s => s.GradedByNavigation)
                .Select(s => new SubmissionDTO
                {
                    SubmissionId = s.SubmissionId,
                    AssignmentId = s.AssignmentId,
                    UserId = s.UserId,
                    Answer = s.Answer,
                    FileId = s.FileId,
                    Score = s.Score,
                    SubmittedAt = s.SubmittedAt,
                    GradedAt = s.GradedAt,
                    GradedBy = s.GradedBy,
                    User = new UserSimpleDTO
                    {
                        UserId = s.User.UserId,
                        FullName = s.User.FullName,
                        Email = s.User.Email,
                        AvatarUrl = s.User.AvatarUrl
                    },
                    // LOẠI BỎ: Grader property
                    File = s.File != null ? new FileSimpleDTO
                    {
                        FileId = s.File.FileId,
                        Name = s.File.Name,
                        FilePath = s.File.FilePath,
                        FileType = s.File.FileType,
                        FileSizeBigint = s.File.FileSizeBigint
                    } : null
                })
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync();

            return Ok(submissions);
        }

        // GET: api/Submissions/ByUser/5
        [HttpGet("ByUser/{userId}")]
        public async Task<ActionResult<IEnumerable<StudentSubmissionDTO>>> GetSubmissionsByUser(int userId)
        {
            var submissions = await _context.Submissions
                .Where(s => s.UserId == userId)
                .Include(s => s.Assignment)
                // LOẠI BỎ: .Include(s => s.GradedByNavigation)
                .Select(s => new StudentSubmissionDTO
                {
                    SubmissionId = s.SubmissionId,
                    AssignmentId = s.AssignmentId,
                    AssignmentTitle = s.Assignment.Title,
                    Answer = s.Answer,
                    FileId = s.FileId,
                    Score = s.Score,
                    SubmittedAt = s.SubmittedAt,
                    GradedAt = s.GradedAt,
                    GradedBy = s.GradedBy,
                    // LOẠI BỎ: GraderName property
                    MaxScore = s.Assignment.MaxScore,
                    DueDate = s.Assignment.DueDate,
                    IsLate = s.Assignment.DueDate.HasValue && s.SubmittedAt > s.Assignment.DueDate.Value,
                    Status = GetSubmissionStatus(s)
                })
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync();

            return Ok(submissions);
        }

        // GET: api/Submissions/ByUserAndAssignment
        [HttpGet("ByUserAndAssignment")]
        public async Task<ActionResult<SubmissionDTO>> GetSubmissionByUserAndAssignment(int userId, int assignmentId)
        {
            var submission = await _context.Submissions
                .Where(s => s.UserId == userId && s.AssignmentId == assignmentId)
                .Include(s => s.Assignment)
                .ThenInclude(a => a.Course)
                .Include(s => s.User)
                .Include(s => s.File)
                // LOẠI BỎ: .Include(s => s.GradedByNavigation)
                .Select(s => new SubmissionDTO
                {
                    SubmissionId = s.SubmissionId,
                    AssignmentId = s.AssignmentId,
                    UserId = s.UserId,
                    Answer = s.Answer,
                    FileId = s.FileId,
                    Score = s.Score,
                    SubmittedAt = s.SubmittedAt,
                    GradedAt = s.GradedAt,
                    GradedBy = s.GradedBy,
                    Assignment = new AssignmentDTO
                    {
                        AssignmentId = s.Assignment.AssignmentId,
                        CourseId = s.Assignment.CourseId,
                        Title = s.Assignment.Title,
                        Description = s.Assignment.Description,
                        DueDate = s.Assignment.DueDate,
                        MaxScore = s.Assignment.MaxScore,
                        CreatedAt = s.Assignment.CreatedAt
                    },
                    User = new UserSimpleDTO
                    {
                        UserId = s.User.UserId,
                        FullName = s.User.FullName,
                        Email = s.User.Email,
                        AvatarUrl = s.User.AvatarUrl
                    },
                    // LOẠI BỎ: Grader property
                    File = s.File != null ? new FileSimpleDTO
                    {
                        FileId = s.File.FileId,
                        Name = s.File.Name,
                        FilePath = s.File.FilePath,
                        FileType = s.File.FileType,
                        FileSizeBigint = s.File.FileSizeBigint
                    } : null
                })
                .FirstOrDefaultAsync();

            if (submission == null)
            {
                return NotFound(new { message = "Submission not found for this user and assignment" });
            }

            return submission;
        }

        // Các method khác giữ nguyên (POST, PUT, PATCH, DELETE)...
        // Chỉ cần đảm bảo không sử dụng GradedByNavigation trong các method đó

        // GET: api/Submissions/Stats/ByAssignment/5
        [HttpGet("Stats/ByAssignment/{assignmentId}")]
        public async Task<ActionResult<SubmissionStatsDTO>> GetSubmissionStatsByAssignment(int assignmentId)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.AssignmentId == assignmentId);

            if (assignment == null)
            {
                return NotFound(new { message = $"Assignment with ID {assignmentId} not found" });
            }

            var totalStudents = await _context.Enrollments
                .CountAsync(e => e.CourseId == assignment.CourseId && e.Status == "active");

            var submissions = await _context.Submissions
                .Where(s => s.AssignmentId == assignmentId)
                .ToListAsync();

            var stats = new SubmissionStatsDTO
            {
                AssignmentId = assignmentId,
                AssignmentTitle = assignment.Title,
                CourseId = assignment.CourseId,
                CourseTitle = assignment.Course.Title,
                TotalSubmissions = submissions.Count,
                TotalStudents = totalStudents,
                GradedSubmissions = submissions.Count(s => s.Score.HasValue),
                UngradedSubmissions = submissions.Count(s => !s.Score.HasValue),
                AverageScore = submissions.Where(s => s.Score.HasValue).Average(s => (double?)s.Score),
                MaxScore = submissions.Where(s => s.Score.HasValue).Max(s => (double?)s.Score),
                MinScore = submissions.Where(s => s.Score.HasValue).Min(s => (double?)s.Score),
                CompletionRate = totalStudents > 0 ? (decimal)submissions.Count / totalStudents * 100 : 0
            };

            return Ok(stats);
        }

        // POST: api/Submissions
        [HttpPost]
        public async Task<ActionResult<SubmissionDTO>> PostSubmission(SubmissionCreateDTO submissionCreateDTO)
        {
            // Check if assignment exists
            var assignment = await _context.Assignments.FindAsync(submissionCreateDTO.AssignmentId);
            if (assignment == null)
            {
                return BadRequest(new { message = "Assignment not found" });
            }

            // Check if user exists
            var user = await _context.Users.FindAsync(submissionCreateDTO.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            // Check if user is enrolled in the course
            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.UserId == submissionCreateDTO.UserId &&
                              e.CourseId == assignment.CourseId &&
                              e.Status == "active");
            if (!isEnrolled)
            {
                return BadRequest(new { message = "User is not enrolled in this course" });
            }

            // Check if file exists (if provided)
            if (submissionCreateDTO.FileId.HasValue)
            {
                var file = await _context.Files.FindAsync(submissionCreateDTO.FileId.Value);
                if (file == null)
                {
                    return BadRequest(new { message = "File not found" });
                }
            }

            // Check if submission already exists for this user and assignment
            var existingSubmission = await _context.Submissions
                .FirstOrDefaultAsync(s => s.UserId == submissionCreateDTO.UserId &&
                                         s.AssignmentId == submissionCreateDTO.AssignmentId);

            if (existingSubmission != null)
            {
                // Update existing submission
                existingSubmission.Answer = submissionCreateDTO.Answer;
                existingSubmission.FileId = submissionCreateDTO.FileId;
                existingSubmission.SubmittedAt = DateTime.UtcNow;
                existingSubmission.Score = null; // Reset score when resubmitting
                existingSubmission.GradedAt = null;
                existingSubmission.GradedBy = null;

                _context.Entry(existingSubmission).State = EntityState.Modified;
            }
            else
            {
                // Create new submission
                var submission = new Submission
                {
                    AssignmentId = submissionCreateDTO.AssignmentId,
                    UserId = submissionCreateDTO.UserId,
                    Answer = submissionCreateDTO.Answer,
                    FileId = submissionCreateDTO.FileId,
                    SubmittedAt = DateTime.UtcNow
                };

                _context.Submissions.Add(submission);
            }

            await _context.SaveChangesAsync();

            // Return the created/updated submission
            var submissionId = existingSubmission?.SubmissionId ??
                             (await _context.Submissions
                                 .FirstOrDefaultAsync(s => s.UserId == submissionCreateDTO.UserId &&
                                                         s.AssignmentId == submissionCreateDTO.AssignmentId))
                             ?.SubmissionId;

            var submissionDTO = new SubmissionDTO
            {
                SubmissionId = submissionId ?? 0,
                AssignmentId = submissionCreateDTO.AssignmentId,
                UserId = submissionCreateDTO.UserId,
                Answer = submissionCreateDTO.Answer,
                FileId = submissionCreateDTO.FileId,
                SubmittedAt = DateTime.UtcNow
            };

            return CreatedAtAction("GetSubmission", new { id = submissionId }, submissionDTO);
        }

        // PUT: api/Submissions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSubmission(int id, SubmissionUpdateDTO submissionUpdateDTO)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission == null)
            {
                return NotFound();
            }

            submission.Answer = submissionUpdateDTO.Answer;
            submission.FileId = submissionUpdateDTO.FileId;

            _context.Entry(submission).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SubmissionExists(id))
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

        // PATCH: api/Submissions/5/Grade
        [HttpPatch("{id}/Grade")]
        public async Task<IActionResult> GradeSubmission(int id, GradeSubmissionDTO gradeSubmissionDTO)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission == null)
            {
                return NotFound();
            }

            // Check if grader exists
            var grader = await _context.Users.FindAsync(gradeSubmissionDTO.GradedBy);
            if (grader == null)
            {
                return BadRequest(new { message = "Grader not found" });
            }

            // Validate score against assignment max score
            var assignment = await _context.Assignments.FindAsync(submission.AssignmentId);
            if (gradeSubmissionDTO.Score > assignment.MaxScore)
            {
                return BadRequest(new
                {
                    message = $"Score cannot exceed assignment maximum score of {assignment.MaxScore}"
                });
            }

            submission.Score = gradeSubmissionDTO.Score;
            submission.GradedBy = gradeSubmissionDTO.GradedBy;
            submission.GradedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Submissions/5/Unsubmit
        [HttpPatch("{id}/Unsubmit")]
        public async Task<IActionResult> UnsubmitSubmission(int id)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission == null)
            {
                return NotFound();
            }

            submission.Answer = null;
            submission.FileId = null;
            submission.SubmittedAt = DateTime.MinValue;
            submission.Score = null;
            submission.GradedAt = null;
            submission.GradedBy = null;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Submissions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubmission(int id)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission == null)
            {
                return NotFound();
            }

            _context.Submissions.Remove(submission);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Submissions/Late/ByAssignment/5
        [HttpGet("Late/ByAssignment/{assignmentId}")]
        public async Task<ActionResult<IEnumerable<SubmissionDTO>>> GetLateSubmissionsByAssignment(int assignmentId)
        {
            var assignment = await _context.Assignments.FindAsync(assignmentId);
            if (assignment == null)
            {
                return NotFound(new { message = $"Assignment with ID {assignmentId} not found" });
            }

            var lateSubmissions = await _context.Submissions
                .Where(s => s.AssignmentId == assignmentId &&
                           assignment.DueDate.HasValue &&
                           s.SubmittedAt > assignment.DueDate.Value)
                .Include(s => s.User)
                .Include(s => s.File)
                .Select(s => new SubmissionDTO
                {
                    SubmissionId = s.SubmissionId,
                    AssignmentId = s.AssignmentId,
                    UserId = s.UserId,
                    Answer = s.Answer,
                    FileId = s.FileId,
                    Score = s.Score,
                    SubmittedAt = s.SubmittedAt,
                    GradedAt = s.GradedAt,
                    GradedBy = s.GradedBy,
                    User = new UserSimpleDTO
                    {
                        UserId = s.User.UserId,
                        FullName = s.User.FullName,
                        Email = s.User.Email,
                        AvatarUrl = s.User.AvatarUrl
                    },
                    File = s.File != null ? new FileSimpleDTO
                    {
                        FileId = s.File.FileId,
                        Name = s.File.Name,
                        FilePath = s.File.FilePath,
                        FileType = s.File.FileType,
                        FileSizeBigint = s.File.FileSizeBigint
                    } : null
                })
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync();

            return Ok(lateSubmissions);
        }

        // GET: api/Submissions/Ungraded/ByAssignment/5
        [HttpGet("Ungraded/ByAssignment/{assignmentId}")]
        public async Task<ActionResult<IEnumerable<SubmissionDTO>>> GetUngradedSubmissionsByAssignment(int assignmentId)
        {
            var ungradedSubmissions = await _context.Submissions
                .Where(s => s.AssignmentId == assignmentId && !s.Score.HasValue)
                .Include(s => s.User)
                .Include(s => s.File)
                .Select(s => new SubmissionDTO
                {
                    SubmissionId = s.SubmissionId,
                    AssignmentId = s.AssignmentId,
                    UserId = s.UserId,
                    Answer = s.Answer,
                    FileId = s.FileId,
                    SubmittedAt = s.SubmittedAt,
                    User = new UserSimpleDTO
                    {
                        UserId = s.User.UserId,
                        FullName = s.User.FullName,
                        Email = s.User.Email,
                        AvatarUrl = s.User.AvatarUrl
                    },
                    File = s.File != null ? new FileSimpleDTO
                    {
                        FileId = s.File.FileId,
                        Name = s.File.Name,
                        FilePath = s.File.FilePath,
                        FileType = s.File.FileType,
                        FileSizeBigint = s.File.FileSizeBigint
                    } : null
                })
                .OrderBy(s => s.SubmittedAt)
                .ToListAsync();

            return Ok(ungradedSubmissions);
        }

        private bool SubmissionExists(int id)
        {
            return _context.Submissions.Any(e => e.SubmissionId == id);
        }

        private static string GetSubmissionStatus(Submission submission)
        {
            if (submission.SubmittedAt == DateTime.MinValue)
                return "not_submitted";

            if (!submission.Score.HasValue)
                return "submitted";

            if (submission.Assignment.DueDate.HasValue &&
                submission.SubmittedAt > submission.Assignment.DueDate.Value)
                return "late";

            return "graded";
        }
    }
}
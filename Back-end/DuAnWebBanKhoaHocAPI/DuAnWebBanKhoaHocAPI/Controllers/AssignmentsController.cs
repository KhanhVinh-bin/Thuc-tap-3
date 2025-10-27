using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssignmentsController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public AssignmentsController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Assignments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AssignmentDTO>>> GetAssignments()
        {
            var assignments = await _context.Assignments
                .Include(a => a.Course)
                .Include(a => a.Questions)
                .Select(a => new AssignmentDTO
                {
                    AssignmentId = a.AssignmentId,
                    CourseId = a.CourseId,
                    Title = a.Title,
                    Description = a.Description,
                    DueDate = a.DueDate,
                    MaxScore = a.MaxScore,
                    CreatedAt = a.CreatedAt,
                    Course = new CourseSimpleDTO
                    {
                        CourseId = a.Course.CourseId,
                        Title = a.Course.Title,
                        Description = a.Course.Description,
                        Price = a.Course.Price,
                        ThumbnailUrl = a.Course.ThumbnailUrl
                    },
                    Questions = a.Questions.Select(q => new QuestionDTO
                    {
                        QuestionId = q.QuestionId,
                        AssignmentId = q.AssignmentId,
                        QuestionText = q.QuestionText,
                        QuestionType = q.QuestionType,
                        Options = q.Options,
                        CorrectAnswer = q.CorrectAnswer,
                        Points = q.Points
                    }).ToList(),
                    SubmissionCount = _context.Submissions
                        .Count(s => s.AssignmentId == a.AssignmentId),
                    AverageScore = _context.Submissions
                        .Where(s => s.AssignmentId == a.AssignmentId && s.Score.HasValue)
                        .Average(s => (double?)s.Score)
                })
                .ToListAsync();

            return Ok(assignments);
        }

        // GET: api/Assignments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AssignmentDTO>> GetAssignment(int id)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Course)
                .Include(a => a.Questions)
                .Where(a => a.AssignmentId == id)
                .Select(a => new AssignmentDTO
                {
                    AssignmentId = a.AssignmentId,
                    CourseId = a.CourseId,
                    Title = a.Title,
                    Description = a.Description,
                    DueDate = a.DueDate,
                    MaxScore = a.MaxScore,
                    CreatedAt = a.CreatedAt,
                    Course = new CourseSimpleDTO
                    {
                        CourseId = a.Course.CourseId,
                        Title = a.Course.Title,
                        Description = a.Course.Description,
                        Price = a.Course.Price,
                        ThumbnailUrl = a.Course.ThumbnailUrl
                    },
                    Questions = a.Questions.Select(q => new QuestionDTO
                    {
                        QuestionId = q.QuestionId,
                        AssignmentId = q.AssignmentId,
                        QuestionText = q.QuestionText,
                        QuestionType = q.QuestionType,
                        Options = q.Options,
                        CorrectAnswer = q.CorrectAnswer,
                        Points = q.Points
                    }).ToList(),
                    SubmissionCount = _context.Submissions
                        .Count(s => s.AssignmentId == a.AssignmentId),
                    AverageScore = _context.Submissions
                        .Where(s => s.AssignmentId == a.AssignmentId && s.Score.HasValue)
                        .Average(s => (double?)s.Score)
                })
                .FirstOrDefaultAsync();

            if (assignment == null)
            {
                return NotFound(new { message = $"Assignment with ID {id} not found" });
            }

            return assignment;
        }

        // GET: api/Assignments/ByCourse/5
        [HttpGet("ByCourse/{courseId}")]
        public async Task<ActionResult<IEnumerable<AssignmentDTO>>> GetAssignmentsByCourse(int courseId)
        {
            var assignments = await _context.Assignments
                .Where(a => a.CourseId == courseId)
                .Include(a => a.Questions)
                .Select(a => new AssignmentDTO
                {
                    AssignmentId = a.AssignmentId,
                    CourseId = a.CourseId,
                    Title = a.Title,
                    Description = a.Description,
                    DueDate = a.DueDate,
                    MaxScore = a.MaxScore,
                    CreatedAt = a.CreatedAt,
                    Questions = a.Questions.Select(q => new QuestionDTO
                    {
                        QuestionId = q.QuestionId,
                        AssignmentId = q.AssignmentId,
                        QuestionText = q.QuestionText,
                        QuestionType = q.QuestionType,
                        Options = q.Options,
                        CorrectAnswer = q.CorrectAnswer,
                        Points = q.Points
                    }).ToList(),
                    SubmissionCount = _context.Submissions
                        .Count(s => s.AssignmentId == a.AssignmentId)
                })
                .OrderBy(a => a.CreatedAt)
                .ToListAsync();

            return Ok(assignments);
        }

        // GET: api/Assignments/Stats/ByCourse/5
        [HttpGet("Stats/ByCourse/{courseId}")]
        public async Task<ActionResult<IEnumerable<AssignmentStatsDTO>>> GetAssignmentStatsByCourse(int courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                return NotFound(new { message = $"Course with ID {courseId} not found" });
            }

            var totalStudents = await _context.Enrollments
                .CountAsync(e => e.CourseId == courseId && e.Status == "active");

            var stats = await _context.Assignments
                .Where(a => a.CourseId == courseId)
                .Select(a => new AssignmentStatsDTO
                {
                    AssignmentId = a.AssignmentId,
                    Title = a.Title,
                    CourseId = a.CourseId,
                    CourseTitle = a.Course.Title,
                    DueDate = a.DueDate,
                    TotalStudents = totalStudents,
                    TotalSubmissions = _context.Submissions
                        .Count(s => s.AssignmentId == a.AssignmentId),
                    SubmittedCount = _context.Submissions
                        .Count(s => s.AssignmentId == a.AssignmentId),
                    GradedCount = _context.Submissions
                        .Count(s => s.AssignmentId == a.AssignmentId && s.Score.HasValue),
                    AverageScore = _context.Submissions
                        .Where(s => s.AssignmentId == a.AssignmentId && s.Score.HasValue)
                        .Average(s => (double?)s.Score),
                    CompletionRate = totalStudents > 0 ?
                        (double)_context.Submissions.Count(s => s.AssignmentId == a.AssignmentId) / totalStudents * 100 : 0
                })
                .ToListAsync();

            return Ok(stats);
        }

        // GET: api/Assignments/5/Questions
        [HttpGet("{id}/Questions")]
        public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetAssignmentQuestions(int id)
        {
            var questions = await _context.Questions
                .Where(q => q.AssignmentId == id)
                .Select(q => new QuestionDTO
                {
                    QuestionId = q.QuestionId,
                    AssignmentId = q.AssignmentId,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    Options = q.Options,
                    CorrectAnswer = q.CorrectAnswer,
                    Points = q.Points
                })
                .OrderBy(q => q.QuestionId)
                .ToListAsync();

            return Ok(questions);
        }

        // POST: api/Assignments
        [HttpPost]
        public async Task<ActionResult<AssignmentDTO>> PostAssignment(AssignmentCreateDTO assignmentCreateDTO)
        {
            // Check if course exists
            var course = await _context.Courses.FindAsync(assignmentCreateDTO.CourseId);
            if (course == null)
            {
                return BadRequest(new { message = "Course not found" });
            }

            var assignment = new Assignment
            {
                CourseId = assignmentCreateDTO.CourseId,
                Title = assignmentCreateDTO.Title,
                Description = assignmentCreateDTO.Description,
                DueDate = assignmentCreateDTO.DueDate,
                MaxScore = assignmentCreateDTO.MaxScore,
                CreatedAt = DateTime.UtcNow
            };

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();

            var assignmentDTO = new AssignmentDTO
            {
                AssignmentId = assignment.AssignmentId,
                CourseId = assignment.CourseId,
                Title = assignment.Title,
                Description = assignment.Description,
                DueDate = assignment.DueDate,
                MaxScore = assignment.MaxScore,
                CreatedAt = assignment.CreatedAt
            };

            return CreatedAtAction("GetAssignment", new { id = assignment.AssignmentId }, assignmentDTO);
        }

        // POST: api/Assignments/WithQuestions
        [HttpPost("WithQuestions")]
        public async Task<ActionResult<AssignmentDTO>> PostAssignmentWithQuestions(AssignmentWithQuestionsCreateDTO assignmentWithQuestionsCreateDTO)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Check if course exists
                var course = await _context.Courses.FindAsync(assignmentWithQuestionsCreateDTO.CourseId);
                if (course == null)
                {
                    return BadRequest(new { message = "Course not found" });
                }

                var assignment = new Assignment
                {
                    CourseId = assignmentWithQuestionsCreateDTO.CourseId,
                    Title = assignmentWithQuestionsCreateDTO.Title,
                    Description = assignmentWithQuestionsCreateDTO.Description,
                    DueDate = assignmentWithQuestionsCreateDTO.DueDate,
                    MaxScore = assignmentWithQuestionsCreateDTO.MaxScore,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Assignments.Add(assignment);
                await _context.SaveChangesAsync();

                // Add questions
                foreach (var questionDto in assignmentWithQuestionsCreateDTO.Questions)
                {
                    var question = new Question
                    {
                        AssignmentId = assignment.AssignmentId,
                        QuestionText = questionDto.QuestionText,
                        QuestionType = questionDto.QuestionType,
                        Options = questionDto.Options,
                        CorrectAnswer = questionDto.CorrectAnswer,
                        Points = questionDto.Points
                    };
                    _context.Questions.Add(question);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Return the created assignment with questions
                var createdAssignment = await _context.Assignments
                    .Include(a => a.Questions)
                    .Where(a => a.AssignmentId == assignment.AssignmentId)
                    .Select(a => new AssignmentDTO
                    {
                        AssignmentId = a.AssignmentId,
                        CourseId = a.CourseId,
                        Title = a.Title,
                        Description = a.Description,
                        DueDate = a.DueDate,
                        MaxScore = a.MaxScore,
                        CreatedAt = a.CreatedAt,
                        Questions = a.Questions.Select(q => new QuestionDTO
                        {
                            QuestionId = q.QuestionId,
                            AssignmentId = q.AssignmentId,
                            QuestionText = q.QuestionText,
                            QuestionType = q.QuestionType,
                            Options = q.Options,
                            CorrectAnswer = q.CorrectAnswer,
                            Points = q.Points
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction("GetAssignment", new { id = assignment.AssignmentId }, createdAssignment);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // PUT: api/Assignments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAssignment(int id, AssignmentUpdateDTO assignmentUpdateDTO)
        {
            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
            {
                return NotFound();
            }

            assignment.Title = assignmentUpdateDTO.Title;
            assignment.Description = assignmentUpdateDTO.Description;
            assignment.DueDate = assignmentUpdateDTO.DueDate;
            assignment.MaxScore = assignmentUpdateDTO.MaxScore;

            _context.Entry(assignment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AssignmentExists(id))
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

        // POST: api/Assignments/5/Questions
        [HttpPost("{id}/Questions")]
        public async Task<ActionResult<QuestionDTO>> PostQuestion(int id, QuestionCreateDTO questionCreateDTO)
        {
            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
            {
                return NotFound(new { message = $"Assignment with ID {id} not found" });
            }

            var question = new Question
            {
                AssignmentId = id,
                QuestionText = questionCreateDTO.QuestionText,
                QuestionType = questionCreateDTO.QuestionType,
                Options = questionCreateDTO.Options,
                CorrectAnswer = questionCreateDTO.CorrectAnswer,
                Points = questionCreateDTO.Points
            };

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            var questionDTO = new QuestionDTO
            {
                QuestionId = question.QuestionId,
                AssignmentId = question.AssignmentId,
                QuestionText = question.QuestionText,
                QuestionType = question.QuestionType,
                Options = question.Options,
                CorrectAnswer = question.CorrectAnswer,
                Points = question.Points
            };

            return CreatedAtAction("GetAssignmentQuestions", new { id = id }, questionDTO);
        }

        // PUT: api/Assignments/Questions/5
        [HttpPut("Questions/{questionId}")]
        public async Task<IActionResult> PutQuestion(int questionId, QuestionUpdateDTO questionUpdateDTO)
        {
            var question = await _context.Questions.FindAsync(questionId);
            if (question == null)
            {
                return NotFound();
            }

            question.QuestionText = questionUpdateDTO.QuestionText;
            question.QuestionType = questionUpdateDTO.QuestionType;
            question.Options = questionUpdateDTO.Options;
            question.CorrectAnswer = questionUpdateDTO.CorrectAnswer;
            question.Points = questionUpdateDTO.Points;

            _context.Entry(question).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuestionExists(questionId))
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

        // DELETE: api/Assignments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAssignment(int id)
        {
            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
            {
                return NotFound();
            }

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Assignments/Questions/5
        [HttpDelete("Questions/{questionId}")]
        public async Task<IActionResult> DeleteQuestion(int questionId)
        {
            var question = await _context.Questions.FindAsync(questionId);
            if (question == null)
            {
                return NotFound();
            }

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Assignments/5/DueDate
        [HttpPatch("{id}/DueDate")]
        public async Task<IActionResult> UpdateDueDate(int id, [FromBody] DateTime newDueDate)
        {
            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
            {
                return NotFound();
            }

            assignment.DueDate = newDueDate;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AssignmentExists(int id)
        {
            return _context.Assignments.Any(e => e.AssignmentId == id);
        }

        private bool QuestionExists(int id)
        {
            return _context.Questions.Any(e => e.QuestionId == id);
        }
    }

    // Additional DTO for creating assignment with questions
    public class AssignmentWithQuestionsCreateDTO
    {
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public decimal MaxScore { get; set; }
        public List<QuestionCreateDTO> Questions { get; set; } = new List<QuestionCreateDTO>();
    }
}
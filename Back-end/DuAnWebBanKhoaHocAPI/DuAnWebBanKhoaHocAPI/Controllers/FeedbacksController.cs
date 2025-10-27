using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbacksController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public FeedbacksController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Feedbacks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FeedbackDTO>>> GetFeedbacks()
        {
            var feedbacks = await _context.Feedbacks
                .Include(f => f.User)
                .Select(f => new FeedbackDTO
                {
                    FeedbackId = f.FeedbackId,
                    UserId = f.UserId,
                    Content = f.Content,
                    Rating = f.Rating,
                    CreatedAt = f.CreatedAt,
                    User = f.User != null ? new UserSimpleDTO
                    {
                        UserId = f.User.UserId,
                        FullName = f.User.FullName,
                        Email = f.User.Email,
                        AvatarUrl = f.User.AvatarUrl
                    } : null
                })
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            return Ok(feedbacks);
        }

        // GET: api/Feedbacks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FeedbackDTO>> GetFeedback(int id)
        {
            var feedback = await _context.Feedbacks
                .Include(f => f.User)
                .Where(f => f.FeedbackId == id)
                .Select(f => new FeedbackDTO
                {
                    FeedbackId = f.FeedbackId,
                    UserId = f.UserId,
                    Content = f.Content,
                    Rating = f.Rating,
                    CreatedAt = f.CreatedAt,
                    User = f.User != null ? new UserSimpleDTO
                    {
                        UserId = f.User.UserId,
                        FullName = f.User.FullName,
                        Email = f.User.Email,
                        AvatarUrl = f.User.AvatarUrl
                    } : null
                })
                .FirstOrDefaultAsync();

            if (feedback == null)
            {
                return NotFound(new { message = $"Feedback with ID {id} not found" });
            }

            return feedback;
        }

        // GET: api/Feedbacks/ByUser/5
        [HttpGet("ByUser/{userId}")]
        public async Task<ActionResult<IEnumerable<FeedbackDTO>>> GetFeedbacksByUser(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
            {
                return NotFound(new { message = $"User with ID {userId} not found" });
            }

            var feedbacks = await _context.Feedbacks
                .Include(f => f.User)
                .Where(f => f.UserId == userId)
                .Select(f => new FeedbackDTO
                {
                    FeedbackId = f.FeedbackId,
                    UserId = f.UserId,
                    Content = f.Content,
                    Rating = f.Rating,
                    CreatedAt = f.CreatedAt,
                    User = f.User != null ? new UserSimpleDTO
                    {
                        UserId = f.User.UserId,
                        FullName = f.User.FullName,
                        Email = f.User.Email,
                        AvatarUrl = f.User.AvatarUrl
                    } : null
                })
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            return Ok(feedbacks);
        }

        // GET: api/Feedbacks/WithRating
        [HttpGet("WithRating")]
        public async Task<ActionResult<IEnumerable<FeedbackDTO>>> GetFeedbacksWithRating()
        {
            var feedbacks = await _context.Feedbacks
                .Include(f => f.User)
                .Where(f => f.Rating.HasValue)
                .Select(f => new FeedbackDTO
                {
                    FeedbackId = f.FeedbackId,
                    UserId = f.UserId,
                    Content = f.Content,
                    Rating = f.Rating,
                    CreatedAt = f.CreatedAt,
                    User = f.User != null ? new UserSimpleDTO
                    {
                        UserId = f.User.UserId,
                        FullName = f.User.FullName,
                        Email = f.User.Email,
                        AvatarUrl = f.User.AvatarUrl
                    } : null
                })
                .OrderByDescending(f => f.Rating)
                .ThenByDescending(f => f.CreatedAt)
                .ToListAsync();

            return Ok(feedbacks);
        }

        // GET: api/Feedbacks/Recent/5
        [HttpGet("Recent/{count}")]
        public async Task<ActionResult<IEnumerable<FeedbackDTO>>> GetRecentFeedbacks(int count = 10)
        {
            var feedbacks = await _context.Feedbacks
                .Include(f => f.User)
                .OrderByDescending(f => f.CreatedAt)
                .Take(count)
                .Select(f => new FeedbackDTO
                {
                    FeedbackId = f.FeedbackId,
                    UserId = f.UserId,
                    Content = f.Content,
                    Rating = f.Rating,
                    CreatedAt = f.CreatedAt,
                    User = f.User != null ? new UserSimpleDTO
                    {
                        UserId = f.User.UserId,
                        FullName = f.User.FullName,
                        Email = f.User.Email,
                        AvatarUrl = f.User.AvatarUrl
                    } : null
                })
                .ToListAsync();

            return Ok(feedbacks);
        }

        // GET: api/Feedbacks/Stats
        [HttpGet("Stats")]
        public async Task<ActionResult<FeedbackStatsDTO>> GetFeedbackStats()
        {
            var totalFeedbacks = await _context.Feedbacks.CountAsync();
            var totalWithRating = await _context.Feedbacks.CountAsync(f => f.Rating.HasValue);
            var totalWithoutRating = await _context.Feedbacks.CountAsync(f => !f.Rating.HasValue);

            var feedbacksWithRating = await _context.Feedbacks
                .Where(f => f.Rating.HasValue)
                .ToListAsync();

            var averageRating = feedbacksWithRating.Any() ?
                feedbacksWithRating.Average(f => f.Rating.Value) : 0;

            var fiveStar = feedbacksWithRating.Count(f => f.Rating == 5);
            var fourStar = feedbacksWithRating.Count(f => f.Rating == 4);
            var threeStar = feedbacksWithRating.Count(f => f.Rating == 3);
            var twoStar = feedbacksWithRating.Count(f => f.Rating == 2);
            var oneStar = feedbacksWithRating.Count(f => f.Rating == 1);

            var stats = new FeedbackStatsDTO
            {
                TotalFeedbacks = totalFeedbacks,
                TotalWithRating = totalWithRating,
                TotalWithoutRating = totalWithoutRating,
                AverageRating = Math.Round(averageRating, 1),
                FiveStar = fiveStar,
                FourStar = fourStar,
                ThreeStar = threeStar,
                TwoStar = twoStar,
                OneStar = oneStar
            };

            return Ok(stats);
        }

        // POST: api/Feedbacks
        [HttpPost]
        public async Task<ActionResult<FeedbackDTO>> PostFeedback(FeedbackCreateDTO feedbackCreateDTO)
        {
            // Validate rating if provided
            if (feedbackCreateDTO.Rating.HasValue &&
                (feedbackCreateDTO.Rating < 1 || feedbackCreateDTO.Rating > 5))
            {
                return BadRequest(new { message = "Rating must be between 1 and 5" });
            }

            // Validate user exists if provided
            if (feedbackCreateDTO.UserId.HasValue)
            {
                var user = await _context.Users.FindAsync(feedbackCreateDTO.UserId.Value);
                if (user == null)
                {
                    return BadRequest(new { message = "User not found" });
                }
            }

            // Validate content is not empty
            if (string.IsNullOrWhiteSpace(feedbackCreateDTO.Content))
            {
                return BadRequest(new { message = "Content cannot be empty" });
            }

            var feedback = new Feedback
            {
                UserId = feedbackCreateDTO.UserId,
                Content = feedbackCreateDTO.Content,
                Rating = feedbackCreateDTO.Rating,
                CreatedAt = DateTime.UtcNow
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            // Return the created feedback with user details
            var createdFeedback = await _context.Feedbacks
                .Include(f => f.User)
                .Where(f => f.FeedbackId == feedback.FeedbackId)
                .Select(f => new FeedbackDTO
                {
                    FeedbackId = f.FeedbackId,
                    UserId = f.UserId,
                    Content = f.Content,
                    Rating = f.Rating,
                    CreatedAt = f.CreatedAt,
                    User = f.User != null ? new UserSimpleDTO
                    {
                        UserId = f.User.UserId,
                        FullName = f.User.FullName,
                        Email = f.User.Email,
                        AvatarUrl = f.User.AvatarUrl
                    } : null
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction("GetFeedback", new { id = feedback.FeedbackId }, createdFeedback);
        }

        // PUT: api/Feedbacks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFeedback(int id, FeedbackUpdateDTO feedbackUpdateDTO)
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
            {
                return NotFound();
            }

            // Validate rating if provided
            if (feedbackUpdateDTO.Rating.HasValue &&
                (feedbackUpdateDTO.Rating < 1 || feedbackUpdateDTO.Rating > 5))
            {
                return BadRequest(new { message = "Rating must be between 1 and 5" });
            }

            // Validate content is not empty
            if (string.IsNullOrWhiteSpace(feedbackUpdateDTO.Content))
            {
                return BadRequest(new { message = "Content cannot be empty" });
            }

            feedback.Content = feedbackUpdateDTO.Content;
            feedback.Rating = feedbackUpdateDTO.Rating;

            _context.Entry(feedback).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FeedbackExists(id))
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

        // DELETE: api/Feedbacks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
            {
                return NotFound();
            }

            _context.Feedbacks.Remove(feedback);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Feedbacks/Search
        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<FeedbackDTO>>> SearchFeedbacks(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return BadRequest(new { message = "Search keyword cannot be empty" });
            }

            var feedbacks = await _context.Feedbacks
                .Include(f => f.User)
                .Where(f => f.Content.Contains(keyword))
                .Select(f => new FeedbackDTO
                {
                    FeedbackId = f.FeedbackId,
                    UserId = f.UserId,
                    Content = f.Content,
                    Rating = f.Rating,
                    CreatedAt = f.CreatedAt,
                    User = f.User != null ? new UserSimpleDTO
                    {
                        UserId = f.User.UserId,
                        FullName = f.User.FullName,
                        Email = f.User.Email,
                        AvatarUrl = f.User.AvatarUrl
                    } : null
                })
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            return Ok(feedbacks);
        }

        // GET: api/Feedbacks/ByRating/5
        [HttpGet("ByRating/{rating}")]
        public async Task<ActionResult<IEnumerable<FeedbackDTO>>> GetFeedbacksByRating(int rating)
        {
            if (rating < 1 || rating > 5)
            {
                return BadRequest(new { message = "Rating must be between 1 and 5" });
            }

            var feedbacks = await _context.Feedbacks
                .Include(f => f.User)
                .Where(f => f.Rating == rating)
                .Select(f => new FeedbackDTO
                {
                    FeedbackId = f.FeedbackId,
                    UserId = f.UserId,
                    Content = f.Content,
                    Rating = f.Rating,
                    CreatedAt = f.CreatedAt,
                    User = f.User != null ? new UserSimpleDTO
                    {
                        UserId = f.User.UserId,
                        FullName = f.User.FullName,
                        Email = f.User.Email,
                        AvatarUrl = f.User.AvatarUrl
                    } : null
                })
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            return Ok(feedbacks);
        }

        private bool FeedbackExists(int id)
        {
            return _context.Feedbacks.Any(e => e.FeedbackId == id);
        }
    }
}
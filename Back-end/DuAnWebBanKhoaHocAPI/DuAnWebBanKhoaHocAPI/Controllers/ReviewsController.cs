using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public ReviewsController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Reviews
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewDTO>>> GetReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(r => r.User)
                .Select(r => new ReviewDTO
                {
                    ReviewId = r.ReviewId,
                    CourseId = r.CourseId,
                    UserId = r.UserId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    Course = new CourseSimpleDTO
                    {
                        CourseId = r.Course.CourseId,
                        Title = r.Course.Title,
                        ThumbnailUrl = r.Course.ThumbnailUrl,
                        Price = r.Course.Price,
                        InstructorId = r.Course.InstructorId,
                        InstructorName = r.Course.Instructor != null ?
                            r.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    },
                    User = new UserSimpleDTO
                    {
                        UserId = r.User.UserId,
                        FullName = r.User.FullName,
                        Email = r.User.Email,
                        AvatarUrl = r.User.AvatarUrl
                    }
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
        }

        // GET: api/Reviews/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReviewDTO>> GetReview(int id)
        {
            var review = await _context.Reviews
                .Include(r => r.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(r => r.User)
                .Where(r => r.ReviewId == id)
                .Select(r => new ReviewDTO
                {
                    ReviewId = r.ReviewId,
                    CourseId = r.CourseId,
                    UserId = r.UserId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    Course = new CourseSimpleDTO
                    {
                        CourseId = r.Course.CourseId,
                        Title = r.Course.Title,
                        ThumbnailUrl = r.Course.ThumbnailUrl,
                        Price = r.Course.Price,
                        InstructorId = r.Course.InstructorId,
                        InstructorName = r.Course.Instructor != null ?
                            r.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    },
                    User = new UserSimpleDTO
                    {
                        UserId = r.User.UserId,
                        FullName = r.User.FullName,
                        Email = r.User.Email,
                        AvatarUrl = r.User.AvatarUrl
                    }
                })
                .FirstOrDefaultAsync();

            if (review == null)
            {
                return NotFound(new { message = $"Review with ID {id} not found" });
            }

            return review;
        }

        // GET: api/Reviews/ByCourse/5
        [HttpGet("ByCourse/{courseId}")]
        public async Task<ActionResult<CourseReviewsDTO>> GetReviewsByCourse(int courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Instructor)
                    .ThenInclude(i => i.InstructorNavigation)
                .Where(c => c.CourseId == courseId)
                .Select(c => new CourseSimpleDTO
                {
                    CourseId = c.CourseId,
                    Title = c.Title,
                    ThumbnailUrl = c.ThumbnailUrl,
                    Price = c.Price,
                    InstructorId = c.InstructorId,
                    InstructorName = c.Instructor != null ?
                        c.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                })
                .FirstOrDefaultAsync();

            if (course == null)
            {
                return NotFound(new { message = $"Course with ID {courseId} not found" });
            }

            var reviews = await _context.Reviews
                .Where(r => r.CourseId == courseId)
                .Include(r => r.User)
                .Select(r => new ReviewDTO
                {
                    ReviewId = r.ReviewId,
                    CourseId = r.CourseId,
                    UserId = r.UserId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    User = new UserSimpleDTO
                    {
                        UserId = r.User.UserId,
                        FullName = r.User.FullName,
                        Email = r.User.Email,
                        AvatarUrl = r.User.AvatarUrl
                    }
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var stats = await GetReviewStats(courseId);

            var result = new CourseReviewsDTO
            {
                Course = course,
                Reviews = reviews,
                Stats = stats
            };

            return Ok(result);
        }

        // GET: api/Reviews/ByUser/5
        [HttpGet("ByUser/{userId}")]
        public async Task<ActionResult<IEnumerable<ReviewDTO>>> GetReviewsByUser(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
            {
                return NotFound(new { message = $"User with ID {userId} not found" });
            }

            var reviews = await _context.Reviews
                .Where(r => r.UserId == userId)
                .Include(r => r.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Select(r => new ReviewDTO
                {
                    ReviewId = r.ReviewId,
                    CourseId = r.CourseId,
                    UserId = r.UserId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    Course = new CourseSimpleDTO
                    {
                        CourseId = r.Course.CourseId,
                        Title = r.Course.Title,
                        ThumbnailUrl = r.Course.ThumbnailUrl,
                        Price = r.Course.Price,
                        InstructorId = r.Course.InstructorId,
                        InstructorName = r.Course.Instructor != null ?
                            r.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    }
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
        }

        // GET: api/Reviews/Stats/ByCourse/5
        [HttpGet("Stats/ByCourse/{courseId}")]
        public async Task<ActionResult<ReviewStatsDTO>> GetReviewStatsByCourse(int courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                return NotFound(new { message = $"Course with ID {courseId} not found" });
            }

            var stats = await GetReviewStats(courseId);
            return Ok(stats);
        }

        // POST: api/Reviews
        [HttpPost]
        public async Task<ActionResult<ReviewDTO>> PostReview(ReviewCreateDTO reviewCreateDTO)
        {
            // Validate rating
            if (reviewCreateDTO.Rating < 1 || reviewCreateDTO.Rating > 5)
            {
                return BadRequest(new { message = "Rating must be between 1 and 5" });
            }

            // Check if course exists
            var course = await _context.Courses.FindAsync(reviewCreateDTO.CourseId);
            if (course == null)
            {
                return BadRequest(new { message = "Course not found" });
            }

            // Check if user exists
            var user = await _context.Users.FindAsync(reviewCreateDTO.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            // Check if user is enrolled in the course
            var isEnrolled = await _context.Enrollments
                .AnyAsync(e => e.UserId == reviewCreateDTO.UserId &&
                              e.CourseId == reviewCreateDTO.CourseId &&
                              e.Status == "active");
            if (!isEnrolled)
            {
                return BadRequest(new { message = "User is not enrolled in this course" });
            }

            // Allow users to submit multiple reviews for the same course
            var review = new Review
            {
                CourseId = reviewCreateDTO.CourseId,
                UserId = reviewCreateDTO.UserId,
                Rating = reviewCreateDTO.Rating,
                Comment = reviewCreateDTO.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Update course rating average
            await UpdateCourseRating(reviewCreateDTO.CourseId);

            // Return the created review with full details
            var createdReview = await _context.Reviews
                .Include(r => r.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(r => r.User)
                .Where(r => r.ReviewId == review.ReviewId)
                .Select(r => new ReviewDTO
                {
                    ReviewId = r.ReviewId,
                    CourseId = r.CourseId,
                    UserId = r.UserId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    Course = new CourseSimpleDTO
                    {
                        CourseId = r.Course.CourseId,
                        Title = r.Course.Title,
                        ThumbnailUrl = r.Course.ThumbnailUrl,
                        Price = r.Course.Price,
                        InstructorId = r.Course.InstructorId,
                        InstructorName = r.Course.Instructor != null ?
                            r.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    },
                    User = new UserSimpleDTO
                    {
                        UserId = r.User.UserId,
                        FullName = r.User.FullName,
                        Email = r.User.Email,
                        AvatarUrl = r.User.AvatarUrl
                    }
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction("GetReview", new { id = review.ReviewId }, createdReview);
        }

        // PUT: api/Reviews/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReview(int id, ReviewUpdateDTO reviewUpdateDTO)
        {
            // Validate rating
            if (reviewUpdateDTO.Rating < 1 || reviewUpdateDTO.Rating > 5)
            {
                return BadRequest(new { message = "Rating must be between 1 and 5" });
            }

            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound();
            }

            review.Rating = reviewUpdateDTO.Rating;
            review.Comment = reviewUpdateDTO.Comment;

            _context.Entry(review).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                // Update course rating average
                await UpdateCourseRating(review.CourseId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReviewExists(id))
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

        // DELETE: api/Reviews/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound();
            }

            var courseId = review.CourseId;
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            // Update course rating average after deletion
            await UpdateCourseRating(courseId);

            return NoContent();
        }

        // GET: api/Reviews/Recent/5
        [HttpGet("Recent/{count}")]
        public async Task<ActionResult<IEnumerable<ReviewDTO>>> GetRecentReviews(int count = 10)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Take(count)
                .Select(r => new ReviewDTO
                {
                    ReviewId = r.ReviewId,
                    CourseId = r.CourseId,
                    UserId = r.UserId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    Course = new CourseSimpleDTO
                    {
                        CourseId = r.Course.CourseId,
                        Title = r.Course.Title,
                        ThumbnailUrl = r.Course.ThumbnailUrl,
                        Price = r.Course.Price,
                        InstructorId = r.Course.InstructorId,
                        InstructorName = r.Course.Instructor != null ?
                            r.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    },
                    User = new UserSimpleDTO
                    {
                        UserId = r.User.UserId,
                        FullName = r.User.FullName,
                        Email = r.User.Email,
                        AvatarUrl = r.User.AvatarUrl
                    }
                })
                .ToListAsync();

            return Ok(reviews);
        }

        private bool ReviewExists(int id)
        {
            return _context.Reviews.Any(e => e.ReviewId == id);
        }

        private async Task<ReviewStatsDTO> GetReviewStats(int courseId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.CourseId == courseId)
                .ToListAsync();

            var course = await _context.Courses
                .Where(c => c.CourseId == courseId)
                .Select(c => new { c.Title })
                .FirstOrDefaultAsync();

            if (!reviews.Any())
            {
                return new ReviewStatsDTO
                {
                    CourseId = courseId,
                    CourseTitle = course?.Title ?? "Unknown Course",
                    TotalReviews = 0,
                    AverageRating = 0,
                    FiveStar = 0,
                    FourStar = 0,
                    ThreeStar = 0,
                    TwoStar = 0,
                    OneStar = 0,
                    RatingPercentage = 0
                };
            }

            var totalReviews = reviews.Count;
            var averageRating = reviews.Average(r => r.Rating);
            var fiveStar = reviews.Count(r => r.Rating == 5);
            var fourStar = reviews.Count(r => r.Rating == 4);
            var threeStar = reviews.Count(r => r.Rating == 3);
            var twoStar = reviews.Count(r => r.Rating == 2);
            var oneStar = reviews.Count(r => r.Rating == 1);
            var ratingPercentage = totalReviews > 0 ? (decimal)totalReviews / totalReviews * 100 : 0;

            return new ReviewStatsDTO
            {
                CourseId = courseId,
                CourseTitle = course?.Title ?? "Unknown Course",
                TotalReviews = totalReviews,
                AverageRating = Math.Round(averageRating, 1),
                FiveStar = fiveStar,
                FourStar = fourStar,
                ThreeStar = threeStar,
                TwoStar = twoStar,
                OneStar = oneStar,
                RatingPercentage = Math.Round(ratingPercentage, 1)
            };
        }

        private async Task UpdateCourseRating(int courseId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.CourseId == courseId)
                .ToListAsync();

            if (reviews.Any())
            {
                var averageRating = reviews.Average(r => r.Rating);
                // You can store this in the Course table if you add a RatingAverage field
                // For now, we'll just recalculate when needed
            }
        }
    }
}
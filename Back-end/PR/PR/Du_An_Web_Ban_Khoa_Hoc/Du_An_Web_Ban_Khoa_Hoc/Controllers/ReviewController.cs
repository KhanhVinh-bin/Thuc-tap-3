using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;
using Microsoft.AspNetCore.Authorization;
using Azure.Core;
using NuGet.Common;
using Microsoft.CodeAnalysis.Elfie.Serialization;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Hosting;
using Du_An_Web_Ban_Khoa_Hoc.Models.DTO;
using System.Security.Claims;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [Authorize(Roles = "instructor")]
    [Route("api/[Controller]")]
    [ApiController]
    public class ReviewController : Controller
    {
        private readonly AppDbContext _context;

        public ReviewController(AppDbContext context)
        {
            _context = context;
        }

        //Lấy thông tin tổng quát

        //trả về dữ liệu thống kê gồm:
        //Tổng số đánh giá(TotalReviews)
        //Điểm trung bình(AverageRating)
        //Tổng số đã phản hồi(TotalReplied)
        // số chờ phản hồi(TotalPending)
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/reviews/summary/Thong_tin_tong_quat")]
        public async Task<IActionResult> GetInstructorReviewSummary()
        {
            // 🔹 Lấy InstructorId từ token
            var instructorIdClaim = User.FindFirst("InstructorId");
            if (instructorIdClaim == null)
                return Unauthorized("Không tìm thấy InstructorId trong token.");

            if (!int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId trong token không hợp lệ.");

            // 🔹 Kiểm tra giảng viên có tồn tại không
            var instructorExists = await _context.Instructors
                .AnyAsync(i => i.InstructorId == instructorId);

            if (!instructorExists)
                return NotFound("Không tìm thấy giảng viên.");

            // 🔹 Lấy toàn bộ review của các khóa học thuộc giảng viên
            var reviews = _context.Reviews
                .Where(r => r.Course.InstructorId == instructorId);

            var totalReviews = await reviews.CountAsync();
            var averageRating = await reviews.AverageAsync(r => (double?)r.Rating) ?? 0.0;

            // 🔹 Giả lập phần phản hồi (vì không lưu trong DB)
            // Ví dụ: nếu có comment > 50 ký tự → coi như đã phản hồi (logic demo)
            var totalReplied = await reviews.CountAsync(r => r.Comment.Length > 50);
            var totalPending = totalReviews - totalReplied;
            if (totalPending < 0) totalPending = 0;

            // 🔹 Gán vào DTO tạm
            var summary = new InstructorReviewSummaryDTO
            {
                TotalReviews = totalReviews,
                AverageRating = Math.Round(averageRating, 2),
                TotalReplied = totalReplied,
                TotalPending = totalPending
            };

            return Ok(summary);
        }


        //GET: thống kê phần trăm số lượng đánh giá theo từng mức sao (1⭐–5⭐) và số lượng (Count đánh giá) cho toàn bộ khóa học của 1 giảng viên (dựa trên token đăng nhập của giảng viên).
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/my-courses/reviews/rating-summary/Thong_ke_Diem_danh_gia")]
        public async Task<IActionResult> GetInstructorRatingSummary()
        {
            // Lấy InstructorId từ token
            var instructorIdClaim = User.FindFirst("InstructorId");
            if (instructorIdClaim == null)
                return Unauthorized("Không tìm thấy InstructorId trong token.");

            if (!int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId trong token không hợp lệ.");

            // Kiểm tra giảng viên có tồn tại
            var instructorExists = await _context.Instructors
                .AnyAsync(i => i.InstructorId == instructorId);
            if (!instructorExists)
                return NotFound("Không tìm thấy giảng viên.");

            // Lấy tất cả đánh giá của các khóa học thuộc giảng viên
            var reviews = _context.Reviews
                .Where(r => r.Course.InstructorId == instructorId);

            var totalReviews = await reviews.CountAsync();
            if (totalReviews == 0)
            {
                return Ok(new
                {
                    Message = "Chưa có đánh giá nào.",
                    TotalReviews = 0,
                    TotalPoints = 0,
                    RatingSummary = new object[] { }
                });
            }

            // Nhóm đánh giá theo số sao
            var groupedRatings = await reviews
                .GroupBy(r => r.Rating)
                .Select(g => new
                {
                    Star = g.Key,
                    Count = g.Count(),
                    TotalPoints = g.Sum(x => x.Rating) // Tổng điểm = số lượt × giá trị sao
                })
                .ToListAsync();

            // Tính tổng điểm toàn bộ
            var totalPointsAll = groupedRatings.Sum(x => x.TotalPoints);

            // Tính phần trăm từng loại sao / tổng điểm tất cả sao
            var ratingSummary = Enumerable.Range(1, 5)
                .Select(star =>
                {
                    var rating = groupedRatings.FirstOrDefault(x => x.Star == star);
                    var count = rating?.Count ?? 0;
                    var totalPoints = rating?.TotalPoints ?? 0;

                    double percentage = totalPointsAll > 0
                        ? Math.Round((totalPoints * 100.0) / totalPointsAll, 2)
                        : 0;

                    return new
                    {
                        Star = star,                //  Mức sao
                        Count = count,              //  Số lượt đánh giá loại sao đó
                        TotalPoints = totalPoints,  //  Tổng điểm (Count × Star)
                        Percentage = percentage     //  % so với tổng điểm toàn bộ
                    };
                })
                .OrderByDescending(x => x.Star)
                .ToList();

            // Trung bình sao tổng thể (nếu cần hiển thị thêm)
            var averageRating = Math.Round(
                await reviews.AverageAsync(r => (double?)r.Rating) ?? 0.0, 2);

            // Trả về kết quả JSON
            return Ok(new
            {
                TotalReviews = totalReviews,
                TotalPoints = totalPointsAll,
                AverageRating = averageRating,
                RatingSummary = ratingSummary
            });
        }

        //bộ lọc linh hoạt gồm:
        //Tất cả đánh giá(mặc định, hiển thị tất cả)
        //Theo tiêu đề khóa học(Course Title) — tức là lọc đánh giá của 1 khóa cụ thể
        //Tìm kiếm tất cả(Search All) — ví dụ người dùng nhập từ khóa, tìm trong tên học viên, tiêu đề khóa học, bình luận review, v.v.
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/my-courses/reviews/search/Tim_kiem_theo_bo_loc")]
        public async Task<IActionResult> SearchInstructorReviews(
        [FromQuery] string? courseTitle = null,
        [FromQuery] string? keyword = null,
        [FromQuery] int? rating = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
        {
            // Lấy InstructorId từ token
            var instructorIdClaim = User.FindFirst("InstructorId");
            if (instructorIdClaim == null)
                return Unauthorized("Không tìm thấy InstructorId trong token.");

            if (!int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId trong token không hợp lệ.");

            // Kiểm tra giảng viên có tồn tại
            var instructorExists = await _context.Instructors
                .AnyAsync(i => i.InstructorId == instructorId);
            if (!instructorExists)
                return NotFound("Không tìm thấy giảng viên.");

            // Lấy tất cả review thuộc các khóa học của giảng viên
            var query = _context.Reviews
                .Include(r => r.Course)
                .Include(r => r.User)
                .Where(r => r.Course.InstructorId == instructorId)
                .AsQueryable();

            // Bộ lọc theo tiêu đề khóa học (nếu có)
            if (!string.IsNullOrEmpty(courseTitle))
            {
                query = query.Where(r => r.Course.Title.Contains(courseTitle));
            }

            // Bộ lọc theo số sao cụ thể (1–5)
            if (rating.HasValue && rating.Value >= 1 && rating.Value <= 5)
            {
                query = query.Where(r => r.Rating == rating.Value);
            }

            // Tìm kiếm toàn cục (keyword)
            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(r =>
                    r.Comment.Contains(keyword) ||
                    r.Course.Title.Contains(keyword) ||
                    r.User.FullName.Contains(keyword));
            }

            // Tổng số kết quả (trước phân trang)
            var totalCount = await query.CountAsync();

            //Phân trang
            var reviews = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new
                {
                    r.ReviewId,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
                    CourseTitle = r.Course.Title,
                    StudentName = r.User.FullName,
                    //InstructorReply = r.InstructorReply,
                    //InstructorReplyAt = r.InstructorReplyAt
                })
                .ToListAsync();

            // Trả kết quả
            return Ok(new
            {
                TotalResults = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                Data = reviews
            });
        }

        //Lấy danh sách tất cả đánh giá của các khóa học thuộc giảng viên, gồm:

        //Tên học viên      
        //Tiêu đề khóa học
        //Rating
        //Thời gian đánh giá
        //Nội dung đánh giá
        //*Phản hồi tự động(ngẫu nhiên) từ danh sách có sẵn(chỉ trả về khi GET, không lưu DB)*
        // API 1: Lấy danh sách review của giảng viên
        [Authorize(Roles = "instructor")]
        [HttpGet("Get/reviews/all/Lay_toan_bo_danh_sach_danh_gia")]
        public async Task<IActionResult> GetAllStudentReviews()
        {
            var instructorIdClaim = User.FindFirst("InstructorId");
            if (instructorIdClaim == null || !int.TryParse(instructorIdClaim.Value, out int instructorId))
                return Unauthorized("InstructorId không hợp lệ.");

            var instructorExists = await _context.Instructors.AnyAsync(i => i.InstructorId == instructorId);
            if (!instructorExists) return NotFound("Không tìm thấy giảng viên.");

            var reviews = await _context.Reviews
                .Include(r => r.Course)
                .Include(r => r.User)
                .Where(r => r.Course.InstructorId == instructorId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new InstructorReviewDTO
                {
                    ReviewId = r.ReviewId,
                    StudentName = r.User.FullName,
                    CourseTitle = r.Course.Title,
                    Rating = r.Rating,
                    CreatedAt = r.CreatedAt,
                    Comment = r.Comment
                })
                .ToListAsync();

            if (!reviews.Any())
                return Ok(new { Message = "Chưa có đánh giá nào từ học viên." });

            return Ok(new
            {
                TotalReviews = reviews.Count,
                Reviews = reviews
            });
        }

        //Gửi phản hồi tự động khi "nhấn nút"
        [Authorize(Roles = "instructor")]
        [HttpPost("reviews/{reviewId}/auto-reply/")]
        public IActionResult AutoReplyReview(int reviewId)
        {
            var autoReplies = new List<string>
    {
        "Cảm ơn bạn đã chia sẻ cảm nhận! ❤️",
        "Thật vui khi khóa học hữu ích với bạn!",
        "Cảm ơn vì đánh giá tích cực nhé!",
        "Giảng viên sẽ cố gắng hoàn thiện hơn trong thời gian tới!",
        "Chân thành cảm ơn phản hồi của bạn 💬",
        "Hy vọng sẽ được đồng hành cùng bạn ở khóa học tiếp theo!"
    };

            var random = new Random();
            var reply = autoReplies[random.Next(autoReplies.Count)];

            // Trả về phản hồi tự động, frontend hiển thị luôn
            return Ok(new
            {
                ReviewId = reviewId,
                AutoReply = reply
            });
        }

    }
}

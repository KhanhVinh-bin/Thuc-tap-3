using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [ApiController]
    [Route("admin/reviews")]
    [Authorize(Roles = "Admin")]
    public class AdminReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminReviewsController(AppDbContext context)
        {
            _context = context;
        }

        // Danh sách bình luận: ID, Học viên, Khóa học, Nội dung, Điểm, Ngày gửi
        // Bộ lọc: studentId, studentName, courseId, courseTitle, status(visible|hidden), ratingMin, ratingMax, dateFrom, dateTo
        [HttpGet]
        public async Task<IActionResult> GetReviews(
            [FromQuery] int? studentId,
            [FromQuery] string? studentName,
            [FromQuery] int? courseId,
            [FromQuery] string? courseTitle,
            [FromQuery] string? status,
            [FromQuery] byte? ratingMin,
            [FromQuery] byte? ratingMax,
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo)
        {
            var query = _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Course)
                .AsQueryable();

            if (studentId.HasValue)
                query = query.Where(r => r.UserId == studentId.Value);

            if (!string.IsNullOrWhiteSpace(studentName))
                query = query.Where(r => r.User.FullName.Contains(studentName));

            if (courseId.HasValue)
                query = query.Where(r => r.CourseId == courseId.Value);

            if (!string.IsNullOrWhiteSpace(courseTitle))
                query = query.Where(r => r.Course.Title.Contains(courseTitle));

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (status.Equals("visible", StringComparison.OrdinalIgnoreCase))
                    query = query.Where(r => r.Comment != null);
                else if (status.Equals("hidden", StringComparison.OrdinalIgnoreCase))
                    query = query.Where(r => r.Comment == null);
            }

            if (ratingMin.HasValue)
                query = query.Where(r => r.Rating >= ratingMin.Value);

            if (ratingMax.HasValue)
                query = query.Where(r => r.Rating <= ratingMax.Value);

            if (dateFrom.HasValue)
                query = query.Where(r => r.CreatedAt >= dateFrom.Value);

            if (dateTo.HasValue)
                query = query.Where(r => r.CreatedAt <= dateTo.Value);

            var data = await query
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    ID = r.ReviewId,
                    HocVien = r.User.FullName,
                    KhoaHoc = r.Course.Title,
                    NoiDung = r.Comment,
                    DiemDanhGia = r.Rating,
                    NgayGui = r.CreatedAt
                })
                .ToListAsync();

            return Ok(data);
        }

        // Xem chi tiết bình luận
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetReviewDetail(int id)
        {
            var review = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Course)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.ReviewId == id);

            if (review == null)
                return NotFound(new { message = "Không tìm thấy bình luận" });

            var detail = new
            {
                ID = review.ReviewId,
                HocVien = new { review.UserId, review.User.FullName, review.User.Email },
                KhoaHoc = new { review.CourseId, review.Course.Title },
                NoiDung = review.Comment,
                DiemDanhGia = review.Rating,
                NgayGui = review.CreatedAt
            };

            return Ok(detail);
        }

        // Ẩn/Hiện bình luận: Ẩn = đặt Comment = null; Hiện = yêu cầu cung cấp nội dung mới
        [HttpPatch("{id:int}/hide")]
        public async Task<IActionResult> HideReview(int id, [FromBody] HideReviewRequest request)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.ReviewId == id);
            if (review == null)
                return NotFound(new { message = "Không tìm thấy bình luận" });

            if (request.Hide)
            {
                review.Comment = null;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Đã ẩn bình luận", status = "hidden" });
            }
            else
            {
                // “Unhide” yêu cầu nội dung mới (không có cơ chế khôi phục nội dung cũ)
                if (string.IsNullOrWhiteSpace(request.NewComment))
                    return BadRequest(new { message = "Vui lòng cung cấp nội dung để hiện lại bình luận" });

                review.Comment = request.NewComment;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Đã hiện lại bình luận", status = "visible" });
            }
        }

        // Xóa bình luận vi phạm (hard delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.ReviewId == id);
            if (review == null)
                return NotFound(new { message = "Không tìm thấy bình luận" });

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa bình luận" });
        }
    }

    public class HideReviewRequest
    {
        public bool Hide { get; set; } = true;
        public string? NewComment { get; set; }
    }
}
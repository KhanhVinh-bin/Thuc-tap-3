using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.Net.Http;
using System.IO;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [ApiController]
    [Route("admin/banners")]
    [Authorize(Roles = "Admin")]
    public class AdminBannersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public AdminBannersController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: admin/banners
        // Bộ lọc: q (tiêu đề), isActive, dateFrom (StartDate), dateTo (EndDate)
        [HttpGet]
        public async Task<IActionResult> GetBanners(
            [FromQuery] string? q,
            [FromQuery] bool? isActive,
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo)
        {
            var query = _context.Banners.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
                query = query.Where(b => b.Title != null && b.Title.Contains(q));

            if (isActive.HasValue)
                query = query.Where(b => b.IsActive == isActive.Value);

            if (dateFrom.HasValue)
                query = query.Where(b => b.StartDate >= dateFrom);

            if (dateTo.HasValue)
                query = query.Where(b => b.EndDate <= dateTo);

            var data = await query
                .OrderBy(b => b.SortOrder)
                .ThenByDescending(b => b.BannerId)
                .Select(b => new
                {
                    bannerId = b.BannerId,
                    title = b.Title,
                    imageUrl = b.ImageUrl,
                    linkUrl = b.LinkUrl,
                    sortOrder = b.SortOrder,
                    isActive = b.IsActive,
                    startDate = b.StartDate,
                    endDate = b.EndDate,

                    // Trường "thân thiện UI" để khớp nhanh với FE hiện tại
                    status = b.IsActive ? "Đang hiển thị" : "Đã ẩn",
                    statusType = b.IsActive ? "active" : "inactive",
                    position = InferPosition(b.LinkUrl),              // "Trang chủ" | "Khóa học" | "Khuyến mãi"
                    createdDate = (b.StartDate ?? DateTime.UtcNow)     // FE đang hiển thị raw; FE có thể format lại
                        .ToString("dd/MM/yyyy")
                })
                .ToListAsync();

            return Ok(data);
        }

        // GET: admin/banners/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetBannerDetail(int id)
        {
            var b = await _context.Banners.AsNoTracking().FirstOrDefaultAsync(x => x.BannerId == id);
            if (b == null) return NotFound(new { message = "Không tìm thấy banner" });

            var detail = new
            {
                bannerId = b.BannerId,
                title = b.Title,
                imageUrl = b.ImageUrl,
                linkUrl = b.LinkUrl,
                sortOrder = b.SortOrder,
                isActive = b.IsActive,
                startDate = b.StartDate,
                endDate = b.EndDate,

                status = b.IsActive ? "Đang hiển thị" : "Đã ẩn",
                statusType = b.IsActive ? "active" : "inactive",
                position = InferPosition(b.LinkUrl),
                createdDate = (b.StartDate ?? DateTime.UtcNow).ToString("dd/MM/yyyy")
            };

            return Ok(detail);
        }

        // POST: admin/banners
        [HttpPost]
        public async Task<IActionResult> CreateBanner([FromBody] CreateBannerRequest req)
        {
            // Validate cơ bản
            if (string.IsNullOrWhiteSpace(req.Title))
                return BadRequest(new { message = "Title không được để trống" });

            if (string.IsNullOrWhiteSpace(req.ImageUrl))
                return BadRequest(new { message = "ImageUrl không được để trống" });

            if (req.StartDate.HasValue && req.EndDate.HasValue && req.StartDate > req.EndDate)
                return BadRequest(new { message = "StartDate phải nhỏ hơn hoặc bằng EndDate" });

            var banner = new Banner
            {
                Title = req.Title?.Trim(),
                ImageUrl = req.ImageUrl?.Trim(),
                LinkUrl = req.LinkUrl?.Trim(),
                SortOrder = req.SortOrder ?? 0,
                IsActive = req.IsActive ?? true,
                StartDate = req.StartDate,
                EndDate = req.EndDate
            };

            _context.Banners.Add(banner);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBannerDetail), new { id = banner.BannerId }, new
            {
                bannerId = banner.BannerId
            });
        }

        // PUT: admin/banners/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateBanner(int id, [FromBody] UpdateBannerRequest req)
        {
            var banner = await _context.Banners.FirstOrDefaultAsync(x => x.BannerId == id);
            if (banner == null) return NotFound(new { message = "Không tìm thấy banner" });

            if (req.StartDate.HasValue && req.EndDate.HasValue && req.StartDate > req.EndDate)
                return BadRequest(new { message = "StartDate phải nhỏ hơn hoặc bằng EndDate" });

            // Cập nhật có điều kiện
            if (req.Title != null) banner.Title = req.Title.Trim();
            if (req.ImageUrl != null) banner.ImageUrl = req.ImageUrl.Trim();
            if (req.LinkUrl != null) banner.LinkUrl = req.LinkUrl.Trim();
            if (req.SortOrder.HasValue) banner.SortOrder = req.SortOrder.Value;
            if (req.IsActive.HasValue) banner.IsActive = req.IsActive.Value;
            if (req.StartDate.HasValue) banner.StartDate = req.StartDate;
            if (req.EndDate.HasValue) banner.EndDate = req.EndDate;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật banner thành công" });
        }

        // PATCH: admin/banners/{id}/status
        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> ToggleStatus(int id, [FromBody] ToggleBannerStatusRequest req)
        {
            var banner = await _context.Banners.FirstOrDefaultAsync(x => x.BannerId == id);
            if (banner == null) return NotFound(new { message = "Không tìm thấy banner" });

            banner.IsActive = req.IsActive ?? !banner.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { message = banner.IsActive ? "Đã bật hiển thị" : "Đã ẩn banner" });
        }

        // DELETE: admin/banners/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteBanner(int id)
        {
            var banner = await _context.Banners.FirstOrDefaultAsync(x => x.BannerId == id);
            if (banner == null) return NotFound(new { message = "Không tìm thấy banner" });

            _context.Banners.Remove(banner);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa banner" });
        }

        private static string InferPosition(string? linkUrl)
        {
            if (string.IsNullOrWhiteSpace(linkUrl)) return "Trang chủ";
            var url = linkUrl.ToLowerInvariant();

            if (url.Contains("promo") || url.Contains("sale") || url.Contains("khuyen"))
                return "Khuyến mãi";
            if (url.Contains("course"))
                return "Khóa học";

            return "Trang chủ";
        }

        [HttpPost("upload-file")]
        [RequestSizeLimit(10_000_000)] // 10 MB
        public async Task<IActionResult> UploadBannerFile([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File không hợp lệ" });

            var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml" };
            if (!allowedContentTypes.Contains(file.ContentType))
                return BadRequest(new { message = "Chỉ cho phép upload ảnh (jpeg, png, webp, gif, svg)" });

            var webRoot = _env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
            // Lưu vào wwwroot/image/banner
            var uploadDir = Path.Combine(webRoot, "image", "banner");
            Directory.CreateDirectory(uploadDir);
        
            var ext = Path.GetExtension(file.FileName);
            if (string.IsNullOrEmpty(ext))
            {
                ext = file.ContentType switch
                {
                    "image/jpeg" => ".jpg",
                    "image/png" => ".png",
                    "image/webp" => ".webp",
                    "image/gif" => ".gif",
                    "image/svg+xml" => ".svg",
                    _ => ".bin"
                };
            }
        
            var fileName = $"{Guid.NewGuid():N}{ext}";
            var fullPath = Path.Combine(uploadDir, fileName);
            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
        
            // Trả về đường dẫn đúng thư mục image/banner
            var relativePath = $"/image/banner/{fileName}";
            var imageUrl = BuildAbsoluteUrl(relativePath);
        
            return Ok(new
            {
                imageUrl,
                relativePath,
                fileName,
                size = file.Length,
            });
        }

        private string BuildAbsoluteUrl(string relativePath)
        {
            var scheme = Request.Scheme;
            var host = Request.Host.Value;
            var pathBase = Request.PathBase.HasValue ? Request.PathBase.Value : "";
            return $"{scheme}://{host}{pathBase}{relativePath.Replace("\\", "/")}";
        }
    }

    public class CreateBannerRequest
    {
        public string? Title { get; set; }
        public string? ImageUrl { get; set; }
        public string? LinkUrl { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class UpdateBannerRequest
    {
        public string? Title { get; set; }
        public string? ImageUrl { get; set; }
        public string? LinkUrl { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class ToggleBannerStatusRequest
    {
        public bool? IsActive { get; set; }
    }
}
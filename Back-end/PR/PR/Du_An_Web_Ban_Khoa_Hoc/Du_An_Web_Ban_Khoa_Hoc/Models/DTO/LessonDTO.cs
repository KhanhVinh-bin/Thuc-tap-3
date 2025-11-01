using System.ComponentModel.DataAnnotations;

namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class LessonDTO : IValidatableObject
    {
        // Thông tin cơ bản
        [Required(ErrorMessage = "Tiêu đề bài học là bắt buộc.")]
        public string? Title { get; set; } = null!;

        [Required(ErrorMessage = "Loại nội dung (ContentType) là bắt buộc.")]
        public string? ContentType { get; set; } = null!; // video | file | assignment | quiz | text | ...

        public string? Description { get; set; }

        // Video hoặc File (chỉ 1 trong 2, tùy ContentType)
        public string? VideoUrl { get; set; }   // nếu ContentType = "video"
        public int? FileId { get; set; }        // nếu ContentType = "file", "assignment", ...
        public string? FilePath { get; set; }   // để frontend tiện hiển thị

        // Thông tin thêm
        public int? DurationSec { get; set; }
        public int? SortOrder { get; set; } = 0;
        public string? Status { get; set; } = "draft"; // draft | published

        public List<FileDTO>? Files { get; set; }

        // Danh sách file đính kèm phụ (nếu có, ví dụ slide hoặc tài liệu hỗ trợ)
        public List<FileDTO>? Attachments { get; set; }

        // RÀNG BUỘC HỢP LỆ: tùy ContentType
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (ContentType?.ToLower() == "video")
            {
                if (string.IsNullOrWhiteSpace(VideoUrl))
                    yield return new ValidationResult("Phải nhập VideoUrl khi ContentType là 'video'.", new[] { nameof(VideoUrl) });
            }
            else if (ContentType?.ToLower() == "file" || ContentType?.ToLower() == "assignment" || ContentType?.ToLower() == "document")
            {
                if (FileId == null && string.IsNullOrWhiteSpace(FilePath))
                    yield return new ValidationResult("Phải chọn file (FileId hoặc FilePath) khi ContentType là 'file', 'assignment' .", new[] { nameof(FileId), nameof(FilePath) });
            }
            else
            {
                // Các loại khác (text, quiz, v.v.) không cần video hay file
                if (!string.IsNullOrWhiteSpace(VideoUrl) || FileId != null)
                    yield return new ValidationResult("Không cần VideoUrl hoặc File cho loại nội dung này.", new[] { nameof(VideoUrl), nameof(FileId) });
            }
        }
    }
}

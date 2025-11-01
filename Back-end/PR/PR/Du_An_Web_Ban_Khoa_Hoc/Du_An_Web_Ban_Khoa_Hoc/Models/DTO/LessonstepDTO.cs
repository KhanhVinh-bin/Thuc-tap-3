using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class LessonStepDTO : IValidatableObject
    {
        [Required(ErrorMessage = "Tiêu đề bài học là bắt buộc.")]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "Loại nội dung (ContentType) là bắt buộc.")]
        public string ContentType { get; set; } = null!; // "video" | "pdf" | "text"

        public string? Description { get; set; }

        // Video
        public string? VideoUrl { get; set; }

        // File
        public string? FilePath { get; set; } // frontend gửi tạm (đường dẫn sau khi upload)

        public int? DurationSec { get; set; }
        public int SortOrder { get; set; } = 1;
        public int? LessonId { get; set; }

        // Ẩn FileId để không xuất hiện trong Swagger
        [JsonIgnore]
        public int? FileId { get; set; }

        // RÀNG BUỘC HỢP LỆ
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            var ct = ContentType?.ToLower();

            if (string.IsNullOrWhiteSpace(ct))
            {
                yield return new ValidationResult("ContentType là bắt buộc.", new[] { nameof(ContentType) });
                yield break;
            }

            if (ct == "video")
            {
                if (string.IsNullOrWhiteSpace(VideoUrl))
                    yield return new ValidationResult("Phải nhập VideoUrl khi ContentType là 'video'.", new[] { nameof(VideoUrl) });
                if (!string.IsNullOrWhiteSpace(FilePath))
                    yield return new ValidationResult("Không cần FilePath khi ContentType là 'video'.", new[] { nameof(FilePath) });
            }
            else if (ct == "text" || ct == "pdf")
            {
                if (string.IsNullOrWhiteSpace(FilePath))
                    yield return new ValidationResult("Phải có FilePath khi ContentType là 'text' hoặc 'pdf'.", new[] { nameof(FilePath) });
                if (!string.IsNullOrWhiteSpace(VideoUrl))
                    yield return new ValidationResult("Không cần VideoUrl khi ContentType là 'text' hoặc 'pdf'.", new[] { nameof(VideoUrl) });
            }
        }
    }
}

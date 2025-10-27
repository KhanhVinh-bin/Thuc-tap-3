using System;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class LessonDTO
    {
        public int LessonId { get; set; }
        public int? CourseId { get; set; }
        public string Title { get; set; }
        public string ContentType { get; set; }
        public string VideoUrl { get; set; }
        public int? FileId { get; set; }
        public int? DurationSec { get; set; }
        public int SortOrder { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Navigation properties (simplified to avoid circular reference)
        public CourseSimpleDTO Course { get; set; }
        public FileSimpleDTO File { get; set; }
    }

    public class LessonCreateDTO
    {
        public int? CourseId { get; set; }
        public string Title { get; set; }
        public string ContentType { get; set; }
        public string VideoUrl { get; set; }
        public int? FileId { get; set; }
        public int? DurationSec { get; set; }
        public int SortOrder { get; set; }
    }

    public class LessonUpdateDTO
    {
        public int? CourseId { get; set; }
        public string Title { get; set; }
        public string ContentType { get; set; }
        public string VideoUrl { get; set; }
        public int? FileId { get; set; }
        public int? DurationSec { get; set; }
        public int SortOrder { get; set; }
    }

    // Simplified DTOs to avoid circular reference
  

    
}
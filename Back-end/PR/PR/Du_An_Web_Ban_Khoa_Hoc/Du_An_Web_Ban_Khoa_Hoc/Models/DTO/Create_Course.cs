using System.Text.Json.Serialization;

namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class Create_Course
    {
        public int? CourseId { get; set; }        // Nếu update
                                                  
        [JsonIgnore] // [JsonIgnore] giúp Swagger không hiển thị thuộc tính này
        public int StepNumber { get; set; }

        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? CategoryId { get; set; }
        public string? ThumbnailUrl { get; set; }
        public decimal? Price { get; set; }
        public string? Duration { get; set; }
        public string? Level { get; set; }
        public string? Prerequisites { get; set; }
        public string? LearningOutcomes { get; set; }
        public List<int>? TagIds { get; set; }
        // Danh sách bài học
        public List<LessonStepDTO>? Lessons { get; set; }
    }
}

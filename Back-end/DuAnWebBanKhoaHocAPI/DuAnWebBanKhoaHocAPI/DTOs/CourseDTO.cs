namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class CourseDTO
    {
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string ThumbnailUrl { get; set; }
        public string PreviewVideoUrl { get; set; }
        public int? InstructorId { get; set; }
        public int? CategoryId { get; set; }
        public string Language { get; set; }
        public string Duration { get; set; }
        public string Level { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        // Now these will work because the classes are defined in other files
        public CategoryDTO Category { get; set; }
        public InstructorDTO Instructor { get; set; }
    }

    public class CourseCreateDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string ThumbnailUrl { get; set; }
        public string PreviewVideoUrl { get; set; }
        public int? InstructorId { get; set; }
        public int? CategoryId { get; set; }
        public string Language { get; set; }
        public string Duration { get; set; }
        public string Level { get; set; }
        public string Status { get; set; }
    }

    public class CourseUpdateDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string ThumbnailUrl { get; set; }
        public string PreviewVideoUrl { get; set; }
        public int? InstructorId { get; set; }
        public int? CategoryId { get; set; }
        public string Language { get; set; }
        public string Duration { get; set; }
        public string Level { get; set; }
        public string Status { get; set; }
    }
}
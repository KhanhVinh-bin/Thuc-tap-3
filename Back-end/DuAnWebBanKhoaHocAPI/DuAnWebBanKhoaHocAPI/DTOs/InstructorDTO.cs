namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class InstructorDTO
    {
        public int InstructorId { get; set; }
        public string? FullName { get; set; }
        public string Expertise { get; set; }
        public string Biography { get; set; }
        public int? ExperienceYears { get; set; }
        public string Education { get; set; }
        public decimal? RatingAverage { get; set; }
        public int TotalStudents { get; set; }
        public int TotalCourses { get; set; }
        public string VerificationStatus { get; set; }
        public string LinkedInUrl { get; set; }
        public string FacebookUrl { get; set; }
        public string YouTubeUrl { get; set; }
        public string XUrl { get; set; }
    }

    public class InstructorCreateDTO
    {
        public int InstructorId { get; set; } // This should be the same as UserId
        public string Expertise { get; set; }
        public string Biography { get; set; }
        public int? ExperienceYears { get; set; }
        public string Education { get; set; }
        public string LinkedInUrl { get; set; }
        public string FacebookUrl { get; set; }
        public string YouTubeUrl { get; set; }
        public string XUrl { get; set; }
    }
}
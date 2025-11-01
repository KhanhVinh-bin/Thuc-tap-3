namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class InstructorReviewDTO
    {
        public int ReviewId { get; set; }
        public string StudentName { get; set; }
        public string CourseTitle { get; set; }
        public int Rating { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Comment { get; set; }
    }
}

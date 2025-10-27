namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class StudentFilterQuery : RequestQueryPage 
    {
        public DateTime? EnrollDate { get; set; }
        public string? Status { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Title { get; set; }   // Course title
        public bool? IsCompleted { get; set; } // true/false
    }
}

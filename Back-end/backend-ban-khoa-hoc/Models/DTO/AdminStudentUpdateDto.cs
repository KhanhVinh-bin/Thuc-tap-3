namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class AdminStudentUpdateDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }        
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Gender { get; set; }
        public string? Bio { get; set; }
        public string? Status { get; set; } // active/locked/deleted
    }
}
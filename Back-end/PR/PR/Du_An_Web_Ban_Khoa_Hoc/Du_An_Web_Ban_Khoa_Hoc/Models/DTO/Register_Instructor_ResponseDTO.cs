namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class Register_Instructor_ResponseDTO
    {
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Role { get; set; } = "Instructor";
        public string Expertise { get; set; } = null!;
        public int ExperienceYears { get; set; }
        public string Biography { get; set; } = null!;
    }
}

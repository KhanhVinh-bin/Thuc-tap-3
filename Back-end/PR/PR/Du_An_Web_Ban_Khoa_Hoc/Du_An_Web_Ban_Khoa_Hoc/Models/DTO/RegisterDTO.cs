namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class RegisterDTO
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string ConfirmPassword { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public bool AcceptTerms { get; set; }

        // Thông tin giảng viên
        public string Expertise { get; set; } = null!;
        public int ExperienceYears { get; set; }
        public string Biography { get; set; } = null!;
    }
}

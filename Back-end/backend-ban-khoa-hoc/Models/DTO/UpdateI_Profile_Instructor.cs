namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class UpdateI_Profile_Instructor
    {
            public string? Expertise { get; set; }
            public string? Biography { get; set; }
            public int? ExperienceYears { get; set; }
            public string? Education { get; set; }
            public string? Certifications { get; set; }

            public string? Email { get; set; }
            public string? FullName { get; set; }
            public string? PhoneNumber { get; set; }
            public string? Address { get; set; }
            public string? AvatarUrl { get; set; }
            public DateOnly? DateOfBirth { get; set; }
            public string? Gender { get; set; }
            public string? Bio { get; set; }

            // PasswordHash & Status không nên cho update trong API profile
            // Nếu cần đổi mật khẩu → tạo API riêng
        }
 }
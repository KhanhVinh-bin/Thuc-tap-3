using System.ComponentModel.DataAnnotations;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class RegisterDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string? Gender { get; set; }

        // Mặc định là student role
        public List<int> RoleIds { get; set; } = new List<int> { 1 }; // 1 = student
    }

    public class LoginDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponseDTO
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Token { get; set; } // Cho phép null
        public List<string> Roles { get; set; } = new List<string>();
        public DateTime ExpiresAt { get; set; }
    }

    public class ChangePasswordDTO
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
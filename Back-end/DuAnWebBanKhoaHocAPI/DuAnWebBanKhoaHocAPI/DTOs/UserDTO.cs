using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class UserDTO
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Bio { get; set; }
        public string Status { get; set; } = "active";
        public DateTime? CreatedAt { get; set; }

        public List<string> Roles { get; set; } = new List<string>();
    }

    public class UserCreateDTO
    {
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public List<int> RoleIds { get; set; } = new List<int>();
    }

    public class UserUpdateDTO
    {
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Bio { get; set; }
        public string Status { get; set; } = "active";
    }
}
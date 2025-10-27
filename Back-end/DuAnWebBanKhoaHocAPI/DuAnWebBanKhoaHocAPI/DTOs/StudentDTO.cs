using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class StudentDTO
    {
        public int StudentId { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string Bio { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Student specific properties
        public int EnrollmentCount { get; set; }
        public int CompletedCourses { get; set; }
        public int TotalCertificates { get; set; }
        public DateTime? LastActive { get; set; }

        public List<string> Roles { get; set; } = new List<string>();
    }

    public class StudentCreateDTO
    {
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string Bio { get; set; }
    }

    public class StudentUpdateDTO
    {
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string Bio { get; set; }
        public string Status { get; set; }

        // Student specific properties
        public int EnrollmentCount { get; set; }
        public int CompletedCourses { get; set; }
        public int TotalCertificates { get; set; }
        public DateTime? LastActive { get; set; }
    }

    public class StudentStatsDTO
    {
        public int StudentId { get; set; }
        public string FullName { get; set; }
        public int EnrollmentCount { get; set; }
        public int CompletedCourses { get; set; }
        public int TotalCertificates { get; set; }
        public DateTime? LastActive { get; set; }
        public decimal? AverageRating { get; set; }
    }
}
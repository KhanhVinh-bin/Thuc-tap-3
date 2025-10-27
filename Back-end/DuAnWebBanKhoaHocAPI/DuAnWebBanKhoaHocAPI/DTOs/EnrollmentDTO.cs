using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class EnrollmentDTO
    {
        public int EnrollmentId { get; set; }
        public int CourseId { get; set; }
        public int UserId { get; set; }
        public DateTime? EnrollDate { get; set; }
        public string Status { get; set; }

        // Navigation properties
        public CourseSimpleDTO Course { get; set; }
        public UserSimpleDTO User { get; set; }

        // Progress information
        public int CompletedLessons { get; set; }
        public int TotalLessons { get; set; }
        public decimal ProgressPercentage => TotalLessons > 0 ? (decimal)CompletedLessons / TotalLessons * 100 : 0;
        public DateTime? LastActivity { get; set; }
    }

    public class EnrollmentCreateDTO
    {
        public int CourseId { get; set; }
        public int UserId { get; set; }
        public string Status { get; set; } = "active";
    }

    public class EnrollmentUpdateDTO
    {
        public string Status { get; set; }
    }

    public class EnrollmentProgressDTO
    {
        public int EnrollmentId { get; set; }
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public int CompletedLessons { get; set; }
        public int TotalLessons { get; set; }
        public decimal ProgressPercentage { get; set; }
        public DateTime? LastActivity { get; set; }
        public List<LessonProgressDTO> Lessons { get; set; } = new List<LessonProgressDTO>();
    }

    public class LessonProgressDTO
    {
        public int LessonId { get; set; }
        public string Title { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int SortOrder { get; set; }
    }

   
}
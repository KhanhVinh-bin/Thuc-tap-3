using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class ProgressDTO
    {
        public int ProgressId { get; set; }
        public int EnrollmentId { get; set; }
        public int LessonId { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }

        // SỬ DỤNG CÁC DTO ĐÃ CÓ - ĐÚNG
        public EnrollmentDTO Enrollment { get; set; }
        public LessonDTO Lesson { get; set; }
    }

    public class ProgressCreateDTO
    {
        public int EnrollmentId { get; set; }
        public int LessonId { get; set; }
        public bool IsCompleted { get; set; } = true;
    }

    public class ProgressUpdateDTO
    {
        public bool IsCompleted { get; set; }
    }

    public class ProgressBulkCreateDTO
    {
        public int EnrollmentId { get; set; }
        public List<int> LessonIds { get; set; } = new List<int>();
        public bool IsCompleted { get; set; } = true;
    }

    public class StudentProgressSummaryDTO
    {
        public int StudentId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public int TotalEnrollments { get; set; }
        public int TotalLessons { get; set; }
        public int CompletedLessons { get; set; }
        public decimal OverallProgressPercentage { get; set; }
        public DateTime? LastActivity { get; set; }
        public List<CourseProgressDTO> CourseProgress { get; set; } = new List<CourseProgressDTO>();
    }

    public class CourseProgressDTO
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public int EnrollmentId { get; set; }
        public int TotalLessons { get; set; }
        public int CompletedLessons { get; set; }
        public decimal ProgressPercentage { get; set; }
        public DateTime? LastActivity { get; set; }
        public DateTime? EnrollmentDate { get; set; }
    }

    // THÊM CÁC SIMPLE DTOs NẾU CẦN
    public class EnrollmentSimpleDTO
    {
        public int EnrollmentId { get; set; }
        public int CourseId { get; set; }
        public int UserId { get; set; }
        public DateTime? EnrollDate { get; set; }
        public string Status { get; set; }
    }

    public class LessonSimpleDTO
    {
        public int LessonId { get; set; }
        public string Title { get; set; }
        public string ContentType { get; set; }
        public int SortOrder { get; set; }
    }
}
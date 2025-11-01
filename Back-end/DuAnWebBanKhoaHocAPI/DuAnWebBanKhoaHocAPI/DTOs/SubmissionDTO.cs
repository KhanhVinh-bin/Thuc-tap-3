using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class SubmissionDTO
    {
        public int SubmissionId { get; set; }
        public int AssignmentId { get; set; }
        public int UserId { get; set; }
        public string Answer { get; set; }
        public int? FileId { get; set; }
        public decimal? Score { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime? GradedAt { get; set; }
        public int? GradedBy { get; set; }

        // Navigation properties
        public AssignmentDTO Assignment { get; set; }
        public UserSimpleDTO User { get; set; }
        // ĐÃ XOÁ: public UserSimpleDTO Grader { get; set; }
        public FileSimpleDTO File { get; set; }
    }

    public class SubmissionCreateDTO
    {
        public int AssignmentId { get; set; }
        public int UserId { get; set; }
        public string Answer { get; set; }
        public int? FileId { get; set; }
    }

    public class SubmissionUpdateDTO
    {
        public string Answer { get; set; }
        public int? FileId { get; set; }
    }

    public class GradeSubmissionDTO
    {
        public decimal Score { get; set; }
        public int GradedBy { get; set; }
        public string Feedback { get; set; }
    }

    public class SubmissionStatsDTO
    {
        public int AssignmentId { get; set; }
        public string AssignmentTitle { get; set; }
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public int TotalSubmissions { get; set; }
        public int TotalStudents { get; set; }
        public int GradedSubmissions { get; set; }
        public int UngradedSubmissions { get; set; }
        public double? AverageScore { get; set; }
        public double? MaxScore { get; set; }
        public double? MinScore { get; set; }
        public decimal CompletionRate { get; set; }
    }

    public class StudentSubmissionDTO
    {
        public int SubmissionId { get; set; }
        public int AssignmentId { get; set; }
        public string AssignmentTitle { get; set; }
        public string Answer { get; set; }
        public int? FileId { get; set; }
        public decimal? Score { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime? GradedAt { get; set; }
        public int? GradedBy { get; set; }
        // ĐÃ XOÁ: public string GraderName { get; set; }
        public decimal MaxScore { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsLate { get; set; }
        public string Status { get; set; } // "not_submitted", "submitted", "graded", "late"
    }
}
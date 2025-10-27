using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class AssignmentDTO
    {
        public int AssignmentId { get; set; }
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public decimal MaxScore { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Navigation properties
        public CourseSimpleDTO Course { get; set; }
        public List<QuestionDTO> Questions { get; set; } = new List<QuestionDTO>();
        public int SubmissionCount { get; set; }
        public double? AverageScore { get; set; }
    }

    public class AssignmentCreateDTO
    {
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public decimal MaxScore { get; set; }
    }

    public class AssignmentUpdateDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public decimal MaxScore { get; set; }
    }

    public class QuestionDTO
    {
        public int QuestionId { get; set; }
        public int AssignmentId { get; set; }
        public string QuestionText { get; set; }
        public string QuestionType { get; set; }
        public string Options { get; set; } // JSON string for multiple choice
        public string CorrectAnswer { get; set; }
        public decimal? Points { get; set; }
    }

    public class QuestionCreateDTO
    {
        public string QuestionText { get; set; }
        public string QuestionType { get; set; }
        public string Options { get; set; }
        public string CorrectAnswer { get; set; }
        public decimal? Points { get; set; }
    }

    public class QuestionUpdateDTO
    {
        public string QuestionText { get; set; }
        public string QuestionType { get; set; }
        public string Options { get; set; }
        public string CorrectAnswer { get; set; }
        public decimal? Points { get; set; }
    }

    public class AssignmentStatsDTO
    {
        public int AssignmentId { get; set; }
        public string Title { get; set; }
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public int TotalSubmissions { get; set; }
        public int TotalStudents { get; set; }
        public double? AverageScore { get; set; }
        public double? CompletionRate { get; set; }
        public DateTime? DueDate { get; set; }
        public int SubmittedCount { get; set; }
        public int GradedCount { get; set; }
    }
}
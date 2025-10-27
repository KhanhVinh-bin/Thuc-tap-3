using System;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class FeedbackDTO
    {
        public int FeedbackId { get; set; }
        public int? UserId { get; set; }
        public string Content { get; set; }
        public byte? Rating { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public UserSimpleDTO User { get; set; }
    }

    public class FeedbackCreateDTO
    {
        public int? UserId { get; set; }
        public string Content { get; set; }
        public byte? Rating { get; set; }
    }

    public class FeedbackUpdateDTO
    {
        public string Content { get; set; }
        public byte? Rating { get; set; }
    }

    public class FeedbackStatsDTO
    {
        public int TotalFeedbacks { get; set; }
        public int TotalWithRating { get; set; }
        public int TotalWithoutRating { get; set; }
        public double AverageRating { get; set; }
        public int FiveStar { get; set; }
        public int FourStar { get; set; }
        public int ThreeStar { get; set; }
        public int TwoStar { get; set; }
        public int OneStar { get; set; }
    }
}
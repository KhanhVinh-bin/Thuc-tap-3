using System;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class ReviewDTO
    {
        public int ReviewId { get; set; }
        public int CourseId { get; set; }
        public int UserId { get; set; }
        public byte Rating { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public CourseSimpleDTO Course { get; set; }
        public UserSimpleDTO User { get; set; }
    }

    public class ReviewCreateDTO
    {
        public int CourseId { get; set; }
        public int UserId { get; set; }
        public byte Rating { get; set; }
        public string Comment { get; set; }
    }

    public class ReviewUpdateDTO
    {
        public byte Rating { get; set; }
        public string Comment { get; set; }
    }

    public class ReviewStatsDTO
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
        public int FiveStar { get; set; }
        public int FourStar { get; set; }
        public int ThreeStar { get; set; }
        public int TwoStar { get; set; }
        public int OneStar { get; set; }
        public decimal RatingPercentage { get; set; }
    }

    public class CourseReviewsDTO
    {
        public CourseSimpleDTO Course { get; set; }
        public List<ReviewDTO> Reviews { get; set; }
        public ReviewStatsDTO Stats { get; set; }
    }



    
}
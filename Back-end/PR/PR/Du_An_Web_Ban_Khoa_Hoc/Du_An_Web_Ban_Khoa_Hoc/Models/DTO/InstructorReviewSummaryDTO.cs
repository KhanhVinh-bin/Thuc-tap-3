namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class InstructorReviewSummaryDTO
    {
        public int TotalReviews { get; set; }          // Tổng đánh giá
        public double AverageRating { get; set; }      // Điểm TB
        public int TotalReplied { get; set; }          // Số đã phản hồi
        public int TotalPending { get; set; }          // Số chờ phản hồi
    }
}

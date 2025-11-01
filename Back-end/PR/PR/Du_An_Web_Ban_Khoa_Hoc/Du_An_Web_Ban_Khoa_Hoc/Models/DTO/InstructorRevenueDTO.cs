namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class InstructorRevenueDTO
    {
        public decimal CurrentMonthRevenue { get; set; }
        public decimal PreviousMonthRevenue { get; set; }
        public decimal PercentChange { get; set; } // dương = tăng, âm = giảm
    }
}

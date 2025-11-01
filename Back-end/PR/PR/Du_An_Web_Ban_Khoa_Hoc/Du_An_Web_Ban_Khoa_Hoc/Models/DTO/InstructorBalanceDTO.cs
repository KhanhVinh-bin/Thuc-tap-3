namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class InstructorBalanceDTO
    {
        public decimal TotalEarnings { get; set; }    // Tổng doanh thu đã thanh toán
        public decimal PendingPayouts { get; set; }   // Các payout đang pending
        public decimal Withdrawn { get; set; }        // Các payout đã paid
        public decimal AvailableBalance { get; set; } // Số dư khả dụng
    }
}

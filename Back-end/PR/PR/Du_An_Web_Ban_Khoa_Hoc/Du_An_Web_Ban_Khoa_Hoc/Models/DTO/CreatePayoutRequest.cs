namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class CreatePayoutRequest
    {
        public decimal Amount { get; set; }           // Số tiền rút (có thể là 0 nếu chọn “rút tất cả”)
        public string Method { get; set; }            // Phương thức (VD: "bank", "momo")
        public string? Notes { get; set; }            // Ghi chú tùy chọn
    }
}

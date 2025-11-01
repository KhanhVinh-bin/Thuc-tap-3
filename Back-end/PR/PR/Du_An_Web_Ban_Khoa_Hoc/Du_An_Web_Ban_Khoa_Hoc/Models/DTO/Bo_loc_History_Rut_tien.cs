namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class Bo_loc_History_Rut_tien
    {
        public string? Status { get; set; } // pending, paid, rejected
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
    }
}

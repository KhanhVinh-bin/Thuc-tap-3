using System;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class PaymentDTO
    {
        public int PaymentId { get; set; }
        public int? OrderId { get; set; }
        public string PaymentMethod { get; set; }
        public string TransactionId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; }
        public DateTime? PaidAt { get; set; }
        public string RawResponse { get; set; }
    }

    public class PaymentCreateDTO
    {
        public int? OrderId { get; set; }
        public string PaymentMethod { get; set; }
        public string TransactionId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; }
        public DateTime? PaidAt { get; set; }
        public string RawResponse { get; set; }
    }

    public class PaymentUpdateDTO
    {
        public string PaymentStatus { get; set; }
        public DateTime? PaidAt { get; set; }
        public string TransactionId { get; set; }
        public string RawResponse { get; set; }
    }

    public class PaymentStatsDTO
    {
        public int TotalPayments { get; set; }
        public decimal TotalAmount { get; set; }
        public int SuccessfulPayments { get; set; }
        public int FailedPayments { get; set; }
        public int PendingPayments { get; set; }
        public decimal SuccessRate { get; set; }
    }
}
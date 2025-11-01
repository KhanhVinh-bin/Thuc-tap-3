using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class OrderDTO
    {
        public int OrderId { get; set; }
        public int? UserId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }

        // Navigation properties
        public UserSimpleDTO User { get; set; }
        public List<OrderDetailDTO> OrderDetails { get; set; } = new List<OrderDetailDTO>();
        public List<PaymentDTO> Payments { get; set; } = new List<PaymentDTO>();
    }

    public class OrderCreateDTO
    {
        public int? UserId { get; set; }
        public string Notes { get; set; }
        public List<OrderDetailCreateDTO> OrderDetails { get; set; } = new List<OrderDetailCreateDTO>();
    }

    public class OrderUpdateDTO
    {
        public string Status { get; set; }
        public string Notes { get; set; }
    }

    public class OrderDetailDTO
    {
        public int OrderDetailId { get; set; }
        public int OrderId { get; set; }
        public int CourseId { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }

        // Navigation properties
        public CourseSimpleDTO Course { get; set; }
        public decimal ItemTotal => Price * Quantity;
    }

    public class OrderDetailCreateDTO
    {
        public int OrderId { get; set; }
        public int CourseId { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; } = 1;
    }

   

    public class OrderStatsDTO
    {
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public int PendingOrders { get; set; }
        public int PaidOrders { get; set; }
        public int CancelledOrders { get; set; }
        public int RefundedOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
    }

    public class CreateOrderFromCartDTO
    {
        public int UserId { get; set; }
        public string Notes { get; set; }
    }
}
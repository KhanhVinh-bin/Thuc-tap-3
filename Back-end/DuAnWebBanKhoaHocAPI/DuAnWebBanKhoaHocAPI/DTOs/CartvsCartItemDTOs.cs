using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class CartDTO
    {
        public int CartId { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<CartItemDTO> CartItems { get; set; } = new List<CartItemDTO>();
        public decimal TotalAmount { get; set; }
        public int TotalItems { get; set; }
    }

    public class CartItemDTO
    {
        public int CartItemId { get; set; }
        public int CartId { get; set; }
        public int CourseId { get; set; }
        public int Quantity { get; set; }
        public DateTime AddedAt { get; set; }
        public CourseSimpleDTO Course { get; set; }
        public decimal ItemTotal => Course?.Price * Quantity ?? 0;
    }

    public class CartCreateDTO
    {
        public int UserId { get; set; }
    }

    public class CartItemCreateDTO
    {
        public int CartId { get; set; }
        public int CourseId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class CartItemUpdateDTO
    {
        public int Quantity { get; set; }
    }

    public class AddToCartDTO
    {
        public int UserId { get; set; }
        public int CourseId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class CartSummaryDTO
    {
        public int CartId { get; set; }
        public int UserId { get; set; }
        public int TotalItems { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
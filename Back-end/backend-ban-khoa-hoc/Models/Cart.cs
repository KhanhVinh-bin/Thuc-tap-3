using System;
using System.Collections.Generic;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

public partial class Cart
{
    public int CartId { get; set; }

    public int UserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual User User { get; set; } = null!;
}

using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.Models;

public partial class CartItem
{
    public int CartItemId { get; set; }

    public int CartId { get; set; }

    public int CourseId { get; set; }

    public int Quantity { get; set; } = 1;

    public DateTime AddedAt { get; set; }

    public virtual Cart Cart { get; set; } = null!;

    public virtual Course Course { get; set; } = null!;
}

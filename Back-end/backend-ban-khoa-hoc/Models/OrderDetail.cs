using System;
using System.Collections.Generic;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

public partial class OrderDetail
{
    public int OrderDetailId { get; set; }

    public int OrderId { get; set; }

    public int CourseId { get; set; }

    public decimal Price { get; set; }

    public int Quantity { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;
}

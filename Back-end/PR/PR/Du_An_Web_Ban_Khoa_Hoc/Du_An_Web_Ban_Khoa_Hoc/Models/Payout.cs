using System;
using System.Collections.Generic;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

public partial class Payout
{
    public int PayoutId { get; set; }

    public int InstructorId { get; set; }

    public decimal Amount { get; set; }

    public DateTime RequestedAt { get; set; }

    public DateTime? ProcessedAt { get; set; }

    public string Status { get; set; } = null!;

    public decimal PlatformFee { get; set; }

    public decimal NetAmount { get; set; }

    public string? Notes { get; set; }

    public virtual Instructor Instructor { get; set; } = null!;
}

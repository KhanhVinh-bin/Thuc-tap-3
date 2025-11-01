using System;
using System.Collections.Generic;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

public partial class PaymentVerification
{
    public int VerificationId { get; set; }

    public int PaymentId { get; set; }

    public DateTime VerifiedAt { get; set; }

    public int? VerifiedBy { get; set; }

    public string Status { get; set; } = null!;

    public string? Notes { get; set; }

    public virtual Payment Payment { get; set; } = null!;

    public virtual User? VerifiedByNavigation { get; set; }
}

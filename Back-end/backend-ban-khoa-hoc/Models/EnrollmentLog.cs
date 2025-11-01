using System;
using System.Collections.Generic;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

public partial class EnrollmentLog
{
    public int EnrollmentLogId { get; set; }

    public int EnrollmentId { get; set; }

    public string Action { get; set; } = null!;

    public string? Details { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Enrollment Enrollment { get; set; } = null!;
}

using System;
using System.Collections.Generic;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

public partial class Report
{
    public int ReportId { get; set; }

    public string ReportType { get; set; } = null!;

    public int? GeneratedBy { get; set; }

    public string? ReportData { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User? GeneratedByNavigation { get; set; }
}

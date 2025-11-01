using System;
using System.Collections.Generic;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

public partial class Submission
{
    public int SubmissionId { get; set; }

    public int AssignmentId { get; set; }

    public int UserId { get; set; }

    public string? Answer { get; set; }

    public int? FileId { get; set; }

    public decimal? Score { get; set; }

    public DateTime SubmittedAt { get; set; }

    public DateTime? GradedAt { get; set; }

    public int? GradedBy { get; set; }

    public virtual Assignment Assignment { get; set; } = null!;

    public virtual File? File { get; set; }

    public virtual User User { get; set; } = null!;
}

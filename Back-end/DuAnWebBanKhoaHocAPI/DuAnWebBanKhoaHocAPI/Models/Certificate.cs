using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.Models;

public partial class Certificate
{
    public int CertificateId { get; set; }

    public int UserId { get; set; }

    public int CourseId { get; set; }

    public string? CertificateUrl { get; set; }

    public DateTime IssuedAt { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}

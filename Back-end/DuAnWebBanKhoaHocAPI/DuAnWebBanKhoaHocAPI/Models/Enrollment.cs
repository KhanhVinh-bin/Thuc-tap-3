using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.Models;

public partial class Enrollment
{
    public int EnrollmentId { get; set; }

    public int CourseId { get; set; }

    public int UserId { get; set; }

    public DateTime EnrollDate { get; set; }

    public string Status { get; set; } = null!;

    public virtual Course Course { get; set; } = null!;

    public virtual ICollection<EnrollmentLog> EnrollmentLogs { get; set; } = new List<EnrollmentLog>();

    public virtual ICollection<Progress> Progresses { get; set; } = new List<Progress>();

    public virtual User User { get; set; } = null!;
}

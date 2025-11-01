using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.Models;

public partial class Progress
{
    public int ProgressId { get; set; }

    public int EnrollmentId { get; set; }

    public int LessonId { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime? CompletedAt { get; set; }

    public virtual Enrollment Enrollment { get; set; } = null!;

    public virtual Lesson Lesson { get; set; } = null!;
}

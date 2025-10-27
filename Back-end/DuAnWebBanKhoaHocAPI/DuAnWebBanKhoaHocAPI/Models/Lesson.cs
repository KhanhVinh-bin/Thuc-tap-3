using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.Models;

public partial class Lesson
{
    public int LessonId { get; set; }

    public int? CourseId { get; set; }

    public string Title { get; set; } = null!;

    public string ContentType { get; set; } = null!;

    public string? VideoUrl { get; set; }

    public int? FileId { get; set; }

    public int? DurationSec { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Course? Course { get; set; }

    public virtual File? File { get; set; }

    public virtual ICollection<Progress> Progresses { get; set; } = new List<Progress>();
}

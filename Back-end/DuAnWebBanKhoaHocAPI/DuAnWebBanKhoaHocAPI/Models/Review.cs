using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.Models;

public partial class Review
{
    public int ReviewId { get; set; }

    public int CourseId { get; set; }

    public int UserId { get; set; }

    public byte Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}

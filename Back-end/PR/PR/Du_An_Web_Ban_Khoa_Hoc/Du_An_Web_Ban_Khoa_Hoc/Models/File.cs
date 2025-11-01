using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

[Table("Files")]
public partial class File
{
    public int FileId { get; set; }

    public int? CourseId { get; set; }

    public string Name { get; set; } = null!;

    public string FilePath { get; set; } = null!;

    public string? FileType { get; set; }

    public long? FileSizeBigint { get; set; }

    public int? UploadedBy { get; set; }

    public DateTime UploadedAt { get; set; }

    public virtual Course? Course { get; set; }

    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();

    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();

    public virtual User? UploadedByNavigation { get; set; }
}

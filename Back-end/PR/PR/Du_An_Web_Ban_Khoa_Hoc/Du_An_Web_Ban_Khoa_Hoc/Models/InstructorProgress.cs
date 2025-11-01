using System;
using System.Collections.Generic;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

public partial class InstructorProgress
{
    public int InstructorProgressId { get; set; }

    public int InstructorId { get; set; }

    public int CourseId { get; set; }

    public int StudentCompleted { get; set; }

    public int TotalStudents { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual Instructor Instructor { get; set; } = null!;
}

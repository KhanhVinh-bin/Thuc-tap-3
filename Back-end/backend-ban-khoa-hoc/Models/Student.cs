using System;
using System.Collections.Generic;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

public partial class Student
{
    public int StudentId { get; set; }

    public int EnrollmentCount { get; set; }

    public int CompletedCourses { get; set; }

    public int TotalCertificates { get; set; }

    public DateTime? LastActive { get; set; }

    public virtual User StudentNavigation { get; set; } = null!;
}

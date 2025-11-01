using System;
using System.Collections.Generic;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

public partial class Tag
{
    public int TagId { get; set; }

    public string TagName { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
}

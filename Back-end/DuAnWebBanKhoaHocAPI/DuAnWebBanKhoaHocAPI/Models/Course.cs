using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.Models;

public partial class Course
{
    public int CourseId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? ThumbnailUrl { get; set; }

    public string? PreviewVideoUrl { get; set; }

    public int? InstructorId { get; set; }

    public int? CategoryId { get; set; }

    public string Language { get; set; } = null!;

    public string? Duration { get; set; }

    public string Level { get; set; } = null!;

    public string? Prerequisites { get; set; }

    public string? LearningOutcomes { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual Category? Category { get; set; }

    public virtual ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual ICollection<File> Files { get; set; } = new List<File>();

    public virtual Instructor? Instructor { get; set; }

    public virtual ICollection<InstructorProgress> InstructorProgresses { get; set; } = new List<InstructorProgress>();

    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();

    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();
}

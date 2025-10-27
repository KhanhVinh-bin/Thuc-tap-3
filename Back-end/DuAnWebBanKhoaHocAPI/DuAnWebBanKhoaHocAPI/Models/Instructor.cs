using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.Models;

public partial class Instructor
{
    public int InstructorId { get; set; }

    public string? Expertise { get; set; }

    public string? Biography { get; set; }

    public int? ExperienceYears { get; set; }

    public string? Education { get; set; }

    public string? Certifications { get; set; }

    public decimal? RatingAverage { get; set; }

    public int TotalStudents { get; set; }

    public int TotalCourses { get; set; }

    public decimal Earnings { get; set; }

    public string? PayoutMethod { get; set; }

    public string? PayoutAccount { get; set; }

    public string VerificationStatus { get; set; } = null!;

    public DateTime? LastPayoutDate { get; set; }

    public string? LinkedInUrl { get; set; }

    public string? FacebookUrl { get; set; }

    public string? YouTubeUrl { get; set; }

    public string? Xurl { get; set; }

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public virtual User InstructorNavigation { get; set; } = null!;

    public virtual ICollection<InstructorProgress> InstructorProgresses { get; set; } = new List<InstructorProgress>();

    public virtual ICollection<Payout> Payouts { get; set; } = new List<Payout>();

    public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
}

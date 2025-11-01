using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.Models;

public partial class Schedule
{
    public int ScheduleId { get; set; }

    public int? CourseId { get; set; }

    public int? InstructorId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public string? Type { get; set; }

    public string? MeetingLink { get; set; }

    public virtual Course? Course { get; set; }

    public virtual Instructor? Instructor { get; set; }
}

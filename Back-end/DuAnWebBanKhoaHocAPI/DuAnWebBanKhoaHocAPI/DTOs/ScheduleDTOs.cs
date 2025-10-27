using System;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class ScheduleDTO
    {
        public int ScheduleId { get; set; }
        public int? CourseId { get; set; }
        public int? InstructorId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string Type { get; set; }
        public string MeetingLink { get; set; }

        // Navigation properties
        public CourseSimpleDTO Course { get; set; }
        public UserSimpleDTO Instructor { get; set; }
    }

    public class ScheduleCreateDTO
    {
        public int? CourseId { get; set; }
        public int? InstructorId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string Type { get; set; }
        public string MeetingLink { get; set; }
    }

    public class ScheduleUpdateDTO
    {
        public int? CourseId { get; set; }
        public int? InstructorId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string Type { get; set; }
        public string MeetingLink { get; set; }
    }

    public class ScheduleStatsDTO
    {
        public int TotalSchedules { get; set; }
        public int UpcomingSchedules { get; set; }
        public int PastSchedules { get; set; }
        public int OnlineSchedules { get; set; }
        public int OfflineSchedules { get; set; }
    }

    public class InstructorScheduleDTO
    {
        public int InstructorId { get; set; }
        public string InstructorName { get; set; }
        public List<ScheduleDTO> Schedules { get; set; } = new List<ScheduleDTO>();
    }
}
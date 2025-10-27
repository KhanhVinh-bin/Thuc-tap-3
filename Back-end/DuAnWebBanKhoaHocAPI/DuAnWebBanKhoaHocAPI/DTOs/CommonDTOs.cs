using System;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class CourseSimpleDTO
    {
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; } // THÊM property này
        public string ThumbnailUrl { get; set; }
        public decimal Price { get; set; }
        public int? InstructorId { get; set; }
        public string InstructorName { get; set; }
    }

    public class UserSimpleDTO
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string AvatarUrl { get; set; }
    }

    public class FileSimpleDTO
    {
        public int FileId { get; set; }
        public string Name { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public long? FileSizeBigint { get; set; }
    }
}
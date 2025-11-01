using System;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class CertificateDTO
    {
        public int CertificateId { get; set; }
        public int UserId { get; set; }
        public int CourseId { get; set; }
        public string CertificateUrl { get; set; }
        public DateTime? IssuedAt { get; set; }

        // Navigation properties
        public UserSimpleDTO User { get; set; }
        public CourseSimpleDTO Course { get; set; }
    }

    public class CertificateCreateDTO
    {
        public int UserId { get; set; }
        public int CourseId { get; set; }
        public string CertificateUrl { get; set; }
    }

    public class CertificateUpdateDTO
    {
        public string CertificateUrl { get; set; }
    }

    public class CertificateGenerateDTO
    {
        public int UserId { get; set; }
        public int CourseId { get; set; }
        public string TemplateName { get; set; } = "default";
    }

    public class CertificateStatsDTO
    {
        public int TotalCertificates { get; set; }
        public int CertificatesThisMonth { get; set; }
        public int CertificatesThisYear { get; set; }
        public List<CourseCertificateCountDTO> TopCourses { get; set; } = new List<CourseCertificateCountDTO>();
    }

    public class CourseCertificateCountDTO
    {
        public int CourseId { get; set; }
        public string CourseTitle { get; set; }
        public int CertificateCount { get; set; }
    }

    public class StudentCertificateSummaryDTO
    {
        public int StudentId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public int TotalCertificates { get; set; }
        public DateTime? FirstCertificateDate { get; set; }
        public DateTime? LastCertificateDate { get; set; }
        public List<CertificateDTO> Certificates { get; set; } = new List<CertificateDTO>();
    }
}
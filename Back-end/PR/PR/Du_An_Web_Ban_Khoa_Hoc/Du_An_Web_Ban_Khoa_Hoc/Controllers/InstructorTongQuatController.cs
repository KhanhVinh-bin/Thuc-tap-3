using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;
using Microsoft.AspNetCore.Authorization;
using Azure.Core;
using NuGet.Common;
using Microsoft.CodeAnalysis.Elfie.Serialization;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Hosting;
using Du_An_Web_Ban_Khoa_Hoc.Models.DTO;
using System.Security.Claims;


namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [Authorize(Roles = "instructor")]
    [Route("api/[Controller]")]
    [ApiController]
    public class InstructorTongQuatController : Controller
    {

        private readonly AppDbContext _context;

        public InstructorTongQuatController(AppDbContext context)
        {
            _context = context;
        }


        // Get: Tổng doanh thu tháng này + so với tháng trước (%)
        //Tổng doanh thu tháng hiện tại
        //Số tiền doanh thu tăng(hoặc giảm) so với tháng trước
        [Authorize]
        [HttpGet("Get/monthly-revenue")]
        public async Task<IActionResult> GetMonthlyRevenue()
        {
            // 🔹 Lấy InstructorID từ token
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var instructorId))
                return Unauthorized("Token không hợp lệ");

            // 🔹 Xác định mốc thời gian tháng hiện tại và tháng trước
            var currentMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var nextMonthStart = currentMonthStart.AddMonths(1);
            var lastMonthStart = currentMonthStart.AddMonths(-1);

            // 🔹 Lấy dữ liệu doanh thu
            var revenueData = await _context.OrderDetails
                .Where(od => od.Course.InstructorId == instructorId &&
                             od.Order.Payments.Any(p => p.PaymentStatus == "success"))
                .Select(od => new
                {
                    od.Price,
                    od.Quantity,
                    OrderDate = od.Order.OrderDate
                })
                .ToListAsync();

            // 🔹 Tính doanh thu tháng hiện tại
            var currentMonthRevenue = revenueData
                .Where(r => r.OrderDate >= currentMonthStart && r.OrderDate < nextMonthStart)
                .Sum(r => r.Price * r.Quantity);

            // 🔹 Tính doanh thu tháng trước
            var lastMonthRevenue = revenueData
                .Where(r => r.OrderDate >= lastMonthStart && r.OrderDate < currentMonthStart)
                .Sum(r => r.Price * r.Quantity);

            // 🔹 Tính chênh lệch (số tiền tăng/giảm)
            var difference = currentMonthRevenue - lastMonthRevenue;

            return Ok(new
            {
                CurrentMonthRevenue = Math.Round(currentMonthRevenue, 0),  // Tổng doanh thu tháng này
                RevenueDifference = Math.Round(difference, 0),             // Doanh thu tăng hoặc giảm so với tháng trước (đơn vị: tiền)
            });
        }



        //Get: Tổng số khóa học và thay đổi theo tháng
        [Authorize]
        [HttpGet("total-courses")]
        public async Task<IActionResult> GetTotalCourses()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var instructorId))
                return Unauthorized("Token không hợp lệ");

            var currentMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var lastMonthStart = currentMonthStart.AddMonths(-1);

            var totalCourses = await _context.Courses.CountAsync(c => c.InstructorId == instructorId);

            var currentMonthCourses = await _context.Courses
                .CountAsync(c => c.InstructorId == instructorId && c.CreatedAt >= currentMonthStart);

            var lastMonthCourses = await _context.Courses
                .CountAsync(c => c.InstructorId == instructorId && c.CreatedAt >= lastMonthStart && c.CreatedAt < currentMonthStart);

            var percentChange = lastMonthCourses == 0 ? 100 :
                ((float)(currentMonthCourses - lastMonthCourses) / lastMonthCourses) * 100;

            return Ok(new
            {
                TotalCourses = totalCourses,
                PercentChange = Math.Round(percentChange, 2)
            });
        }


        //Get: Tổng học viên và so sánh tháng trước
        [Authorize]
        [HttpGet("total-students")]
        public async Task<IActionResult> GetTotalStudents()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var instructorId))
                return Unauthorized("Token không hợp lệ");

            var currentMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var lastMonthStart = currentMonthStart.AddMonths(-1);

            var enrollments = _context.Enrollments
                .Include(e => e.Course)
                .Where(e => e.Course.InstructorId == instructorId);

            var totalStudents = await enrollments.CountAsync();
            var currentMonthStudents = await enrollments.CountAsync(e => e.EnrollDate >= currentMonthStart);
            var lastMonthStudents = await enrollments.CountAsync(e => e.EnrollDate >= lastMonthStart && e.EnrollDate < currentMonthStart);

            var percentChange = lastMonthStudents == 0 ? 100 :
                ((float)(currentMonthStudents - lastMonthStudents) / lastMonthStudents) * 100;

            return Ok(new
            {
                TotalStudents = totalStudents,
                PercentChange = Math.Round(percentChange, 2)
            });
        }

        //Get: Tỉ lệ hoàn thành khóa học
        //Tính tỷ lệ hoàn thành khóa học trung bình trong tháng này
        // So sánh với tháng trước
        [Authorize]
        [HttpGet("completion-rate")]
        public async Task<IActionResult> GetCompletionRate()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var instructorId))
                return Unauthorized("Token không hợp lệ");

            var now = DateTime.UtcNow;
            var startOfCurrentMonth = new DateTime(now.Year, now.Month, 1);
            var startOfLastMonth = startOfCurrentMonth.AddMonths(-1);
            var endOfLastMonth = startOfCurrentMonth.AddDays(-1);

            // 🔹 Lấy tiến độ tháng này (chỉ lấy của khóa học do giảng viên tạo)
            var currentMonthProgress = await _context.Progresses
                .Include(p => p.Enrollment)
                    .ThenInclude(e => e.Course)
                .Where(p => p.Enrollment.Course.InstructorId == instructorId &&
                            p.Enrollment.EnrollDate >= startOfCurrentMonth &&
                            p.Enrollment.EnrollDate <= now)
                .ToListAsync();

            // 🔹 Lấy tiến độ tháng trước
            var lastMonthProgress = await _context.Progresses
                .Include(p => p.Enrollment)
                    .ThenInclude(e => e.Course)
                .Where(p => p.Enrollment.Course.InstructorId == instructorId &&
                            p.Enrollment.EnrollDate >= startOfLastMonth &&
                            p.Enrollment.EnrollDate <= endOfLastMonth)
                .ToListAsync();

            // 🔸 Tính số học viên và mức độ hoàn thành tháng này
            var totalCurrentStudents = currentMonthProgress
                .Select(p => p.Enrollment.UserId)
                .Distinct()
                .Count();

            // Đếm số học viên đã hoàn thành toàn bộ bài học trong khóa học
            var completedCurrent = currentMonthProgress
                .GroupBy(p => p.EnrollmentId)
                .Count(g => g.All(x => x.IsCompleted));

            float currentRate = totalCurrentStudents == 0 ? 0 :
                ((float)completedCurrent / totalCurrentStudents) * 100;

            // 🔸 Tính số học viên và mức độ hoàn thành tháng trước
            var totalLastStudents = lastMonthProgress
                .Select(p => p.Enrollment.UserId)
                .Distinct()
                .Count();

            var completedLast = lastMonthProgress
                .GroupBy(p => p.EnrollmentId)
                .Count(g => g.All(x => x.IsCompleted));

            float lastRate = totalLastStudents == 0 ? 0 :
                ((float)completedLast / totalLastStudents) * 100;

            // 🔹 So sánh hai kỳ
            float difference = currentRate - lastRate;
            float percentChange = lastRate == 0 ? 0 : (difference / lastRate) * 100;

            return Ok(new
            {
                CurrentRate = Math.Round(currentRate, 2),
                LastRate = Math.Round(lastRate, 2),
                Difference = Math.Round(difference, 2),
                PercentChange = Math.Round(percentChange, 2)
            });
        }

        //Get: Khóa học gần đây
        [Authorize]
        [HttpGet("recent-courses")]
        public async Task<IActionResult> GetRecentCourses()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var instructorId))
                return Unauthorized("Token không hợp lệ");

            var recentCourses = await _context.Courses
                .Where(c => c.InstructorId == instructorId)
                .OrderByDescending(c => c.CreatedAt)
                .Take(3)
                .Select(c => new
                {
                    c.CourseId,
                    c.Title,
                    c.Status,
                    StudentCount = c.Enrollments.Count(),
                    c.CreatedAt
                })
                .ToListAsync();

            return Ok(recentCourses);
        }

        //Get: Hoạt động gần đây
        [Authorize]
        [HttpGet("recent-activities")]
        public async Task<IActionResult> GetRecentActivities()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var instructorId))
                return Unauthorized("Token không hợp lệ");

            var activities = new List<dynamic>();

            // 1️⃣ Học viên mới đăng ký
            var newEnrollments = await _context.Enrollments
                .Include(e => e.Course)
                .Where(e => e.Course.InstructorId == instructorId)
                .OrderByDescending(e => e.EnrollDate)
                .Take(5)
                .Select(e => new
                {
                    Type = "Enrollment",
                    Message = $"Học viên ID {e.UserId} đã đăng ký khóa {e.Course.Title}",
                    Date = e.EnrollDate
                })
                .ToListAsync();
            activities.AddRange(newEnrollments);

            // 2️⃣ Đánh giá mới nhận
            var newReviews = await _context.Reviews
                .Include(r => r.Course)
                .Where(r => r.Course.InstructorId == instructorId)
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .Select(r => new
                {
                    Type = "Review",
                    Message = $"Nhận được đánh giá {r.Rating}★ cho khóa {r.Course.Title}",
                    Date = r.CreatedAt
                })
                .ToListAsync();
            activities.AddRange(newReviews);

            // 3️⃣ Khóa học đang chờ duyệt hoặc bị trả về
            var pendingCourses = await _context.Courses
                .Where(c => c.InstructorId == instructorId &&
                            (c.Status == "Pending" || c.Status == "Rejected"))
                .OrderByDescending(c => c.UpdatedAt)
                .Take(3)
                .Select(c => new
                {
                    Type = "Course",
                    Message = $"Khóa học {c.Title} đang ở trạng thái: {c.Status}",
                    Date = c.UpdatedAt
                })
                .ToListAsync();
            activities.AddRange(pendingCourses);

            // Gộp và sắp xếp theo thời gian
            var recentActivities = activities
                .OrderByDescending(a => a.Date)
                .Take(8) // lấy tối đa 8 hoạt động gần đây nhất
                .ToList();

            return Ok(recentActivities);
        }

    }
}

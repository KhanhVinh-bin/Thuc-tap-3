using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Du_An_Web_Ban_Khoa_Hoc.Models;
using Du_An_Web_Ban_Khoa_Hoc.Models.Data;
using Humanizer;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using NuGet.Protocol.Plugins;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;
using System.Net;
using Du_An_Web_Ban_Khoa_Hoc.Models.DTO;
using System.Text.Json;

namespace Du_An_Web_Ban_Khoa_Hoc.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class InstructorsController : Controller
    {
        private readonly AppDbContext _context;

        public InstructorsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Instructors/{id}
        // Get: Lấy hồ sơ Giảng Viên bằng {id}
        [HttpGet("Instructor/{id}/Lay_ho_so_Giang_Vien_bang_Id")]
        public async Task<IActionResult> GetID(int id)
        {
            var profile = await _context.Instructors
                .Where(i => i.InstructorId == id)
            .Select(i => new
            {
                    i.InstructorId,
                    i.Expertise,
                    i.Biography,
                    i.ExperienceYears,
                    i.RatingAverage,     
                    i.Certifications,    
                    i.TotalStudents, 
                    i.TotalCourses, 


                    UserFullName = i.InstructorNavigation.FullName,
                    UserEmail = i.InstructorNavigation.Email,
                    UserAvatar = i.InstructorNavigation.AvatarUrl,
                    UserPhoneNumber = i.InstructorNavigation.PhoneNumber,
                    UserAddress = i.InstructorNavigation.Address,
            })
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (profile == null) return NotFound();
            return Ok(profile);
        }

        //Put: api/Instructor + User/All
        //Chỉnh sửa toàn bộ hồ sơ Giảng Viên 
        [HttpPut("api/Instructor/{id}/Chinh_sua_toan_bo_ho_sơ_Giang_Vien")]
        public async Task<IActionResult> PutALLProfileInstructors(int id, [FromBody] UpdateI_Profile_Instructor dto)
        {
            var inst = await _context.Instructors
                .Include(i => i.InstructorNavigation)
                .FirstOrDefaultAsync(i => i.InstructorId == id);

            if (inst == null) return NotFound();

            // update instructor fields
            inst.Expertise = dto.Expertise ?? inst.Expertise;
            inst.Biography = dto.Biography ?? inst.Biography;
            inst.ExperienceYears = dto.ExperienceYears ?? inst.ExperienceYears;
            inst.Education = dto.Education ?? inst.Education;
            inst.Certifications = dto.Certifications ?? inst.Certifications;

            // update user fields
            if (inst.InstructorNavigation != null)
            {
                inst.InstructorNavigation.FullName = dto.FullName ?? inst.InstructorNavigation.FullName;
                inst.InstructorNavigation.Email = dto.Email ?? inst.InstructorNavigation.Email;
                inst.InstructorNavigation.PhoneNumber = dto.PhoneNumber ?? inst.InstructorNavigation.PhoneNumber;
                inst.InstructorNavigation.Address = dto.Address ?? inst.InstructorNavigation.Address;
                inst.InstructorNavigation.AvatarUrl = dto.AvatarUrl ?? inst.InstructorNavigation.AvatarUrl;
                inst.InstructorNavigation.Bio = dto.Bio ?? inst.InstructorNavigation.Bio;
                inst.InstructorNavigation.Gender = dto.Gender ?? inst.InstructorNavigation.Gender;
                // DateOfBirth: cần check null vì DateOnly khác DateTime
                inst.InstructorNavigation.DateOfBirth = dto.DateOfBirth ?? inst.InstructorNavigation.DateOfBirth;

                // PasswordHash: thông thường không update chung với profile, 
                // mà nên có API riêng (ChangePassword) → tránh rủi ro bảo mật
            }

            await _context.SaveChangesAsync();
            return Ok(inst);
        }

        // Patch: Instructor{id}
        // Cho phép cập nhập 1 hoặc 1 vài thuộc tính 

        //Giữ dữ liệu cũ nếu client không gửi hoặc gửi giá trị mặc định ("string" cho string, 0 cho int, {0,0,0} cho DateOnly)
        //Không xóa dữ liệu cũ ( nếu string; 0; chuỗi thời gian 0-0-0 )
       // Trả về DTO gọn PatchInstructor để tránh vòng lặp JSON(return)
        
        [HttpPatch("api/instructor/{id}/Update_1_phan_Thong_Tin_Giang_Vien")]
        public async Task<IActionResult> PatchInstructor(int id, [FromBody] UpdateI_Profile_Instructor dto)
        {
            var inst = await _context.Instructors
                .Include(i => i.InstructorNavigation)
                .FirstOrDefaultAsync(i => i.InstructorId == id);

            if (inst == null) return NotFound();

            // --- Helper: update string/int/DateOnly chỉ khi thực sự khác null và không phải mặc định ---
            string? UpdateStringSafe(string? current, string? incoming)
                => !string.IsNullOrWhiteSpace(incoming) && incoming != "string" ? incoming : current;

            int? UpdateIntSafe(int? current, int? incoming)
                => incoming.HasValue && incoming.Value != 0 ? incoming : current;

            DateOnly? UpdateDateSafe(DateOnly? current, DateOnly? incoming)
                => incoming.HasValue && incoming.Value.Year != 0 ? incoming : current;

            // --- Update Instructor fields ---
            inst.Expertise = UpdateStringSafe(inst.Expertise, dto.Expertise);
            inst.Biography = UpdateStringSafe(inst.Biography, dto.Biography);
            inst.ExperienceYears = UpdateIntSafe(inst.ExperienceYears, dto.ExperienceYears);
            inst.Education = UpdateStringSafe(inst.Education, dto.Education);
            inst.Certifications = UpdateStringSafe(inst.Certifications, dto.Certifications);

            // --- Update User fields ---
            if (inst.InstructorNavigation != null)
            {
                var user = inst.InstructorNavigation;
                user.FullName = UpdateStringSafe(user.FullName, dto.FullName);
                user.Email = UpdateStringSafe(user.Email, dto.Email);
                user.PhoneNumber = UpdateStringSafe(user.PhoneNumber, dto.PhoneNumber);
                user.Address = UpdateStringSafe(user.Address, dto.Address);
                user.AvatarUrl = UpdateStringSafe(user.AvatarUrl, dto.AvatarUrl);
                user.Bio = UpdateStringSafe(user.Bio, dto.Bio);
                user.Gender = UpdateStringSafe(user.Gender, dto.Gender);
                user.DateOfBirth = UpdateDateSafe(user.DateOfBirth, dto.DateOfBirth);
            }

            await _context.SaveChangesAsync();

            // --- Trả về DTO gọn gàng ---
            return Ok(new PatchInstructor
            {
                Expertise = inst.Expertise,
                Biography = inst.Biography,
                ExperienceYears = inst.ExperienceYears,
                FullName = inst.InstructorNavigation?.FullName,
                Email = inst.InstructorNavigation?.Email,
                PhoneNumber = inst.InstructorNavigation?.PhoneNumber,
                Address = inst.InstructorNavigation?.Address,
                DateOfBirth = inst.InstructorNavigation?.DateOfBirth,
                AvatarUrl = inst.InstructorNavigation?.AvatarUrl,
                Gender = inst.InstructorNavigation?.Gender,
                Bio = inst.InstructorNavigation?.Bio
            });
        }

    }
}

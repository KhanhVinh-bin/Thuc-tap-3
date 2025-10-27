using DuAnWebBanKhoaHocAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public TestController(DuAnDbContext context)
        {
            _context = context;
        }

        [HttpGet("database")]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                var usersCount = await _context.Users.CountAsync();
                var coursesCount = await _context.Courses.CountAsync();

                return Ok(new
                {
                    DatabaseConnected = canConnect,
                    TotalUsers = usersCount,
                    TotalCourses = coursesCount,
                    Message = "Database connection successful"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    DatabaseConnected = false,
                    Error = ex.Message
                });
            }
        }
    }
}
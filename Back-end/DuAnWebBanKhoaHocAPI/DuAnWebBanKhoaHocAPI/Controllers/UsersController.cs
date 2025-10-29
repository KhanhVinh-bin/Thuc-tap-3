using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public UsersController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Select(u => new UserDTO
                {
                    UserId = u.UserId,
                    Email = u.Email ?? string.Empty,
                    FullName = u.FullName ?? string.Empty,
                    PhoneNumber = u.PhoneNumber,
                    Address = u.Address,
                    AvatarUrl = u.AvatarUrl,
                    DateOfBirth = u.DateOfBirth,
                    Gender = u.Gender,
                    Bio = u.Bio,
                    Status = u.Status ?? "active",
                    CreatedAt = u.CreatedAt,
                    Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Where(u => u.UserId == id)
                .Select(u => new UserDTO
                {
                    UserId = u.UserId,
                    Email = u.Email ?? string.Empty,
                    FullName = u.FullName ?? string.Empty,
                    PhoneNumber = u.PhoneNumber,
                    Address = u.Address,
                    AvatarUrl = u.AvatarUrl,
                    DateOfBirth = u.DateOfBirth,
                    Gender = u.Gender,
                    Bio = u.Bio,
                    Status = u.Status ?? "active",
                    CreatedAt = u.CreatedAt,
                    Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList()
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} not found" });
            }

            return user;
        }

        // POST: api/Users/Register
        [HttpPost("Register")]
        public async Task<ActionResult<UserDTO>> Register(RegisterDTO registerDTO)
        {
            // Validate input
            if (string.IsNullOrEmpty(registerDTO.Email))
            {
                return BadRequest(new { message = "Email is required" });
            }

            if (string.IsNullOrEmpty(registerDTO.Password))
            {
                return BadRequest(new { message = "Password is required" });
            }

            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == registerDTO.Email))
            {
                return Conflict(new { message = "Email already exists" });
            }

            // Hash password using BCrypt
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDTO.Password);

            var user = new User
            {
                Email = registerDTO.Email,
                PasswordHash = passwordHash,
                FullName = registerDTO.FullName,
                PhoneNumber = registerDTO.PhoneNumber,
                Address = registerDTO.Address,
                DateOfBirth = registerDTO.DateOfBirth,
                Gender = registerDTO.Gender,
                CreatedAt = DateTime.UtcNow,
                Status = "active"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Add user roles (default to student if not specified)
            var roleIds = registerDTO.RoleIds != null && registerDTO.RoleIds.Any()
                ? registerDTO.RoleIds
                : new List<int> { 1 }; // Default to student role

            foreach (var roleId in roleIds)
            {
                var roleExists = await _context.Roles.AnyAsync(r => r.RoleId == roleId);
                if (!roleExists)
                {
                    return BadRequest(new { message = $"Role with ID {roleId} not found" });
                }

                var userRole = new UserRole
                {
                    UserId = user.UserId,
                    RoleId = roleId,
                    AssignedAt = DateTime.UtcNow
                };
                _context.UserRoles.Add(userRole);
            }
            await _context.SaveChangesAsync();

            // Create student record if user has student role
            if (roleIds.Contains(1)) // 1 = student
            {
                var student = new Student
                {
                    StudentId = user.UserId,
                    EnrollmentCount = 0,
                    CompletedCourses = 0,
                    TotalCertificates = 0,
                    LastActive = DateTime.UtcNow
                };
                _context.Students.Add(student);
                await _context.SaveChangesAsync();
            }

            // Get the created user with roles to return
            var createdUser = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Where(u => u.UserId == user.UserId)
                .Select(u => new UserDTO
                {
                    UserId = u.UserId,
                    Email = u.Email ?? string.Empty,
                    FullName = u.FullName ?? string.Empty,
                    PhoneNumber = u.PhoneNumber,
                    Address = u.Address,
                    DateOfBirth = u.DateOfBirth,
                    Gender = u.Gender,
                    Status = u.Status ?? "active",
                    CreatedAt = u.CreatedAt,
                    Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList()
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction("GetUser", new { id = user.UserId }, createdUser);
        }

        // POST: api/Users/Login
        [HttpPost("Login")]
        public async Task<ActionResult<LoginResponseDTO>> Login(LoginDTO loginDTO)
        {
            if (string.IsNullOrEmpty(loginDTO.Email) || string.IsNullOrEmpty(loginDTO.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == loginDTO.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Verify password using BCrypt
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Check if user is active
            if (user.Status != "active")
            {
                return Unauthorized(new { message = "Account is not active. Please contact administrator." });
            }

            // Update last active for student
            var student = await _context.Students.FindAsync(user.UserId);
            if (student != null)
            {
                student.LastActive = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            // For now, return basic response. We'll add JWT token later
            var response = new LoginResponseDTO
            {
                UserId = user.UserId,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName ?? string.Empty,
                Roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList(),
                ExpiresAt = DateTime.UtcNow.AddHours(24) // 24 hours session
            };

            return Ok(response);
        }

        // POST: api/Users/5/ChangePassword
        [HttpPost("{id}/ChangePassword")]
        public async Task<IActionResult> ChangePassword(int id, ChangePasswordDTO changePasswordDTO)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} not found" });
            }

            // Verify current password using BCrypt
            bool isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(changePasswordDTO.CurrentPassword, user.PasswordHash);
            if (!isCurrentPasswordValid)
            {
                return BadRequest(new { message = "Current password is incorrect" });
            }

            // Hash new password using BCrypt
            string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDTO.NewPassword);
            user.PasswordHash = newPasswordHash;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
        }

        // POST: api/Users/CheckEmail
        [HttpPost("CheckEmail")]
        public async Task<ActionResult> CheckEmail([FromBody] string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { message = "Email is required" });
            }

            var emailExists = await _context.Users.AnyAsync(u => u.Email == email);

            return Ok(new { emailExists = emailExists });
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, UserUpdateDTO userUpdateDTO)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.FullName = userUpdateDTO.FullName;
            user.PhoneNumber = userUpdateDTO.PhoneNumber;
            user.Address = userUpdateDTO.Address;
            user.AvatarUrl = userUpdateDTO.AvatarUrl;
            user.DateOfBirth = userUpdateDTO.DateOfBirth;
            user.Gender = userUpdateDTO.Gender;
            user.Bio = userUpdateDTO.Bio;
            user.Status = userUpdateDTO.Status;
            user.UpdatedAt = DateTime.UtcNow;

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }
    }
}
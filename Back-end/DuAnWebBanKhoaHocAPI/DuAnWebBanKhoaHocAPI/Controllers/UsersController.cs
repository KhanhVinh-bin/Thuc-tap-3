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
                    Email = u.Email,
                    FullName = u.FullName,
                    PhoneNumber = u.PhoneNumber,
                    Address = u.Address,
                    AvatarUrl = u.AvatarUrl,
                    DateOfBirth = u.DateOfBirth, // Giờ kiểu dữ liệu khớp nhau
                    Gender = u.Gender,
                    Bio = u.Bio,
                    Status = u.Status,
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
                    Email = u.Email,
                    FullName = u.FullName,
                    PhoneNumber = u.PhoneNumber,
                    Address = u.Address,
                    AvatarUrl = u.AvatarUrl,
                    DateOfBirth = u.DateOfBirth, // Giờ kiểu dữ liệu khớp nhau
                    Gender = u.Gender,
                    Bio = u.Bio,
                    Status = u.Status,
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

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<UserDTO>> PostUser(UserCreateDTO userCreateDTO)
        {
            // Validate input
            if (string.IsNullOrEmpty(userCreateDTO.Email))
            {
                return BadRequest(new { message = "Email is required" });
            }

            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == userCreateDTO.Email))
            {
                return Conflict(new { message = "Email already exists" });
            }

            var user = new User
            {
                Email = userCreateDTO.Email,
                PasswordHash = userCreateDTO.PasswordHash,
                FullName = userCreateDTO.FullName,
                PhoneNumber = userCreateDTO.PhoneNumber,
                Address = userCreateDTO.Address,
                DateOfBirth = userCreateDTO.DateOfBirth, // DateOnly? khớp với model
                Gender = userCreateDTO.Gender,
                CreatedAt = DateTime.UtcNow,
                Status = "active"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Add user roles
            if (userCreateDTO.RoleIds != null && userCreateDTO.RoleIds.Any())
            {
                foreach (var roleId in userCreateDTO.RoleIds)
                {
                    var userRole = new UserRole
                    {
                        UserId = user.UserId,
                        RoleId = roleId,
                        AssignedAt = DateTime.UtcNow
                    };
                    _context.UserRoles.Add(userRole);
                }
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
                    Email = u.Email,
                    FullName = u.FullName,
                    PhoneNumber = u.PhoneNumber,
                    Address = u.Address,
                    DateOfBirth = u.DateOfBirth,
                    Gender = u.Gender,
                    Status = u.Status,
                    CreatedAt = u.CreatedAt,
                    Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList()
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction("GetUser", new { id = user.UserId }, createdUser);
        }

        // Các method PUT, DELETE giữ nguyên...
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
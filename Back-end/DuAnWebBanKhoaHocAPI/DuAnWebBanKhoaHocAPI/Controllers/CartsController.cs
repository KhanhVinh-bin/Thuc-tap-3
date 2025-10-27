using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartsController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public CartsController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Carts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CartDTO>>> GetCarts()
        {
            var carts = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Course)
                        .ThenInclude(co => co.Instructor)
                            .ThenInclude(i => i.InstructorNavigation)
                .Include(c => c.User)
                .Select(c => new CartDTO
                {
                    CartId = c.CartId,
                    UserId = c.UserId,
                    CreatedAt = c.CreatedAt,
                    CartItems = c.CartItems.Select(ci => new CartItemDTO
                    {
                        CartItemId = ci.CartItemId,
                        CartId = ci.CartId,
                        CourseId = ci.CourseId,
                        Quantity = ci.Quantity,
                        AddedAt = ci.AddedAt,
                        Course = new CourseSimpleDTO
                        {
                            CourseId = ci.Course.CourseId,
                            Title = ci.Course.Title,
                            ThumbnailUrl = ci.Course.ThumbnailUrl,
                            Price = ci.Course.Price,
                            InstructorId = ci.Course.InstructorId,
                            InstructorName = ci.Course.Instructor != null ?
                                ci.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                        }
                    }).ToList(),
                    TotalAmount = c.CartItems.Sum(ci => ci.Course.Price * ci.Quantity),
                    TotalItems = c.CartItems.Sum(ci => ci.Quantity)
                })
                .ToListAsync();

            return Ok(carts);
        }

        // GET: api/Carts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CartDTO>> GetCart(int id)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Course)
                        .ThenInclude(co => co.Instructor)
                            .ThenInclude(i => i.InstructorNavigation)
                .Include(c => c.User)
                .Where(c => c.CartId == id)
                .Select(c => new CartDTO
                {
                    CartId = c.CartId,
                    UserId = c.UserId,
                    CreatedAt = c.CreatedAt,
                    CartItems = c.CartItems.Select(ci => new CartItemDTO
                    {
                        CartItemId = ci.CartItemId,
                        CartId = ci.CartId,
                        CourseId = ci.CourseId,
                        Quantity = ci.Quantity,
                        AddedAt = ci.AddedAt,
                        Course = new CourseSimpleDTO
                        {
                            CourseId = ci.Course.CourseId,
                            Title = ci.Course.Title,
                            ThumbnailUrl = ci.Course.ThumbnailUrl,
                            Price = ci.Course.Price,
                            InstructorId = ci.Course.InstructorId,
                            InstructorName = ci.Course.Instructor != null ?
                                ci.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                        }
                    }).ToList(),
                    TotalAmount = c.CartItems.Sum(ci => ci.Course.Price * ci.Quantity),
                    TotalItems = c.CartItems.Sum(ci => ci.Quantity)
                })
                .FirstOrDefaultAsync();

            if (cart == null)
            {
                return NotFound(new { message = $"Cart with ID {id} not found" });
            }

            return cart;
        }

        // GET: api/Carts/ByUser/5
        [HttpGet("ByUser/{userId}")]
        public async Task<ActionResult<CartDTO>> GetCartByUser(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Course)
                        .ThenInclude(co => co.Instructor)
                            .ThenInclude(i => i.InstructorNavigation)
                .Include(c => c.User)
                .Where(c => c.UserId == userId)
                .Select(c => new CartDTO
                {
                    CartId = c.CartId,
                    UserId = c.UserId,
                    CreatedAt = c.CreatedAt,
                    CartItems = c.CartItems.Select(ci => new CartItemDTO
                    {
                        CartItemId = ci.CartItemId,
                        CartId = ci.CartId,
                        CourseId = ci.CourseId,
                        Quantity = ci.Quantity,
                        AddedAt = ci.AddedAt,
                        Course = new CourseSimpleDTO
                        {
                            CourseId = ci.Course.CourseId,
                            Title = ci.Course.Title,
                            ThumbnailUrl = ci.Course.ThumbnailUrl,
                            Price = ci.Course.Price,
                            InstructorId = ci.Course.InstructorId,
                            InstructorName = ci.Course.Instructor != null ?
                                ci.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                        }
                    }).ToList(),
                    TotalAmount = c.CartItems.Sum(ci => ci.Course.Price * ci.Quantity),
                    TotalItems = c.CartItems.Sum(ci => ci.Quantity)
                })
                .FirstOrDefaultAsync();

            if (cart == null)
            {
                // Tự động tạo giỏ hàng nếu chưa có
                return await CreateCartForUser(userId);
            }

            return cart;
        }

        // GET: api/Carts/Summary/ByUser/5
        [HttpGet("Summary/ByUser/{userId}")]
        public async Task<ActionResult<CartSummaryDTO>> GetCartSummaryByUser(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Course)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return Ok(new CartSummaryDTO
                {
                    UserId = userId,
                    TotalItems = 0,
                    TotalAmount = 0
                });
            }

            var summary = new CartSummaryDTO
            {
                CartId = cart.CartId,
                UserId = cart.UserId,
                TotalItems = cart.CartItems.Sum(ci => ci.Quantity),
                TotalAmount = cart.CartItems.Sum(ci => ci.Course.Price * ci.Quantity),
                CreatedAt = cart.CreatedAt
            };

            return Ok(summary);
        }

        // POST: api/Carts
        [HttpPost]
        public async Task<ActionResult<CartDTO>> PostCart(CartCreateDTO cartCreateDTO)
        {
            // Kiểm tra user tồn tại
            var user = await _context.Users.FindAsync(cartCreateDTO.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            // Kiểm tra user đã có cart chưa
            var existingCart = await _context.Carts
                .FirstOrDefaultAsync(c => c.UserId == cartCreateDTO.UserId);
            if (existingCart != null)
            {
                return BadRequest(new { message = "User already has a cart" });
            }

            var cart = new Cart
            {
                UserId = cartCreateDTO.UserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            var cartDTO = new CartDTO
            {
                CartId = cart.CartId,
                UserId = cart.UserId,
                CreatedAt = cart.CreatedAt,
                CartItems = new List<CartItemDTO>(),
                TotalAmount = 0,
                TotalItems = 0
            };

            return CreatedAtAction("GetCart", new { id = cart.CartId }, cartDTO);
        }

        // POST: api/Carts/AddToCart
        [HttpPost("AddToCart")]
        public async Task<ActionResult<CartItemDTO>> AddToCart(AddToCartDTO addToCartDTO)
        {
            // Kiểm tra user tồn tại
            var user = await _context.Users.FindAsync(addToCartDTO.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }

            // Kiểm tra course tồn tại
            var course = await _context.Courses.FindAsync(addToCartDTO.CourseId);
            if (course == null)
            {
                return BadRequest(new { message = "Course not found" });
            }

            // Lấy hoặc tạo cart cho user
            var cart = await _context.Carts
                .FirstOrDefaultAsync(c => c.UserId == addToCartDTO.UserId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = addToCartDTO.UserId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            // Kiểm tra course đã có trong cart chưa
            var existingCartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cart.CartId && ci.CourseId == addToCartDTO.CourseId);

            if (existingCartItem != null)
            {
                // Cập nhật số lượng nếu đã tồn tại
                existingCartItem.Quantity += addToCartDTO.Quantity;
            }
            else
            {
                // Thêm mới nếu chưa tồn tại
                var cartItem = new CartItem
                {
                    CartId = cart.CartId,
                    CourseId = addToCartDTO.CourseId,
                    Quantity = addToCartDTO.Quantity,
                    AddedAt = DateTime.UtcNow
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();

            // Trả về cart item đã được thêm
            var cartItemDTO = await _context.CartItems
                .Include(ci => ci.Course)
                    .ThenInclude(co => co.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Where(ci => ci.CartId == cart.CartId && ci.CourseId == addToCartDTO.CourseId)
                .Select(ci => new CartItemDTO
                {
                    CartItemId = ci.CartItemId,
                    CartId = ci.CartId,
                    CourseId = ci.CourseId,
                    Quantity = ci.Quantity,
                    AddedAt = ci.AddedAt,
                    Course = new CourseSimpleDTO
                    {
                        CourseId = ci.Course.CourseId,
                        Title = ci.Course.Title,
                        ThumbnailUrl = ci.Course.ThumbnailUrl,
                        Price = ci.Course.Price,
                        InstructorId = ci.Course.InstructorId,
                        InstructorName = ci.Course.Instructor != null ?
                            ci.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                    }
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction("GetCartItem", "CartItems", new { id = cartItemDTO.CartItemId }, cartItemDTO);
        }

        // DELETE: api/Carts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCart(int id)
        {
            var cart = await _context.Carts.FindAsync(id);
            if (cart == null)
            {
                return NotFound();
            }

            _context.Carts.Remove(cart);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Carts/Clear/5
        [HttpDelete("Clear/{userId}")]
        public async Task<IActionResult> ClearCart(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound(new { message = $"Cart for user with ID {userId} not found" });
            }

            _context.CartItems.RemoveRange(cart.CartItems);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CartExists(int id)
        {
            return _context.Carts.Any(e => e.CartId == id);
        }

        private async Task<ActionResult<CartDTO>> CreateCartForUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = $"User with ID {userId} not found" });
            }

            var cart = new Cart
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            var cartDTO = new CartDTO
            {
                CartId = cart.CartId,
                UserId = cart.UserId,
                CreatedAt = cart.CreatedAt,
                CartItems = new List<CartItemDTO>(),
                TotalAmount = 0,
                TotalItems = 0
            };

            return cartDTO;
        }
    }
}
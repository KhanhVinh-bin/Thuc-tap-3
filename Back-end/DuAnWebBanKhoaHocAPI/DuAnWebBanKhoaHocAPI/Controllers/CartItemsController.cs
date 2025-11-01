using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartItemsController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public CartItemsController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/CartItems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CartItemDTO>>> GetCartItems()
        {
            var cartItems = await _context.CartItems
                .Include(ci => ci.Course)
                    .ThenInclude(co => co.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(ci => ci.Cart)
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
                .ToListAsync();

            return Ok(cartItems);
        }

        // GET: api/CartItems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CartItemDTO>> GetCartItem(int id)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Course)
                    .ThenInclude(co => co.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(ci => ci.Cart)
                .Where(ci => ci.CartItemId == id)
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

            if (cartItem == null)
            {
                return NotFound(new { message = $"CartItem with ID {id} not found" });
            }

            return cartItem;
        }

        // GET: api/CartItems/ByCart/5
        [HttpGet("ByCart/{cartId}")]
        public async Task<ActionResult<IEnumerable<CartItemDTO>>> GetCartItemsByCart(int cartId)
        {
            var cartItems = await _context.CartItems
                .Include(ci => ci.Course)
                    .ThenInclude(co => co.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Where(ci => ci.CartId == cartId)
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
                .ToListAsync();

            return Ok(cartItems);
        }

        // POST: api/CartItems
        [HttpPost]
        public async Task<ActionResult<CartItemDTO>> PostCartItem(CartItemCreateDTO cartItemCreateDTO)
        {
            // Kiểm tra cart tồn tại
            var cart = await _context.Carts.FindAsync(cartItemCreateDTO.CartId);
            if (cart == null)
            {
                return BadRequest(new { message = "Cart not found" });
            }

            // Kiểm tra course tồn tại
            var course = await _context.Courses.FindAsync(cartItemCreateDTO.CourseId);
            if (course == null)
            {
                return BadRequest(new { message = "Course not found" });
            }

            // Kiểm tra course đã có trong cart chưa
            var existingCartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cartItemCreateDTO.CartId &&
                                          ci.CourseId == cartItemCreateDTO.CourseId);

            if (existingCartItem != null)
            {
                // Cập nhật số lượng nếu đã tồn tại
                existingCartItem.Quantity += cartItemCreateDTO.Quantity;
                _context.Entry(existingCartItem).State = EntityState.Modified;
            }
            else
            {
                // Thêm mới nếu chưa tồn tại
                var cartItem = new CartItem
                {
                    CartId = cartItemCreateDTO.CartId,
                    CourseId = cartItemCreateDTO.CourseId,
                    Quantity = cartItemCreateDTO.Quantity,
                    AddedAt = DateTime.UtcNow
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();

            // Trả về cart item đã được thêm/cập nhật
            var cartItemDTO = await _context.CartItems
                .Include(ci => ci.Course)
                    .ThenInclude(co => co.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Where(ci => ci.CartId == cartItemCreateDTO.CartId &&
                            ci.CourseId == cartItemCreateDTO.CourseId)
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

            return CreatedAtAction("GetCartItem", new { id = cartItemDTO.CartItemId }, cartItemDTO);
        }

        // PUT: api/CartItems/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCartItem(int id, CartItemUpdateDTO cartItemUpdateDTO)
        {
            var cartItem = await _context.CartItems.FindAsync(id);
            if (cartItem == null)
            {
                return NotFound();
            }

            // Kiểm tra số lượng hợp lệ
            if (cartItemUpdateDTO.Quantity <= 0)
            {
                return BadRequest(new { message = "Quantity must be greater than 0" });
            }

            cartItem.Quantity = cartItemUpdateDTO.Quantity;

            _context.Entry(cartItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CartItemExists(id))
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

        // DELETE: api/CartItems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCartItem(int id)
        {
            var cartItem = await _context.CartItems.FindAsync(id);
            if (cartItem == null)
            {
                return NotFound();
            }

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/CartItems/ByCartAndCourse
        [HttpDelete("ByCartAndCourse")]
        public async Task<IActionResult> DeleteCartItemByCartAndCourse(int cartId, int courseId)
        {
            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cartId && ci.CourseId == courseId);
            if (cartItem == null)
            {
                return NotFound();
            }

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/CartItems/5/Increase
        [HttpPatch("{id}/Increase")]
        public async Task<IActionResult> IncreaseQuantity(int id)
        {
            var cartItem = await _context.CartItems.FindAsync(id);
            if (cartItem == null)
            {
                return NotFound();
            }

            cartItem.Quantity += 1;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/CartItems/5/Decrease
        [HttpPatch("{id}/Decrease")]
        public async Task<IActionResult> DecreaseQuantity(int id)
        {
            var cartItem = await _context.CartItems.FindAsync(id);
            if (cartItem == null)
            {
                return NotFound();
            }

            if (cartItem.Quantity <= 1)
            {
                _context.CartItems.Remove(cartItem);
            }
            else
            {
                cartItem.Quantity -= 1;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CartItemExists(int id)
        {
            return _context.CartItems.Any(e => e.CartItemId == id);
        }
    }
}
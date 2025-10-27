using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public OrdersController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Course)
                        .ThenInclude(c => c.Instructor)
                            .ThenInclude(i => i.InstructorNavigation)
                .Include(o => o.Payments)
                .Select(o => new OrderDTO
                {
                    OrderId = o.OrderId,
                    UserId = o.UserId,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    Notes = o.Notes,
                    User = o.User != null ? new UserSimpleDTO
                    {
                        UserId = o.User.UserId,
                        FullName = o.User.FullName,
                        Email = o.User.Email,
                        AvatarUrl = o.User.AvatarUrl
                    } : null,
                    OrderDetails = o.OrderDetails.Select(od => new OrderDetailDTO
                    {
                        OrderDetailId = od.OrderDetailId,
                        OrderId = od.OrderId,
                        CourseId = od.CourseId,
                        Price = od.Price,
                        Quantity = od.Quantity,
                        Course = new CourseSimpleDTO
                        {
                            CourseId = od.Course.CourseId,
                            Title = od.Course.Title,
                            ThumbnailUrl = od.Course.ThumbnailUrl,
                            Price = od.Course.Price,
                            InstructorId = od.Course.InstructorId,
                            InstructorName = od.Course.Instructor != null ?
                                od.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                        }
                    }).ToList(),
                    Payments = o.Payments.Select(p => new PaymentDTO
                    {
                        PaymentId = p.PaymentId,
                        OrderId = p.OrderId,
                        PaymentMethod = p.PaymentMethod,
                        TransactionId = p.TransactionId,
                        Amount = p.Amount,
                        PaymentStatus = p.PaymentStatus,
                        PaidAt = p.PaidAt
                    }).ToList()
                })
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDTO>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Course)
                        .ThenInclude(c => c.Instructor)
                            .ThenInclude(i => i.InstructorNavigation)
                .Include(o => o.Payments)
                .Where(o => o.OrderId == id)
                .Select(o => new OrderDTO
                {
                    OrderId = o.OrderId,
                    UserId = o.UserId,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    Notes = o.Notes,
                    User = o.User != null ? new UserSimpleDTO
                    {
                        UserId = o.User.UserId,
                        FullName = o.User.FullName,
                        Email = o.User.Email,
                        AvatarUrl = o.User.AvatarUrl
                    } : null,
                    OrderDetails = o.OrderDetails.Select(od => new OrderDetailDTO
                    {
                        OrderDetailId = od.OrderDetailId,
                        OrderId = od.OrderId,
                        CourseId = od.CourseId,
                        Price = od.Price,
                        Quantity = od.Quantity,
                        Course = new CourseSimpleDTO
                        {
                            CourseId = od.Course.CourseId,
                            Title = od.Course.Title,
                            ThumbnailUrl = od.Course.ThumbnailUrl,
                            Price = od.Course.Price,
                            InstructorId = od.Course.InstructorId,
                            InstructorName = od.Course.Instructor != null ?
                                od.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                        }
                    }).ToList(),
                    Payments = o.Payments.Select(p => new PaymentDTO
                    {
                        PaymentId = p.PaymentId,
                        OrderId = p.OrderId,
                        PaymentMethod = p.PaymentMethod,
                        TransactionId = p.TransactionId,
                        Amount = p.Amount,
                        PaymentStatus = p.PaymentStatus,
                        PaidAt = p.PaidAt
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (order == null)
            {
                return NotFound(new { message = $"Order with ID {id} not found" });
            }

            return order;
        }

        // GET: api/Orders/ByUser/5
        [HttpGet("ByUser/{userId}")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrdersByUser(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
            {
                return NotFound(new { message = $"User with ID {userId} not found" });
            }

            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Course)
                        .ThenInclude(c => c.Instructor)
                            .ThenInclude(i => i.InstructorNavigation)
                .Include(o => o.Payments)
                .Where(o => o.UserId == userId)
                .Select(o => new OrderDTO
                {
                    OrderId = o.OrderId,
                    UserId = o.UserId,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    Notes = o.Notes,
                    User = o.User != null ? new UserSimpleDTO
                    {
                        UserId = o.User.UserId,
                        FullName = o.User.FullName,
                        Email = o.User.Email,
                        AvatarUrl = o.User.AvatarUrl
                    } : null,
                    OrderDetails = o.OrderDetails.Select(od => new OrderDetailDTO
                    {
                        OrderDetailId = od.OrderDetailId,
                        OrderId = od.OrderId,
                        CourseId = od.CourseId,
                        Price = od.Price,
                        Quantity = od.Quantity,
                        Course = new CourseSimpleDTO
                        {
                            CourseId = od.Course.CourseId,
                            Title = od.Course.Title,
                            ThumbnailUrl = od.Course.ThumbnailUrl,
                            Price = od.Course.Price,
                            InstructorId = od.Course.InstructorId,
                            InstructorName = od.Course.Instructor != null ?
                                od.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                        }
                    }).ToList(),
                    Payments = o.Payments.Select(p => new PaymentDTO
                    {
                        PaymentId = p.PaymentId,
                        OrderId = p.OrderId,
                        PaymentMethod = p.PaymentMethod,
                        TransactionId = p.TransactionId,
                        Amount = p.Amount,
                        PaymentStatus = p.PaymentStatus,
                        PaidAt = p.PaidAt
                    }).ToList()
                })
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/Orders/Stats
        [HttpGet("Stats")]
        public async Task<ActionResult<OrderStatsDTO>> GetOrderStats()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var totalRevenue = await _context.Orders.Where(o => o.Status == "paid").SumAsync(o => o.TotalAmount);
            var pendingOrders = await _context.Orders.CountAsync(o => o.Status == "pending");
            var paidOrders = await _context.Orders.CountAsync(o => o.Status == "paid");
            var cancelledOrders = await _context.Orders.CountAsync(o => o.Status == "cancelled");
            var refundedOrders = await _context.Orders.CountAsync(o => o.Status == "refunded");
            var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            var stats = new OrderStatsDTO
            {
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                PendingOrders = pendingOrders,
                PaidOrders = paidOrders,
                CancelledOrders = cancelledOrders,
                RefundedOrders = refundedOrders,
                AverageOrderValue = Math.Round(averageOrderValue, 2)
            };

            return Ok(stats);
        }

        // POST: api/Orders
        [HttpPost]
        public async Task<ActionResult<OrderDTO>> PostOrder(OrderCreateDTO orderCreateDTO)
        {
            // Validate user exists (if provided)
            if (orderCreateDTO.UserId.HasValue)
            {
                var user = await _context.Users.FindAsync(orderCreateDTO.UserId.Value);
                if (user == null)
                {
                    return BadRequest(new { message = "User not found" });
                }
            }

            // Calculate total amount and validate courses
            decimal totalAmount = 0;
            foreach (var item in orderCreateDTO.OrderDetails)
            {
                var course = await _context.Courses.FindAsync(item.CourseId);
                if (course == null)
                {
                    return BadRequest(new { message = $"Course with ID {item.CourseId} not found" });
                }
                totalAmount += item.Price * item.Quantity;
            }

            var order = new Order
            {
                UserId = orderCreateDTO.UserId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = totalAmount,
                Status = "pending",
                Notes = orderCreateDTO.Notes
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Add order details
            foreach (var item in orderCreateDTO.OrderDetails)
            {
                var orderDetail = new OrderDetail
                {
                    OrderId = order.OrderId,
                    CourseId = item.CourseId,
                    Price = item.Price,
                    Quantity = item.Quantity
                };
                _context.OrderDetails.Add(orderDetail);
            }

            await _context.SaveChangesAsync();

            // Return the created order with details
            var createdOrder = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Course)
                        .ThenInclude(c => c.Instructor)
                            .ThenInclude(i => i.InstructorNavigation)
                .Where(o => o.OrderId == order.OrderId)
                .Select(o => new OrderDTO
                {
                    OrderId = o.OrderId,
                    UserId = o.UserId,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    Notes = o.Notes,
                    User = o.User != null ? new UserSimpleDTO
                    {
                        UserId = o.User.UserId,
                        FullName = o.User.FullName,
                        Email = o.User.Email,
                        AvatarUrl = o.User.AvatarUrl
                    } : null,
                    OrderDetails = o.OrderDetails.Select(od => new OrderDetailDTO
                    {
                        OrderDetailId = od.OrderDetailId,
                        OrderId = od.OrderId,
                        CourseId = od.CourseId,
                        Price = od.Price,
                        Quantity = od.Quantity,
                        Course = new CourseSimpleDTO
                        {
                            CourseId = od.Course.CourseId,
                            Title = od.Course.Title,
                            ThumbnailUrl = od.Course.ThumbnailUrl,
                            Price = od.Course.Price,
                            InstructorId = od.Course.InstructorId,
                            InstructorName = od.Course.Instructor != null ?
                                od.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                        }
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction("GetOrder", new { id = order.OrderId }, createdOrder);
        }

        // POST: api/Orders/CreateFromCart
        [HttpPost("CreateFromCart")]
        public async Task<ActionResult<OrderDTO>> CreateOrderFromCart(CreateOrderFromCartDTO createOrderDTO)
        {
            // Get user's cart
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Course)
                .FirstOrDefaultAsync(c => c.UserId == createOrderDTO.UserId);

            if (cart == null || !cart.CartItems.Any())
            {
                return BadRequest(new { message = "Cart is empty or not found" });
            }

            // Calculate total amount
            decimal totalAmount = cart.CartItems.Sum(ci => ci.Course.Price * ci.Quantity);

            var order = new Order
            {
                UserId = createOrderDTO.UserId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = totalAmount,
                Status = "pending",
                Notes = createOrderDTO.Notes
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Add order details from cart items
            foreach (var cartItem in cart.CartItems)
            {
                var orderDetail = new OrderDetail
                {
                    OrderId = order.OrderId,
                    CourseId = cartItem.CourseId,
                    Price = cartItem.Course.Price,
                    Quantity = cartItem.Quantity
                };
                _context.OrderDetails.Add(orderDetail);
            }

            // Clear the cart
            _context.CartItems.RemoveRange(cart.CartItems);
            await _context.SaveChangesAsync();

            // Return the created order
            var createdOrder = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Course)
                        .ThenInclude(c => c.Instructor)
                            .ThenInclude(i => i.InstructorNavigation)
                .Where(o => o.OrderId == order.OrderId)
                .Select(o => new OrderDTO
                {
                    OrderId = o.OrderId,
                    UserId = o.UserId,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    Notes = o.Notes,
                    User = o.User != null ? new UserSimpleDTO
                    {
                        UserId = o.User.UserId,
                        FullName = o.User.FullName,
                        Email = o.User.Email,
                        AvatarUrl = o.User.AvatarUrl
                    } : null,
                    OrderDetails = o.OrderDetails.Select(od => new OrderDetailDTO
                    {
                        OrderDetailId = od.OrderDetailId,
                        OrderId = od.OrderId,
                        CourseId = od.CourseId,
                        Price = od.Price,
                        Quantity = od.Quantity,
                        Course = new CourseSimpleDTO
                        {
                            CourseId = od.Course.CourseId,
                            Title = od.Course.Title,
                            ThumbnailUrl = od.Course.ThumbnailUrl,
                            Price = od.Course.Price,
                            InstructorId = od.Course.InstructorId,
                            InstructorName = od.Course.Instructor != null ?
                                od.Course.Instructor.InstructorNavigation.FullName : "Unknown Instructor"
                        }
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction("GetOrder", new { id = order.OrderId }, createdOrder);
        }

        // PUT: api/Orders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, OrderUpdateDTO orderUpdateDTO)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            order.Status = orderUpdateDTO.Status;
            order.Notes = orderUpdateDTO.Notes;

            _context.Entry(order).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
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

        // PATCH: api/Orders/5/Status
        [HttpPatch("{id}/Status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            order.Status = status;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Orders/Recent/5
        [HttpGet("Recent/{count}")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetRecentOrders(int count = 10)
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Course)
                .OrderByDescending(o => o.OrderDate)
                .Take(count)
                .Select(o => new OrderDTO
                {
                    OrderId = o.OrderId,
                    UserId = o.UserId,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    Notes = o.Notes,
                    User = o.User != null ? new UserSimpleDTO
                    {
                        UserId = o.User.UserId,
                        FullName = o.User.FullName,
                        Email = o.User.Email,
                        AvatarUrl = o.User.AvatarUrl
                    } : null,
                    OrderDetails = o.OrderDetails.Select(od => new OrderDetailDTO
                    {
                        OrderDetailId = od.OrderDetailId,
                        OrderId = od.OrderId,
                        CourseId = od.CourseId,
                        Price = od.Price,
                        Quantity = od.Quantity,
                        Course = new CourseSimpleDTO
                        {
                            CourseId = od.Course.CourseId,
                            Title = od.Course.Title,
                            ThumbnailUrl = od.Course.ThumbnailUrl,
                            Price = od.Course.Price
                        }
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.OrderId == id);
        }
    }
}
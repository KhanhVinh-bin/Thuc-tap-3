using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderDetailsController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public OrderDetailsController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/OrderDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDetailDTO>>> GetOrderDetails()
        {
            var orderDetails = await _context.OrderDetails
                .Include(od => od.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(od => od.Order)
                .Select(od => new OrderDetailDTO
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
                })
                .ToListAsync();

            return Ok(orderDetails);
        }

        // GET: api/OrderDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDetailDTO>> GetOrderDetail(int id)
        {
            var orderDetail = await _context.OrderDetails
                .Include(od => od.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Include(od => od.Order)
                .Where(od => od.OrderDetailId == id)
                .Select(od => new OrderDetailDTO
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
                })
                .FirstOrDefaultAsync();

            if (orderDetail == null)
            {
                return NotFound(new { message = $"OrderDetail with ID {id} not found" });
            }

            return orderDetail;
        }

        // GET: api/OrderDetails/ByOrder/5
        [HttpGet("ByOrder/{orderId}")]
        public async Task<ActionResult<IEnumerable<OrderDetailDTO>>> GetOrderDetailsByOrder(int orderId)
        {
            var orderExists = await _context.Orders.AnyAsync(o => o.OrderId == orderId);
            if (!orderExists)
            {
                return NotFound(new { message = $"Order with ID {orderId} not found" });
            }

            var orderDetails = await _context.OrderDetails
                .Include(od => od.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Where(od => od.OrderId == orderId)
                .Select(od => new OrderDetailDTO
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
                })
                .ToListAsync();

            return Ok(orderDetails);
        }

        // GET: api/OrderDetails/ByCourse/5
        [HttpGet("ByCourse/{courseId}")]
        public async Task<ActionResult<IEnumerable<OrderDetailDTO>>> GetOrderDetailsByCourse(int courseId)
        {
            var courseExists = await _context.Courses.AnyAsync(c => c.CourseId == courseId);
            if (!courseExists)
            {
                return NotFound(new { message = $"Course with ID {courseId} not found" });
            }

            var orderDetails = await _context.OrderDetails
                .Include(od => od.Course)
                .Include(od => od.Order)
                    .ThenInclude(o => o.User)
                .Where(od => od.CourseId == courseId)
                .Select(od => new OrderDetailDTO
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
                })
                .ToListAsync();

            return Ok(orderDetails);
        }

        // POST: api/OrderDetails
        [HttpPost]
        public async Task<ActionResult<OrderDetailDTO>> PostOrderDetail(OrderDetailCreateDTO orderDetailCreateDTO)
        {
            // Check if order exists
            var order = await _context.Orders.FindAsync(orderDetailCreateDTO.OrderId);
            if (order == null)
            {
                return BadRequest(new { message = "Order not found" });
            }

            // Check if course exists
            var course = await _context.Courses.FindAsync(orderDetailCreateDTO.CourseId);
            if (course == null)
            {
                return BadRequest(new { message = "Course not found" });
            }

            // Check if course already exists in order
            var existingOrderDetail = await _context.OrderDetails
                .FirstOrDefaultAsync(od => od.OrderId == orderDetailCreateDTO.OrderId &&
                                          od.CourseId == orderDetailCreateDTO.CourseId);
            if (existingOrderDetail != null)
            {
                return BadRequest(new { message = "Course already exists in this order" });
            }

            var orderDetail = new OrderDetail
            {
                OrderId = orderDetailCreateDTO.OrderId,
                CourseId = orderDetailCreateDTO.CourseId,
                Price = orderDetailCreateDTO.Price,
                Quantity = orderDetailCreateDTO.Quantity
            };

            _context.OrderDetails.Add(orderDetail);
            await _context.SaveChangesAsync();

            // Update order total amount
            await UpdateOrderTotal(orderDetailCreateDTO.OrderId);

            // Return the created order detail
            var createdOrderDetail = await _context.OrderDetails
                .Include(od => od.Course)
                    .ThenInclude(c => c.Instructor)
                        .ThenInclude(i => i.InstructorNavigation)
                .Where(od => od.OrderDetailId == orderDetail.OrderDetailId)
                .Select(od => new OrderDetailDTO
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
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction("GetOrderDetail", new { id = orderDetail.OrderDetailId }, createdOrderDetail);
        }

        // PUT: api/OrderDetails/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrderDetail(int id, OrderDetailCreateDTO orderDetailCreateDTO)
        {
            var orderDetail = await _context.OrderDetails.FindAsync(id);
            if (orderDetail == null)
            {
                return NotFound();
            }

            // Check if order exists
            var order = await _context.Orders.FindAsync(orderDetailCreateDTO.OrderId);
            if (order == null)
            {
                return BadRequest(new { message = "Order not found" });
            }

            // Check if course exists
            var course = await _context.Courses.FindAsync(orderDetailCreateDTO.CourseId);
            if (course == null)
            {
                return BadRequest(new { message = "Course not found" });
            }

            orderDetail.OrderId = orderDetailCreateDTO.OrderId;
            orderDetail.CourseId = orderDetailCreateDTO.CourseId;
            orderDetail.Price = orderDetailCreateDTO.Price;
            orderDetail.Quantity = orderDetailCreateDTO.Quantity;

            _context.Entry(orderDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                // Update order total amount
                await UpdateOrderTotal(orderDetailCreateDTO.OrderId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderDetailExists(id))
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

        // DELETE: api/OrderDetails/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderDetail(int id)
        {
            var orderDetail = await _context.OrderDetails.FindAsync(id);
            if (orderDetail == null)
            {
                return NotFound();
            }

            var orderId = orderDetail.OrderId;
            _context.OrderDetails.Remove(orderDetail);
            await _context.SaveChangesAsync();

            // Update order total amount
            await UpdateOrderTotal(orderId);

            return NoContent();
        }

        private bool OrderDetailExists(int id)
        {
            return _context.OrderDetails.Any(e => e.OrderDetailId == id);
        }

        private async Task UpdateOrderTotal(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order != null)
            {
                order.TotalAmount = order.OrderDetails.Sum(od => od.Price * od.Quantity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
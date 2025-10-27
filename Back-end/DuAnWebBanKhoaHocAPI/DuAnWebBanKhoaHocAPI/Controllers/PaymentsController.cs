using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public PaymentsController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Payments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentDTO>>> GetPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.Order)
                    .ThenInclude(o => o.User)
                .Include(p => p.Order)
                    .ThenInclude(o => o.OrderDetails)
                        .ThenInclude(od => od.Course)
                .Select(p => new PaymentDTO
                {
                    PaymentId = p.PaymentId,
                    OrderId = p.OrderId,
                    PaymentMethod = p.PaymentMethod,
                    TransactionId = p.TransactionId,
                    Amount = p.Amount,
                    PaymentStatus = p.PaymentStatus,
                    PaidAt = p.PaidAt,
                    RawResponse = p.RawResponse
                })
                .OrderByDescending(p => p.PaidAt)
                .ToListAsync();

            return Ok(payments);
        }

        // GET: api/Payments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentDTO>> GetPayment(int id)
        {
            var payment = await _context.Payments
                .Include(p => p.Order)
                    .ThenInclude(o => o.User)
                .Include(p => p.Order)
                    .ThenInclude(o => o.OrderDetails)
                        .ThenInclude(od => od.Course)
                .Where(p => p.PaymentId == id)
                .Select(p => new PaymentDTO
                {
                    PaymentId = p.PaymentId,
                    OrderId = p.OrderId,
                    PaymentMethod = p.PaymentMethod,
                    TransactionId = p.TransactionId,
                    Amount = p.Amount,
                    PaymentStatus = p.PaymentStatus,
                    PaidAt = p.PaidAt,
                    RawResponse = p.RawResponse
                })
                .FirstOrDefaultAsync();

            if (payment == null)
            {
                return NotFound(new { message = $"Payment with ID {id} not found" });
            }

            return payment;
        }

        // GET: api/Payments/ByOrder/5
        [HttpGet("ByOrder/{orderId}")]
        public async Task<ActionResult<IEnumerable<PaymentDTO>>> GetPaymentsByOrder(int orderId)
        {
            var orderExists = await _context.Orders.AnyAsync(o => o.OrderId == orderId);
            if (!orderExists)
            {
                return NotFound(new { message = $"Order with ID {orderId} not found" });
            }

            var payments = await _context.Payments
                .Where(p => p.OrderId == orderId)
                .Select(p => new PaymentDTO
                {
                    PaymentId = p.PaymentId,
                    OrderId = p.OrderId,
                    PaymentMethod = p.PaymentMethod,
                    TransactionId = p.TransactionId,
                    Amount = p.Amount,
                    PaymentStatus = p.PaymentStatus,
                    PaidAt = p.PaidAt,
                    RawResponse = p.RawResponse
                })
                .OrderByDescending(p => p.PaidAt)
                .ToListAsync();

            return Ok(payments);
        }

        // GET: api/Payments/ByTransaction/{transactionId}
        [HttpGet("ByTransaction/{transactionId}")]
        public async Task<ActionResult<PaymentDTO>> GetPaymentByTransaction(string transactionId)
        {
            var payment = await _context.Payments
                .Include(p => p.Order)
                    .ThenInclude(o => o.User)
                .Where(p => p.TransactionId == transactionId)
                .Select(p => new PaymentDTO
                {
                    PaymentId = p.PaymentId,
                    OrderId = p.OrderId,
                    PaymentMethod = p.PaymentMethod,
                    TransactionId = p.TransactionId,
                    Amount = p.Amount,
                    PaymentStatus = p.PaymentStatus,
                    PaidAt = p.PaidAt,
                    RawResponse = p.RawResponse
                })
                .FirstOrDefaultAsync();

            if (payment == null)
            {
                return NotFound(new { message = $"Payment with Transaction ID {transactionId} not found" });
            }

            return payment;
        }

        // POST: api/Payments
        [HttpPost]
        public async Task<ActionResult<PaymentDTO>> PostPayment(PaymentCreateDTO paymentCreateDTO)
        {
            // Validate order exists (if provided)
            if (paymentCreateDTO.OrderId.HasValue)
            {
                var order = await _context.Orders.FindAsync(paymentCreateDTO.OrderId.Value);
                if (order == null)
                {
                    return BadRequest(new { message = "Order not found" });
                }
            }

            var payment = new Payment
            {
                OrderId = paymentCreateDTO.OrderId,
                PaymentMethod = paymentCreateDTO.PaymentMethod,
                TransactionId = paymentCreateDTO.TransactionId,
                Amount = paymentCreateDTO.Amount,
                PaymentStatus = paymentCreateDTO.PaymentStatus,
                PaidAt = paymentCreateDTO.PaidAt,
                RawResponse = paymentCreateDTO.RawResponse
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // If payment is successful, update order status to paid and create enrollments
            if (payment.PaymentStatus == "success")
            {
                await UpdateOrderStatus(payment.OrderId, "paid");
                await CreateEnrollments(payment.OrderId);
            }

            var paymentDTO = new PaymentDTO
            {
                PaymentId = payment.PaymentId,
                OrderId = payment.OrderId,
                PaymentMethod = payment.PaymentMethod,
                TransactionId = payment.TransactionId,
                Amount = payment.Amount,
                PaymentStatus = payment.PaymentStatus,
                PaidAt = payment.PaidAt,
                RawResponse = payment.RawResponse
            };

            return CreatedAtAction("GetPayment", new { id = payment.PaymentId }, paymentDTO);
        }

        // PUT: api/Payments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPayment(int id, PaymentUpdateDTO paymentUpdateDTO)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null)
            {
                return NotFound();
            }

            payment.PaymentStatus = paymentUpdateDTO.PaymentStatus;
            payment.PaidAt = paymentUpdateDTO.PaidAt;
            payment.TransactionId = paymentUpdateDTO.TransactionId;
            payment.RawResponse = paymentUpdateDTO.RawResponse;

            _context.Entry(payment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                // If payment is successful, update order status to paid and create enrollments
                if (payment.PaymentStatus == "success")
                {
                    await UpdateOrderStatus(payment.OrderId, "paid");
                    await CreateEnrollments(payment.OrderId);
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PaymentExists(id))
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

        // PATCH: api/Payments/5/Status
        [HttpPatch("{id}/Status")]
        public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] string status)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null)
            {
                return NotFound();
            }

            payment.PaymentStatus = status;
            payment.PaidAt = status == "success" ? DateTime.UtcNow : payment.PaidAt;

            await _context.SaveChangesAsync();

            // If payment is successful, update order status to paid and create enrollments
            if (payment.PaymentStatus == "success")
            {
                await UpdateOrderStatus(payment.OrderId, "paid");
                await CreateEnrollments(payment.OrderId);
            }

            return NoContent();
        }

        // DELETE: api/Payments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null)
            {
                return NotFound();
            }

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Payments/Recent/5
        [HttpGet("Recent/{count}")]
        public async Task<ActionResult<IEnumerable<PaymentDTO>>> GetRecentPayments(int count = 10)
        {
            var payments = await _context.Payments
                .Include(p => p.Order)
                    .ThenInclude(o => o.User)
                .OrderByDescending(p => p.PaidAt)
                .Take(count)
                .Select(p => new PaymentDTO
                {
                    PaymentId = p.PaymentId,
                    OrderId = p.OrderId,
                    PaymentMethod = p.PaymentMethod,
                    TransactionId = p.TransactionId,
                    Amount = p.Amount,
                    PaymentStatus = p.PaymentStatus,
                    PaidAt = p.PaidAt,
                    RawResponse = p.RawResponse
                })
                .ToListAsync();

            return Ok(payments);
        }

        // GET: api/Payments/Stats
        [HttpGet("Stats")]
        public async Task<ActionResult<PaymentStatsDTO>> GetPaymentStats()
        {
            var totalPayments = await _context.Payments.CountAsync();
            var totalAmount = await _context.Payments.Where(p => p.PaymentStatus == "success").SumAsync(p => p.Amount);
            var successfulPayments = await _context.Payments.CountAsync(p => p.PaymentStatus == "success");
            var failedPayments = await _context.Payments.CountAsync(p => p.PaymentStatus == "failed");
            var pendingPayments = await _context.Payments.CountAsync(p => p.PaymentStatus == "pending");
            var successRate = totalPayments > 0 ? (decimal)successfulPayments / totalPayments * 100 : 0;

            var stats = new PaymentStatsDTO
            {
                TotalPayments = totalPayments,
                TotalAmount = totalAmount,
                SuccessfulPayments = successfulPayments,
                FailedPayments = failedPayments,
                PendingPayments = pendingPayments,
                SuccessRate = Math.Round(successRate, 2)
            };

            return Ok(stats);
        }

        private bool PaymentExists(int id)
        {
            return _context.Payments.Any(e => e.PaymentId == id);
        }

        private async Task UpdateOrderStatus(int? orderId, string status)
        {
            if (orderId.HasValue)
            {
                var order = await _context.Orders.FindAsync(orderId.Value);
                if (order != null)
                {
                    order.Status = status;
                    await _context.SaveChangesAsync();
                }
            }
        }

        private async Task CreateEnrollments(int? orderId)
        {
            if (orderId.HasValue)
            {
                var order = await _context.Orders
                    .Include(o => o.OrderDetails)
                    .Include(o => o.User)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId.Value);

                if (order != null && order.UserId.HasValue)
                {
                    foreach (var orderDetail in order.OrderDetails)
                    {
                        // Check if enrollment already exists
                        var existingEnrollment = await _context.Enrollments
                            .FirstOrDefaultAsync(e => e.UserId == order.UserId && e.CourseId == orderDetail.CourseId);

                        if (existingEnrollment == null)
                        {
                            var enrollment = new Enrollment
                            {
                                CourseId = orderDetail.CourseId,
                                UserId = order.UserId.Value,
                                EnrollDate = DateTime.UtcNow,
                                Status = "active"
                            };
                            _context.Enrollments.Add(enrollment);
                        }
                        else
                        {
                            existingEnrollment.Status = "active";
                        }
                    }
                    await _context.SaveChangesAsync();
                }
            }
        }
    }
}
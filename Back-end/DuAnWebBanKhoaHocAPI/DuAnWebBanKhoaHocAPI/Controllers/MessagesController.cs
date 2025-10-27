using DuAnWebBanKhoaHocAPI.Models;
using DuAnWebBanKhoaHocAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly DuAnDbContext _context;

        public MessagesController(DuAnDbContext context)
        {
            _context = context;
        }

        // GET: api/Messages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MessageDTO>>> GetMessages()
        {
            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Select(m => new MessageDTO
                {
                    MessageId = m.MessageId,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    Content = m.Content,
                    MessageType = m.MessageType,
                    CreatedAt = m.CreatedAt,
                    IsRead = m.IsRead,
                    Sender = new UserSimpleDTO
                    {
                        UserId = m.Sender.UserId,
                        FullName = m.Sender.FullName,
                        Email = m.Sender.Email,
                        AvatarUrl = m.Sender.AvatarUrl
                    },
                    Receiver = new UserSimpleDTO
                    {
                        UserId = m.Receiver.UserId,
                        FullName = m.Receiver.FullName,
                        Email = m.Receiver.Email,
                        AvatarUrl = m.Receiver.AvatarUrl
                    }
                })
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return Ok(messages);
        }

        // GET: api/Messages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MessageDTO>> GetMessage(long id)
        {
            var message = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.MessageId == id)
                .Select(m => new MessageDTO
                {
                    MessageId = m.MessageId,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    Content = m.Content,
                    MessageType = m.MessageType,
                    CreatedAt = m.CreatedAt,
                    IsRead = m.IsRead,
                    Sender = new UserSimpleDTO
                    {
                        UserId = m.Sender.UserId,
                        FullName = m.Sender.FullName,
                        Email = m.Sender.Email,
                        AvatarUrl = m.Sender.AvatarUrl
                    },
                    Receiver = new UserSimpleDTO
                    {
                        UserId = m.Receiver.UserId,
                        FullName = m.Receiver.FullName,
                        Email = m.Receiver.Email,
                        AvatarUrl = m.Receiver.AvatarUrl
                    }
                })
                .FirstOrDefaultAsync();

            if (message == null)
            {
                return NotFound(new { message = $"Message with ID {id} not found" });
            }

            return message;
        }

        // GET: api/Messages/ByUser/5
        [HttpGet("ByUser/{userId}")]
        public async Task<ActionResult<IEnumerable<MessageDTO>>> GetMessagesByUser(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
            {
                return NotFound(new { message = $"User with ID {userId} not found" });
            }

            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Select(m => new MessageDTO
                {
                    MessageId = m.MessageId,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    Content = m.Content,
                    MessageType = m.MessageType,
                    CreatedAt = m.CreatedAt,
                    IsRead = m.IsRead,
                    Sender = new UserSimpleDTO
                    {
                        UserId = m.Sender.UserId,
                        FullName = m.Sender.FullName,
                        Email = m.Sender.Email,
                        AvatarUrl = m.Sender.AvatarUrl
                    },
                    Receiver = new UserSimpleDTO
                    {
                        UserId = m.Receiver.UserId,
                        FullName = m.Receiver.FullName,
                        Email = m.Receiver.Email,
                        AvatarUrl = m.Receiver.AvatarUrl
                    }
                })
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return Ok(messages);
        }

        // GET: api/Messages/Conversation/{userId1}/{userId2}
        [HttpGet("Conversation/{userId1}/{userId2}")]
        public async Task<ActionResult<ConversationDTO>> GetConversation(int userId1, int userId2)
        {
            var user1Exists = await _context.Users.AnyAsync(u => u.UserId == userId1);
            var user2Exists = await _context.Users.AnyAsync(u => u.UserId == userId2);
            if (!user1Exists || !user2Exists)
            {
                return NotFound(new { message = "One or both users not found" });
            }

            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => (m.SenderId == userId1 && m.ReceiverId == userId2) ||
                           (m.SenderId == userId2 && m.ReceiverId == userId1))
                .Select(m => new MessageDTO
                {
                    MessageId = m.MessageId,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    Content = m.Content,
                    MessageType = m.MessageType,
                    CreatedAt = m.CreatedAt,
                    IsRead = m.IsRead,
                    Sender = new UserSimpleDTO
                    {
                        UserId = m.Sender.UserId,
                        FullName = m.Sender.FullName,
                        Email = m.Sender.Email,
                        AvatarUrl = m.Sender.AvatarUrl
                    },
                    Receiver = new UserSimpleDTO
                    {
                        UserId = m.Receiver.UserId,
                        FullName = m.Receiver.FullName,
                        Email = m.Receiver.Email,
                        AvatarUrl = m.Receiver.AvatarUrl
                    }
                })
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            var conversation = new ConversationDTO
            {
                UserId1 = userId1,
                UserId2 = userId2,
                Messages = messages
            };

            return Ok(conversation);
        }

        // GET: api/Messages/Conversations/ByUser/5
        [HttpGet("Conversations/ByUser/{userId}")]
        public async Task<ActionResult<IEnumerable<UserConversationDTO>>> GetUserConversations(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
            {
                return NotFound(new { message = $"User with ID {userId} not found" });
            }

            // Lấy danh sách người dùng đã có tin nhắn với user hiện tại
            var conversations = await _context.Messages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Select(m => new { m.SenderId, m.ReceiverId })
                .Distinct()
                .ToListAsync();

            var otherUserIds = conversations
                .SelectMany(c => new[] { c.SenderId, c.ReceiverId })
                .Where(id => id != userId)
                .Distinct()
                .ToList();

            var userConversations = new List<UserConversationDTO>();

            foreach (var otherUserId in otherUserIds)
            {
                var lastMessage = await _context.Messages
                    .Where(m => (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                               (m.SenderId == otherUserId && m.ReceiverId == userId))
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefaultAsync();

                var unreadCount = await _context.Messages
                    .CountAsync(m => m.SenderId == otherUserId &&
                                    m.ReceiverId == userId &&
                                    !m.IsRead);

                var otherUser = await _context.Users
                    .Where(u => u.UserId == otherUserId)
                    .Select(u => new { u.FullName, u.AvatarUrl })
                    .FirstOrDefaultAsync();

                userConversations.Add(new UserConversationDTO
                {
                    OtherUserId = otherUserId,
                    OtherUserName = otherUser?.FullName ?? "Unknown User",
                    OtherUserAvatar = otherUser?.AvatarUrl,
                    LastMessage = lastMessage?.Content,
                    LastMessageTime = lastMessage?.CreatedAt,
                    IsRead = lastMessage?.IsRead ?? true,
                    UnreadCount = unreadCount
                });
            }

            // Sắp xếp theo thời gian tin nhắn cuối cùng (mới nhất đầu tiên)
            userConversations = userConversations
                .OrderByDescending(uc => uc.LastMessageTime)
                .ToList();

            return Ok(userConversations);
        }

        // POST: api/Messages
        [HttpPost]
        public async Task<ActionResult<MessageDTO>> PostMessage(MessageCreateDTO messageCreateDTO)
        {
            // Validate sender exists
            var sender = await _context.Users.FindAsync(messageCreateDTO.SenderId);
            if (sender == null)
            {
                return BadRequest(new { message = "Sender not found" });
            }

            // Validate receiver exists
            var receiver = await _context.Users.FindAsync(messageCreateDTO.ReceiverId);
            if (receiver == null)
            {
                return BadRequest(new { message = "Receiver not found" });
            }

            // Validate content
            if (string.IsNullOrWhiteSpace(messageCreateDTO.Content))
            {
                return BadRequest(new { message = "Content cannot be empty" });
            }

            var message = new Message
            {
                SenderId = messageCreateDTO.SenderId,
                ReceiverId = messageCreateDTO.ReceiverId,
                Content = messageCreateDTO.Content,
                MessageType = messageCreateDTO.MessageType ?? "text",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Return the created message with sender and receiver details
            var createdMessage = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.MessageId == message.MessageId)
                .Select(m => new MessageDTO
                {
                    MessageId = m.MessageId,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    Content = m.Content,
                    MessageType = m.MessageType,
                    CreatedAt = m.CreatedAt,
                    IsRead = m.IsRead,
                    Sender = new UserSimpleDTO
                    {
                        UserId = m.Sender.UserId,
                        FullName = m.Sender.FullName,
                        Email = m.Sender.Email,
                        AvatarUrl = m.Sender.AvatarUrl
                    },
                    Receiver = new UserSimpleDTO
                    {
                        UserId = m.Receiver.UserId,
                        FullName = m.Receiver.FullName,
                        Email = m.Receiver.Email,
                        AvatarUrl = m.Receiver.AvatarUrl
                    }
                })
                .FirstOrDefaultAsync();

            return CreatedAtAction("GetMessage", new { id = message.MessageId }, createdMessage);
        }

        // PUT: api/Messages/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMessage(long id, MessageUpdateDTO messageUpdateDTO)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
            {
                return NotFound();
            }

            // Validate content
            if (string.IsNullOrWhiteSpace(messageUpdateDTO.Content))
            {
                return BadRequest(new { message = "Content cannot be empty" });
            }

            message.Content = messageUpdateDTO.Content;
            message.MessageType = messageUpdateDTO.MessageType;

            _context.Entry(message).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MessageExists(id))
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

        // PATCH: api/Messages/5/MarkAsRead
        [HttpPatch("{id}/MarkAsRead")]
        public async Task<IActionResult> MarkMessageAsRead(long id, MarkAsReadDTO markAsReadDTO)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
            {
                return NotFound();
            }

            message.IsRead = markAsReadDTO.IsRead;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Messages/MarkConversationAsRead
        [HttpPatch("MarkConversationAsRead")]
        public async Task<IActionResult> MarkConversationAsRead(int userId1, int userId2)
        {
            var messages = await _context.Messages
                .Where(m => (m.SenderId == userId1 && m.ReceiverId == userId2) ||
                           (m.SenderId == userId2 && m.ReceiverId == userId1))
                .ToListAsync();

            foreach (var message in messages)
            {
                message.IsRead = true;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Messages/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(long id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
            {
                return NotFound();
            }

            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Messages/UnreadCount/5
        [HttpGet("UnreadCount/{userId}")]
        public async Task<ActionResult<int>> GetUnreadMessageCount(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
            {
                return NotFound(new { message = $"User with ID {userId} not found" });
            }

            var unreadCount = await _context.Messages
                .CountAsync(m => m.ReceiverId == userId && !m.IsRead);

            return Ok(unreadCount);
        }

        private bool MessageExists(long id)
        {
            return _context.Messages.Any(e => e.MessageId == id);
        }
    }
}
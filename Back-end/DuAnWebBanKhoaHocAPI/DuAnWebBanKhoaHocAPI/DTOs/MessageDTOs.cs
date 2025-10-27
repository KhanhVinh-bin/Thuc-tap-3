using System;

namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class MessageDTO
    {
        public long MessageId { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Content { get; set; }
        public string MessageType { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }

        // Navigation properties
        public UserSimpleDTO Sender { get; set; }
        public UserSimpleDTO Receiver { get; set; }
    }

    public class MessageCreateDTO
    {
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Content { get; set; }
        public string MessageType { get; set; } = "text";
    }

    public class MessageUpdateDTO
    {
        public string Content { get; set; }
        public string MessageType { get; set; }
    }

    public class MarkAsReadDTO
    {
        public bool IsRead { get; set; }
    }

    public class ConversationDTO
    {
        public int UserId1 { get; set; }
        public int UserId2 { get; set; }
        public List<MessageDTO> Messages { get; set; } = new List<MessageDTO>();
    }

    public class UserConversationDTO
    {
        public int OtherUserId { get; set; }
        public string OtherUserName { get; set; }
        public string OtherUserAvatar { get; set; }
        public string LastMessage { get; set; }
        public DateTime? LastMessageTime { get; set; }
        public bool IsRead { get; set; }
        public int UnreadCount { get; set; }
    }
}
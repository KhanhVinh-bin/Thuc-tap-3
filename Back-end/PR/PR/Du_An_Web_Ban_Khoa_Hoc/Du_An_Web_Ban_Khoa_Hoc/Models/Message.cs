using System;
using System.Collections.Generic;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

public partial class Message
{
    public long MessageId { get; set; }

    public int SenderId { get; set; }

    public int ReceiverId { get; set; }

    public string Content { get; set; } = null!;

    public string? MessageType { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsRead { get; set; }

    public virtual User Receiver { get; set; } = null!;

    public virtual User Sender { get; set; } = null!;
}

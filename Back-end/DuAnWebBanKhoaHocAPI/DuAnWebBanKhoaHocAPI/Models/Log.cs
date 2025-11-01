using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.Models;

public partial class Log
{
    public long LogId { get; set; }

    public int? UserId { get; set; }

    public string Action { get; set; } = null!;

    public string? Details { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User? User { get; set; }
}

using System;
using System.Collections.Generic;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

public partial class Admin
{
    public int AdminId { get; set; }

    public string? Permissions { get; set; }

    public DateTime? LastLogin { get; set; }

    public virtual User AdminNavigation { get; set; } = null!;
}

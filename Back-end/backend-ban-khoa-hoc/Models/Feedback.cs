﻿using System;
using System.Collections.Generic;

namespace Du_An_Web_Ban_Khoa_Hoc.Models;

public partial class Feedback
{
    public int FeedbackId { get; set; }

    public int? UserId { get; set; }

    public string? Content { get; set; }

    public byte? Rating { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User? User { get; set; }
}

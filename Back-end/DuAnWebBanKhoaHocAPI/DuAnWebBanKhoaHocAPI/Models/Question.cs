using System;
using System.Collections.Generic;

namespace DuAnWebBanKhoaHocAPI.Models;

public partial class Question
{
    public int QuestionId { get; set; }

    public int AssignmentId { get; set; }

    public string QuestionText { get; set; } = null!;

    public string QuestionType { get; set; } = null!;

    public string? Options { get; set; }

    public string? CorrectAnswer { get; set; }

    public decimal? Points { get; set; }

    public virtual Assignment Assignment { get; set; } = null!;
}

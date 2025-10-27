using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace DuAnWebBanKhoaHocAPI.Models;

public partial class DuAnDbContext : DbContext
{
    public DuAnDbContext()
    {
    }

    public DuAnDbContext(DbContextOptions<DuAnDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Admin> Admins { get; set; }

    public virtual DbSet<Assignment> Assignments { get; set; }

    public virtual DbSet<Banner> Banners { get; set; }

    public virtual DbSet<Cart> Carts { get; set; }

    public virtual DbSet<CartItem> CartItems { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Certificate> Certificates { get; set; }

    public virtual DbSet<Course> Courses { get; set; }

    public virtual DbSet<Enrollment> Enrollments { get; set; }

    public virtual DbSet<EnrollmentLog> EnrollmentLogs { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<File> Files { get; set; }

    public virtual DbSet<Instructor> Instructors { get; set; }

    public virtual DbSet<InstructorProgress> InstructorProgresses { get; set; }

    public virtual DbSet<Lesson> Lessons { get; set; }

    public virtual DbSet<Log> Logs { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<PaymentVerification> PaymentVerifications { get; set; }

    public virtual DbSet<Payout> Payouts { get; set; }

    public virtual DbSet<Progress> Progresses { get; set; }

    public virtual DbSet<Question> Questions { get; set; }

    public virtual DbSet<Report> Reports { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Schedule> Schedules { get; set; }

    public virtual DbSet<Student> Students { get; set; }

    public virtual DbSet<Submission> Submissions { get; set; }

    public virtual DbSet<Tag> Tags { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

   // protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)

     //   => optionsBuilder.UseSqlServer("Server=Nam\\MASTERNNAM;Database=Du_An_Web_Ban_Khoa_hoc000;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(e => e.AdminId).HasName("PK__Admins__719FE4E8E58F54A9");

            entity.Property(e => e.AdminId)
                .ValueGeneratedNever()
                .HasColumnName("AdminID");
            entity.Property(e => e.LastLogin).HasPrecision(3);

            entity.HasOne(d => d.AdminNavigation).WithOne(p => p.Admin)
                .HasForeignKey<Admin>(d => d.AdminId)
                .HasConstraintName("FK_Admins_Users");
        });

        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId).HasName("PK__Assignme__32499E57BB76E77C");

            entity.Property(e => e.AssignmentId).HasColumnName("AssignmentID");
            entity.Property(e => e.CourseId).HasColumnName("CourseID");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.DueDate).HasPrecision(3);
            entity.Property(e => e.MaxScore).HasColumnType("decimal(8, 2)");
            entity.Property(e => e.Title).HasMaxLength(400);

            entity.HasOne(d => d.Course).WithMany(p => p.Assignments)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_Assignments_Courses");
        });

        modelBuilder.Entity<Banner>(entity =>
        {
            entity.HasKey(e => e.BannerId).HasName("PK__Banners__32E86A31CE86EA5D");

            entity.Property(e => e.BannerId).HasColumnName("BannerID");
            entity.Property(e => e.EndDate).HasPrecision(3);
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(2000)
                .HasColumnName("ImageURL");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.LinkUrl)
                .HasMaxLength(2000)
                .HasColumnName("LinkURL");
            entity.Property(e => e.StartDate).HasPrecision(3);
            entity.Property(e => e.Title).HasMaxLength(400);
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.CartId).HasName("PK__Carts__51BCD79733546542");

            entity.Property(e => e.CartId).HasColumnName("CartID");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.Carts)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Carts_Users");
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.CartItemId).HasName("PK__CartItem__488B0B2AC37986CD");

            entity.HasIndex(e => new { e.CartId, e.CourseId }, "UQ_CartItem_CourseInCart").IsUnique();

            entity.Property(e => e.CartItemId).HasColumnName("CartItemID");
            entity.Property(e => e.AddedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.CartId).HasColumnName("CartID");
            entity.Property(e => e.CourseId).HasColumnName("CourseID");
            entity.Property(e => e.Quantity).HasDefaultValue(1);

            entity.HasOne(d => d.Cart).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.CartId)
                .HasConstraintName("FK_CartItems_Carts");

            entity.HasOne(d => d.Course).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_CartItems_Courses");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__19093A2B4ED54282");

            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.CategoryName).HasMaxLength(200);
            entity.Property(e => e.ParentId).HasColumnName("ParentID");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent)
                .HasForeignKey(d => d.ParentId)
                .HasConstraintName("FK_Categories_Parent");
        });

        modelBuilder.Entity<Certificate>(entity =>
        {
            entity.HasKey(e => e.CertificateId).HasName("PK__Certific__BBF8A7E1B0DC0DE0");

            entity.Property(e => e.CertificateId).HasColumnName("CertificateID");
            entity.Property(e => e.CertificateUrl)
                .HasMaxLength(2000)
                .HasColumnName("CertificateURL");
            entity.Property(e => e.CourseId).HasColumnName("CourseID");
            entity.Property(e => e.IssuedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Course).WithMany(p => p.Certificates)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_Certificates_Courses");

            entity.HasOne(d => d.User).WithMany(p => p.Certificates)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Certificates_Users");
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.CourseId).HasName("PK__Courses__C92D7187A0ABE26A");

            entity.HasIndex(e => e.CategoryId, "IX_Courses_CategoryID");

            entity.HasIndex(e => e.InstructorId, "IX_Courses_InstructorID");

            entity.Property(e => e.CourseId).HasColumnName("CourseID");
            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Duration).HasMaxLength(100);
            entity.Property(e => e.InstructorId).HasColumnName("InstructorID");
            entity.Property(e => e.Language)
                .HasMaxLength(50)
                .HasDefaultValue("vi");
            entity.Property(e => e.Level)
                .HasMaxLength(50)
                .HasDefaultValue("beginner");
            entity.Property(e => e.PreviewVideoUrl)
                .HasMaxLength(1000)
                .HasColumnName("PreviewVideoURL");
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("draft");
            entity.Property(e => e.ThumbnailUrl)
                .HasMaxLength(1000)
                .HasColumnName("ThumbnailURL");
            entity.Property(e => e.Title).HasMaxLength(400);
            entity.Property(e => e.UpdatedAt).HasPrecision(3);

            entity.HasOne(d => d.Category).WithMany(p => p.Courses)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Courses_Category");

            entity.HasOne(d => d.Instructor).WithMany(p => p.Courses)
                .HasForeignKey(d => d.InstructorId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Courses_Instructor");

            entity.HasMany(d => d.Tags).WithMany(p => p.Courses)
                .UsingEntity<Dictionary<string, object>>(
                    "CourseTag",
                    r => r.HasOne<Tag>().WithMany()
                        .HasForeignKey("TagId")
                        .HasConstraintName("FK_CourseTags_Tags"),
                    l => l.HasOne<Course>().WithMany()
                        .HasForeignKey("CourseId")
                        .HasConstraintName("FK_CourseTags_Courses"),
                    j =>
                    {
                        j.HasKey("CourseId", "TagId").HasName("PK__CourseTa__1F7ABE236E83C3E2");
                        j.ToTable("CourseTags");
                        j.IndexerProperty<int>("CourseId").HasColumnName("CourseID");
                        j.IndexerProperty<int>("TagId").HasColumnName("TagID");
                    });
        });

        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasKey(e => e.EnrollmentId).HasName("PK__Enrollme__7F6877FB8B349ED6");

            entity.HasIndex(e => e.CourseId, "IX_Enrollments_CourseID");

            entity.HasIndex(e => e.UserId, "IX_Enrollments_UserID");

            entity.HasIndex(e => new { e.CourseId, e.UserId }, "UQ_Enrollment_UserCourse").IsUnique();

            entity.Property(e => e.EnrollmentId).HasColumnName("EnrollmentID");
            entity.Property(e => e.CourseId).HasColumnName("CourseID");
            entity.Property(e => e.EnrollDate)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("active");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Course).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_Enrollments_Courses");

            entity.HasOne(d => d.User).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Enrollments_Users");
        });

        modelBuilder.Entity<EnrollmentLog>(entity =>
        {
            entity.HasKey(e => e.EnrollmentLogId).HasName("PK__Enrollme__405B824178C22204");

            entity.Property(e => e.EnrollmentLogId).HasColumnName("EnrollmentLogID");
            entity.Property(e => e.Action).HasMaxLength(200);
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.EnrollmentId).HasColumnName("EnrollmentID");

            entity.HasOne(d => d.Enrollment).WithMany(p => p.EnrollmentLogs)
                .HasForeignKey(d => d.EnrollmentId)
                .HasConstraintName("FK_EnrollmentLogs_Enrollments");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__6A4BEDF68CDD18AB");

            entity.Property(e => e.FeedbackId).HasColumnName("FeedbackID");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Feedbacks_Users");
        });

        modelBuilder.Entity<File>(entity =>
        {
            entity.HasKey(e => e.FileId).HasName("PK__Files__6F0F989FE1901D56");

            entity.Property(e => e.FileId).HasColumnName("FileID");
            entity.Property(e => e.CourseId).HasColumnName("CourseID");
            entity.Property(e => e.FilePath).HasMaxLength(2000);
            entity.Property(e => e.FileType).HasMaxLength(100);
            entity.Property(e => e.Name).HasMaxLength(400);
            entity.Property(e => e.UploadedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Course).WithMany(p => p.Files)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Files_Courses");

            entity.HasOne(d => d.UploadedByNavigation).WithMany(p => p.Files)
                .HasForeignKey(d => d.UploadedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Files_Users");
        });

        modelBuilder.Entity<Instructor>(entity =>
        {
            entity.HasKey(e => e.InstructorId).HasName("PK__Instruct__9D010B7BFB5B6678");

            entity.Property(e => e.InstructorId)
                .ValueGeneratedNever()
                .HasColumnName("InstructorID");
            entity.Property(e => e.Earnings).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Education).HasMaxLength(1000);
            entity.Property(e => e.Expertise).HasMaxLength(500);
            entity.Property(e => e.FacebookUrl)
                .HasMaxLength(1000)
                .HasColumnName("FacebookURL");
            entity.Property(e => e.LastPayoutDate).HasPrecision(3);
            entity.Property(e => e.LinkedInUrl)
                .HasMaxLength(1000)
                .HasColumnName("LinkedInURL");
            entity.Property(e => e.PayoutAccount).HasMaxLength(500);
            entity.Property(e => e.PayoutMethod).HasMaxLength(100);
            entity.Property(e => e.RatingAverage).HasColumnType("decimal(3, 2)");
            entity.Property(e => e.VerificationStatus)
                .HasMaxLength(50)
                .HasDefaultValue("pending");
            entity.Property(e => e.Xurl)
                .HasMaxLength(1000)
                .HasColumnName("XURL");
            entity.Property(e => e.YouTubeUrl)
                .HasMaxLength(1000)
                .HasColumnName("YouTubeURL");

            entity.HasOne(d => d.InstructorNavigation).WithOne(p => p.Instructor)
                .HasForeignKey<Instructor>(d => d.InstructorId)
                .HasConstraintName("FK_Instructors_Users");
        });

        modelBuilder.Entity<InstructorProgress>(entity =>
        {
            entity.HasKey(e => e.InstructorProgressId).HasName("PK__Instruct__8838A632417A1858");

            entity.ToTable("InstructorProgress");

            entity.HasIndex(e => new { e.InstructorId, e.CourseId }, "UQ_InstructorCourse").IsUnique();

            entity.Property(e => e.InstructorProgressId).HasColumnName("InstructorProgressID");
            entity.Property(e => e.CourseId).HasColumnName("CourseID");
            entity.Property(e => e.InstructorId).HasColumnName("InstructorID");
            entity.Property(e => e.UpdatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Course).WithMany(p => p.InstructorProgresses)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_InstructorProgress_Courses");

            entity.HasOne(d => d.Instructor).WithMany(p => p.InstructorProgresses)
                .HasForeignKey(d => d.InstructorId)
                .HasConstraintName("FK_InstructorProgress_Instructors");
        });

        modelBuilder.Entity<Lesson>(entity =>
        {
            entity.HasKey(e => e.LessonId).HasName("PK__Lessons__B084ACB0816A067C");

            entity.HasIndex(e => new { e.CourseId, e.SortOrder }, "IX_Lessons_CourseID_Sort");

            entity.Property(e => e.LessonId).HasColumnName("LessonID");
            entity.Property(e => e.ContentType).HasMaxLength(50);
            entity.Property(e => e.CourseId).HasColumnName("CourseID");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.FileId).HasColumnName("FileID");
            entity.Property(e => e.Title).HasMaxLength(400);
            entity.Property(e => e.VideoUrl)
                .HasMaxLength(1000)
                .HasColumnName("VideoURL");

            entity.HasOne(d => d.Course).WithMany(p => p.Lessons)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Lessons_Courses");

            entity.HasOne(d => d.File).WithMany(p => p.Lessons)
                .HasForeignKey(d => d.FileId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Lessons_Files");
        });

        modelBuilder.Entity<Log>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("PK__Logs__5E5499A842B08804");

            entity.Property(e => e.LogId).HasColumnName("LogID");
            entity.Property(e => e.Action).HasMaxLength(200);
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.Logs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Logs_Users");
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.MessageId).HasName("PK__Messages__C87C037C194C4AAC");

            entity.Property(e => e.MessageId).HasColumnName("MessageID");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.MessageType).HasMaxLength(50);
            entity.Property(e => e.ReceiverId).HasColumnName("ReceiverID");
            entity.Property(e => e.SenderId).HasColumnName("SenderID");

            entity.HasOne(d => d.Receiver).WithMany(p => p.MessageReceivers)
                .HasForeignKey(d => d.ReceiverId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Messages_Receiver");

            entity.HasOne(d => d.Sender).WithMany(p => p.MessageSenders)
                .HasForeignKey(d => d.SenderId)
                .HasConstraintName("FK_Messages_Sender");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__C3905BAF9E5DA03B");

            entity.HasIndex(e => e.UserId, "IX_Orders_UserID");

            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.OrderDate)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("pending");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Orders_Users");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__OrderDet__D3B9D30C5A590E3F");

            entity.Property(e => e.OrderDetailId).HasColumnName("OrderDetailID");
            entity.Property(e => e.CourseId).HasColumnName("CourseID");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Quantity).HasDefaultValue(1);

            entity.HasOne(d => d.Course).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_OrderDetails_Courses");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_OrderDetails_Orders");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payments__9B556A58AB23B731");

            entity.HasIndex(e => e.TransactionId, "IX_Payments_TransactionID");

            entity.Property(e => e.PaymentId).HasColumnName("PaymentID");
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.PaidAt).HasPrecision(3);
            entity.Property(e => e.PaymentMethod).HasMaxLength(100);
            entity.Property(e => e.PaymentStatus)
                .HasMaxLength(50)
                .HasDefaultValue("pending");
            entity.Property(e => e.TransactionId)
                .HasMaxLength(200)
                .HasColumnName("TransactionID");

            entity.HasOne(d => d.Order).WithMany(p => p.Payments)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Payments_Orders");
        });

        modelBuilder.Entity<PaymentVerification>(entity =>
        {
            entity.HasKey(e => e.VerificationId).HasName("PK__PaymentV__306D492776B80701");

            entity.Property(e => e.VerificationId).HasColumnName("VerificationID");
            entity.Property(e => e.PaymentId).HasColumnName("PaymentID");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("verified");
            entity.Property(e => e.VerifiedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Payment).WithMany(p => p.PaymentVerifications)
                .HasForeignKey(d => d.PaymentId)
                .HasConstraintName("FK_PaymentVerifications_Payments");

            entity.HasOne(d => d.VerifiedByNavigation).WithMany(p => p.PaymentVerifications)
                .HasForeignKey(d => d.VerifiedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_PaymentVerifications_Admins");
        });

        modelBuilder.Entity<Payout>(entity =>
        {
            entity.HasKey(e => e.PayoutId).HasName("PK__Payouts__35C3DFAE8C623531");

            entity.Property(e => e.PayoutId).HasColumnName("PayoutID");
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.InstructorId).HasColumnName("InstructorID");
            entity.Property(e => e.NetAmount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.PlatformFee).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ProcessedAt).HasPrecision(3);
            entity.Property(e => e.RequestedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("pending");

            entity.HasOne(d => d.Instructor).WithMany(p => p.Payouts)
                .HasForeignKey(d => d.InstructorId)
                .HasConstraintName("FK_Payouts_Instructors");
        });

        modelBuilder.Entity<Progress>(entity =>
        {
            entity.HasKey(e => e.ProgressId).HasName("PK__Progress__BAE29C8574C820F2");

            entity.ToTable("Progress");

            entity.HasIndex(e => new { e.EnrollmentId, e.LessonId }, "UQ_Progress_EnrollLesson").IsUnique();

            entity.Property(e => e.ProgressId).HasColumnName("ProgressID");
            entity.Property(e => e.CompletedAt).HasPrecision(3);
            entity.Property(e => e.EnrollmentId).HasColumnName("EnrollmentID");
            entity.Property(e => e.LessonId).HasColumnName("LessonID");

            entity.HasOne(d => d.Enrollment).WithMany(p => p.Progresses)
                .HasForeignKey(d => d.EnrollmentId)
                .HasConstraintName("FK_Progress_Enrollments");

            entity.HasOne(d => d.Lesson).WithMany(p => p.Progresses)
                .HasForeignKey(d => d.LessonId)
                .HasConstraintName("FK_Progress_Lessons");
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.QuestionId).HasName("PK__Question__0DC06F8CCFFA758C");

            entity.Property(e => e.QuestionId).HasColumnName("QuestionID");
            entity.Property(e => e.AssignmentId).HasColumnName("AssignmentID");
            entity.Property(e => e.Points).HasColumnType("decimal(8, 2)");
            entity.Property(e => e.QuestionType).HasMaxLength(50);

            entity.HasOne(d => d.Assignment).WithMany(p => p.Questions)
                .HasForeignKey(d => d.AssignmentId)
                .HasConstraintName("FK_Questions_Assignments");
        });

        modelBuilder.Entity<Report>(entity =>
        {
            entity.HasKey(e => e.ReportId).HasName("PK__Reports__D5BD48E5CC3728F5");

            entity.Property(e => e.ReportId).HasColumnName("ReportID");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.ReportType).HasMaxLength(200);

            entity.HasOne(d => d.GeneratedByNavigation).WithMany(p => p.Reports)
                .HasForeignKey(d => d.GeneratedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Reports_Admins");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK__Reviews__74BC79AE8655A581");

            entity.HasIndex(e => e.CourseId, "IX_Reveiws_CourseID");

            entity.Property(e => e.ReviewId).HasColumnName("ReviewID");
            entity.Property(e => e.CourseId).HasColumnName("CourseID");
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Course).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_Reviews_Courses");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Reviews_Users");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE3A969CCCDB");

            entity.HasIndex(e => e.RoleName, "UQ__Roles__8A2B61606F977E83").IsUnique();

            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.RoleName).HasMaxLength(50);
        });

        modelBuilder.Entity<Schedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId).HasName("PK__Schedule__9C8A5B69C41E0B3D");

            entity.Property(e => e.ScheduleId).HasColumnName("ScheduleID");
            entity.Property(e => e.CourseId).HasColumnName("CourseID");
            entity.Property(e => e.EndTime).HasPrecision(3);
            entity.Property(e => e.InstructorId).HasColumnName("InstructorID");
            entity.Property(e => e.MeetingLink).HasMaxLength(2000);
            entity.Property(e => e.StartTime).HasPrecision(3);
            entity.Property(e => e.Type).HasMaxLength(50);

            entity.HasOne(d => d.Course).WithMany(p => p.Schedules)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Schedules_Courses");

            entity.HasOne(d => d.Instructor).WithMany(p => p.Schedules)
                .HasForeignKey(d => d.InstructorId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Schedules_Instructors");
        });

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.StudentId).HasName("PK__Students__32C52A799EE99CD7");

            entity.Property(e => e.StudentId)
                .ValueGeneratedNever()
                .HasColumnName("StudentID");
            entity.Property(e => e.LastActive).HasPrecision(3);

            entity.HasOne(d => d.StudentNavigation).WithOne(p => p.Student)
                .HasForeignKey<Student>(d => d.StudentId)
                .HasConstraintName("FK_Students_Users");
        });

        modelBuilder.Entity<Submission>(entity =>
        {
            entity.HasKey(e => e.SubmissionId).HasName("PK__Submissi__449EE105D21E0021");

            entity.Property(e => e.SubmissionId).HasColumnName("SubmissionID");
            entity.Property(e => e.AssignmentId).HasColumnName("AssignmentID");
            entity.Property(e => e.FileId).HasColumnName("FileID");
            entity.Property(e => e.GradedAt).HasPrecision(3);
            entity.Property(e => e.Score).HasColumnType("decimal(8, 2)");
            entity.Property(e => e.SubmittedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Assignment).WithMany(p => p.Submissions)
                .HasForeignKey(d => d.AssignmentId)
                .HasConstraintName("FK_Submissions_Assignments");

            entity.HasOne(d => d.File).WithMany(p => p.Submissions)
                .HasForeignKey(d => d.FileId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Submissions_Files");

            entity.HasOne(d => d.User).WithMany(p => p.Submissions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Submissions_Users");
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.TagId).HasName("PK__Tags__657CFA4CA067C091");

            entity.HasIndex(e => e.Slug, "UQ__Tags__BC7B5FB6F3C83CBB").IsUnique();

            entity.Property(e => e.TagId).HasColumnName("TagID");
            entity.Property(e => e.Slug).HasMaxLength(200);
            entity.Property(e => e.TagName).HasMaxLength(200);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC6D5C8209");

            entity.HasIndex(e => e.Email, "IX_Users_Email");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534BC344496").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.Address).HasMaxLength(255);
            entity.Property(e => e.AvatarUrl)
                .HasMaxLength(1000)
                .HasColumnName("AvatarURL");
            entity.Property(e => e.Bio).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.FullName).HasMaxLength(200);
            entity.Property(e => e.Gender).HasMaxLength(20);
            entity.Property(e => e.PasswordHash).HasMaxLength(512);
            entity.Property(e => e.PhoneNumber).HasMaxLength(50);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("active");
            entity.Property(e => e.UpdatedAt).HasPrecision(3);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.RoleId }).HasName("PK__UserRole__AF27604FD96142EA");

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.AssignedAt)
                .HasPrecision(3)
                .HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Role).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK_UserRoles_Roles");

            entity.HasOne(d => d.User).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_UserRoles_Users");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

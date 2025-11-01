create database Du_An_Web_Ban_Khoa_hoc 
use Du_An_Web_Ban_Khoa_hoc 

-- Bảng User dùng chung (admin, giảng viên, học viên )
CREATE TABLE dbo.Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(512) NOT NULL,
    FullName NVARCHAR(200) NOT NULL,
    PhoneNumber NVARCHAR(50) NULL,
	Address Nvarchar(255) NULL,
    AvatarURL NVARCHAR(1000) NULL,
    DateOfBirth DATE NULL,
    Gender NVARCHAR(20) NULL,
    Bio NVARCHAR(2000) NULL, -- Giới thiệu 
    Status NVARCHAR(50) NOT NULL DEFAULT('active'), -- active, banned, pending ( trạng thái )
    CreatedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NULL
);

-- Bảng phân quyền
CREATE TABLE dbo.Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE -- student, instructor, admin
);

-- Bảng liên kết phân quyền ( Users-Roles ) 
CREATE TABLE dbo.UserRoles (
    UserID INT NOT NULL,
    RoleID INT NOT NULL,
    AssignedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),-- Thời điểm gán quyền
    PRIMARY KEY (UserID, RoleID),
    CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RoleID) REFERENCES dbo.Roles(RoleID) ON DELETE CASCADE
);


-- Add dữ liệu (Roles)
INSERT INTO dbo.Roles (RoleName) VALUES ('student'), ('instructor'), ('admin');



-- Bảng học viên 
CREATE TABLE dbo.Students (
    StudentID INT PRIMARY KEY, -- equals UserID
    EnrollmentCount INT NOT NULL DEFAULT 0, -- số khóa đã học
    CompletedCourses INT NOT NULL DEFAULT 0,-- số khóa học đã hoàn thành 
    TotalCertificates INT NOT NULL DEFAULT 0, -- Tổng các chứng chỉ đạt được 
    LastActive DATETIME2(3) NULL,
    CONSTRAINT FK_Students_Users FOREIGN KEY (StudentID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
);


-- Bảng giảng viên 
CREATE TABLE dbo.Instructors (
    InstructorID INT PRIMARY KEY, 
    Expertise NVARCHAR(500) NULL,                  -- Kỹ năng chuyên môn 
    Biography NVARCHAR(MAX) NULL,                  -- Giới thiệu chi tiết
    ExperienceYears INT NULL, 
    Education NVARCHAR(1000) NULL,                 -- Học vấn 
    Certifications NVARCHAR(MAX) NULL,             -- Chứng chỉ giảng dạy 
    RatingAverage DECIMAL(3,2) NULL CHECK (RatingAverage BETWEEN 0 AND 5), -- Điểm đánh giá trung bình
    TotalStudents INT NOT NULL DEFAULT 0,          -- Tổng số học viên
    TotalCourses INT NOT NULL DEFAULT 0,           -- Tổng số khóa học đã tạo
    Earnings DECIMAL(18,2) NOT NULL DEFAULT 0.00,  -- Tổng thu nhập
    PayoutMethod NVARCHAR(100) NULL, 
    PayoutAccount NVARCHAR(500) NULL,
    VerificationStatus NVARCHAR(50) NOT NULL DEFAULT('pending'), -- pending, verified, rejected
    LastPayoutDate DATETIME2(3) NULL,

    -- Bổ sung
    LinkedInURL NVARCHAR(1000) NULL,   -- Link LinkedIn
    FacebookURL NVARCHAR(1000) NULL,   -- Link Facebook
    YouTubeURL NVARCHAR(1000) NULL,    -- Link kênh YouTube
    XURL NVARCHAR(1000) NULL,          -- Link X (Twitter)

    CONSTRAINT FK_Instructors_Users FOREIGN KEY (InstructorID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
);

-- Bảng Admins
CREATE TABLE dbo.Admins (
    AdminID INT PRIMARY KEY, -- equals UserID
    Permissions NVARCHAR(MAX) NULL, -- có thể bật/tắt quyền truy cập module
    LastLogin DATETIME2(3) NULL,
    CONSTRAINT FK_Admins_Users FOREIGN KEY (AdminID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
);


-- Bảng danh mục ( phân theo ngành/lĩnh vực )
CREATE TABLE dbo.Categories ( 
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,   -- Mỗi category có một ID duy nhất
    CategoryName NVARCHAR(200) NOT NULL,        -- Tên danh mục (VD: Lập trình)
    ParentID INT NULL,                          -- Khóa ngoại tự tham chiếu
    CONSTRAINT FK_Categories_Parent FOREIGN KEY (ParentID) REFERENCES dbo.Categories(CategoryID)   -- Liên kết tới chính CategoryID
);


CREATE TABLE dbo.Tags (
    TagID INT IDENTITY(1,1) PRIMARY KEY,
    TagName NVARCHAR(200) NOT NULL,    -- Tên tag ( thuộc ngành )
    Slug NVARCHAR(200) NOT NULL UNIQUE -- đường dẫn 
);

-- Bảng khóa học 
CREATE TABLE dbo.Courses (
    CourseID INT IDENTITY(1,1) PRIMARY KEY,

    Title NVARCHAR(400) NOT NULL,                -- Tiêu đề khóa học
    Description NVARCHAR(MAX) NULL,              -- Mô tả chi tiết
    Price DECIMAL(18,2) NOT NULL DEFAULT 0.00,   -- Giá bán
    ThumbnailURL NVARCHAR(1000) NULL,            -- Ảnh đại diện
    PreviewVideoURL NVARCHAR(1000) NULL,         -- Video giới thiệu
    
    InstructorID INT NULL,                   -- Giảng viên
    CategoryID INT NULL,                         -- Thuộc danh mục nào

    Language NVARCHAR(50) NOT NULL DEFAULT 'vi', -- Ngôn ngữ (vi, en...)
    Duration NVARCHAR(100) NULL,                 -- Thời lượng 
    Level NVARCHAR(50) NOT NULL DEFAULT 'beginner', -- Cấp độ: beginner, intermediate, advanced
    Prerequisites NVARCHAR(MAX) NULL,            -- Yêu cầu tiên quyết (JSON/Text)
    LearningOutcomes NVARCHAR(MAX) NULL,         -- Kết quả học tập (JSON/Text liệt kê)

    Status NVARCHAR(50) NOT NULL DEFAULT('draft'), -- Trạng thái: draft, published, archived

    CreatedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(), -- Ngày tạo
    UpdatedAt DATETIME2(3) NULL,                               -- Ngày cập nhật

   CONSTRAINT FK_Courses_Instructor FOREIGN KEY (InstructorID) REFERENCES dbo.Instructors(InstructorID) ON DELETE SET NULL,
    CONSTRAINT FK_Courses_Category FOREIGN KEY (CategoryID) REFERENCES dbo.Categories(CategoryID) ON DELETE SET NULL
);


CREATE TABLE dbo.CourseTags (
    CourseID INT NOT NULL,
    TagID INT NOT NULL,
    PRIMARY KEY (CourseID, TagID), -- Khóa chính ghép
    CONSTRAINT FK_CourseTags_Courses FOREIGN KEY (CourseID) REFERENCES dbo.Courses(CourseID) ON DELETE CASCADE,
    CONSTRAINT FK_CourseTags_Tags FOREIGN KEY (TagID) REFERENCES dbo.Tags(TagID) ON DELETE CASCADE
);


-- Bảng bài học 
CREATE TABLE dbo.Lessons (
    LessonID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NULL,         
    Title NVARCHAR(400) NOT NULL,         -- Tiêu đề  
    ContentType NVARCHAR(50) NOT NULL,    -- Loại nội dung: video, pdf, text
    VideoURL NVARCHAR(1000) NULL,        
    FileID INT NULL,                      -- file đính kèm ( nếu có )
    DurationSec INT NULL,                 -- Thời lượng (tính bằng giây)
    SortOrder INT NOT NULL DEFAULT 0,     -- Thứ tự trong khóa học
    CreatedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Lessons_Courses FOREIGN KEY (CourseID) REFERENCES dbo.Courses(CourseID) ON DELETE SET NULL,
	CONSTRAINT FK_Lessons_Files FOREIGN KEY (FileID) REFERENCES dbo.Files(FileID) ON DELETE SET NULL

);

-- Bảng lưu trữ tài nguyên 
CREATE TABLE dbo.Files (
    FileID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NULL,                    
    Name NVARCHAR(400) NOT NULL,		-- Tên file 
    FilePath NVARCHAR(2000) NOT NULL,     -- Đường dẫn file
    FileType NVARCHAR(100) NULL,          -- Loại : pdf, mp4, docx
    FileSizeBigint BIGINT NULL,           -- dung lượng
    UploadedBy INT NULL,                  -- ai upload
    UploadedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Files_Courses FOREIGN KEY (CourseID) REFERENCES dbo.Courses(CourseID) ON DELETE SET NULL,
    CONSTRAINT FK_Files_Users FOREIGN KEY (UploadedBy) REFERENCES dbo.Users(UserID) ON DELETE SET NULL
);

-- Bảng tuyển sinh ( đăng ký khóa học )
CREATE TABLE dbo.Enrollments (
    EnrollmentID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NOT NULL,
    UserID INT NOT NULL, -- student
    EnrollDate DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(), -- Ngày đăng ký 
    Status NVARCHAR(50) NOT NULL DEFAULT('active'), -- Trạng thái: active, completed, cancelled
    CONSTRAINT UQ_Enrollment_UserCourse UNIQUE (CourseID, UserID),
    CONSTRAINT FK_Enrollments_Courses FOREIGN KEY (CourseID) REFERENCES dbo.Courses(CourseID) ON DELETE CASCADE,
    CONSTRAINT FK_Enrollments_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
);

-- Bảng tiến độ 
CREATE TABLE dbo.Progress (
    ProgressID INT IDENTITY(1,1) PRIMARY KEY,
    EnrollmentID INT NOT NULL,          -- thuộc về lần đăng ký
    LessonID INT NOT NULL,              -- bài học nào
    IsCompleted BIT NOT NULL DEFAULT 0, -- đã học xong chưa
    CompletedAt DATETIME2(3) NULL,      -- thời điểm hoàn thành
    CONSTRAINT FK_Progress_Enrollments FOREIGN KEY (EnrollmentID) REFERENCES dbo.Enrollments(EnrollmentID) ON DELETE CASCADE,
    CONSTRAINT FK_Progress_Lessons FOREIGN KEY (LessonID) REFERENCES dbo.Lessons(LessonID) ON DELETE CASCADE,
    CONSTRAINT UQ_Progress_EnrollLesson UNIQUE (EnrollmentID, LessonID)
);

-- Bảng bài tập 
CREATE TABLE dbo.Assignments (
    AssignmentID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NOT NULL,
    Title NVARCHAR(400) NOT NULL, -- Tiêu đề 
    Description NVARCHAR(MAX) NULL,
    DueDate DATETIME2(3) NULL, -- Ngày đến hạn 
    MaxScore DECIMAL(8,2) NOT NULL CHECK (MaxScore <= 10.00), -- Điểm tối đa 
    CreatedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Assignments_Courses FOREIGN KEY (CourseID) REFERENCES dbo.Courses(CourseID) ON DELETE CASCADE
);

-- Bảng câu hỏi ( trong Assignments )
CREATE TABLE dbo.Questions (
    QuestionID INT IDENTITY(1,1) PRIMARY KEY, 
    AssignmentID INT NOT NULL,                -- Liên kết đến bài tập
    QuestionText NVARCHAR(MAX) NOT NULL,      -- Nội dung câu hỏi
    QuestionType NVARCHAR(50) NOT NULL,       -- Loại câu hỏi (MCQ, Essay)
    Options NVARCHAR(MAX) NULL,               -- Nếu là MCQ thì lưu JSON đáp án
    CorrectAnswer NVARCHAR(MAX) NULL,         -- Đáp án đúng (text hoặc JSON)
    Points DECIMAL(8,2) NULL,                 -- Số điểm cho câu hỏi này
    CONSTRAINT FK_Questions_Assignments FOREIGN KEY (AssignmentID) REFERENCES dbo.Assignments(AssignmentID) ON DELETE CASCADE
);

-- Bảng bài nộp ( của học viên )
CREATE TABLE dbo.Submissions (
    SubmissionID INT IDENTITY(1,1) PRIMARY KEY,  
    AssignmentID INT NOT NULL,                   -- Liên kết đến Assignment
    UserID INT NOT NULL,                         
    Answer NVARCHAR(MAX) NULL,					 -- Câu trả lời 
    FileID INT NULL,                             -- Nếu upload file thì tham chiếu đến bảng Files
    Score DECIMAL(8,2) CHECK (Score <= 10.00),    -- Điểm của bài nộp
    SubmittedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(), -- Thời gian nộp
    GradedAt DATETIME2(3) NULL,                  -- Thời gian chấm
    GradedBy INT NULL,                           -- Người chấm (Admin hoặc Instructor)
    CONSTRAINT FK_Submissions_Assignments FOREIGN KEY (AssignmentID) REFERENCES dbo.Assignments(AssignmentID) ON DELETE CASCADE,
    CONSTRAINT FK_Submissions_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE,
    CONSTRAINT FK_Submissions_Files FOREIGN KEY (FileID) REFERENCES dbo.Files(FileID) ON DELETE SET NULL
);

-- Bảng chứng chỉ 
CREATE TABLE dbo.Certificates (
    CertificateID INT IDENTITY(1,1) PRIMARY KEY,  
    UserID INT NOT NULL,                          -- Người nhận chứng chỉ (Student)
    CourseID INT NOT NULL,                        -- Khóa học đã hoàn thành
    CertificateURL NVARCHAR(2000) NULL,           -- Link file chứng chỉ (PDF/JPG)
    IssuedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(), -- Ngày cấp chứng chỉ
    CONSTRAINT FK_Certificates_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE,
    CONSTRAINT FK_Certificates_Courses FOREIGN KEY (CourseID) REFERENCES dbo.Courses(CourseID) ON DELETE CASCADE
);

-- Bảng đánh giá khóa học 
CREATE TABLE dbo.Reviews (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,   
    CourseID INT NOT NULL,                    -- Khóa học được đánh giá
    UserID INT NOT NULL,                      -- Học viên đánh giá
    Rating TINYINT NOT NULL CHECK (Rating BETWEEN 1 AND 5), -- 1–5 sao
    Comment NVARCHAR(MAX) NULL,               -- Nội dung bình luận
    CreatedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(), -- Thời gian đánh giá
    CONSTRAINT FK_Reviews_Courses FOREIGN KEY (CourseID) REFERENCES dbo.Courses(CourseID) ON DELETE CASCADE,
    CONSTRAINT FK_Reviews_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
);



CREATE TABLE dbo.Carts (
    CartID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    CreatedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Carts_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
);


CREATE TABLE dbo.CartItems (
    CartItemID INT IDENTITY(1,1) PRIMARY KEY, -- Sản phẩm trong giỏ hàng
    CartID INT NOT NULL,                      -- Giỏ hàng nào
    CourseID INT NOT NULL,                    -- Khóa học nào
    Quantity INT NOT NULL DEFAULT 1,          -- Số lượng (mặc định 1 vì khóa học không mua nhiều bản)
    AddedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(), -- Thời điểm thêm vào
    CONSTRAINT UQ_CartItem_CourseInCart UNIQUE (CartID, CourseID), -- Một giỏ không thể chứa cùng 1 khóa học nhiều lần
    CONSTRAINT FK_CartItems_Carts FOREIGN KEY (CartID) REFERENCES dbo.Carts(CartID) ON DELETE CASCADE,
    CONSTRAINT FK_CartItems_Courses FOREIGN KEY (CourseID) REFERENCES dbo.Courses(CourseID) ON DELETE CASCADE
);


-- Bảng đơn hàng 
CREATE TABLE dbo.Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,    
    UserID INT NULL,                      
    OrderDate DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(), 
    TotalAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00, -- Tổng tiền
    Status NVARCHAR(50) NOT NULL DEFAULT 'pending', -- Trạng thái: pending/paid/cancelled/refunded
    Notes NVARCHAR(MAX) NULL,                 -- Ghi chú
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE SET NULL
);


CREATE TABLE dbo.OrderDetails (
    OrderDetailID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL,                     
    CourseID INT NOT NULL,                    -- Khóa học
    Price DECIMAL(18,2) NOT NULL,             -- Giá lúc mua
    Quantity INT NOT NULL DEFAULT 1,          -- Số lượng ( mặc định là 1 )
    CONSTRAINT FK_OrderDetails_Orders FOREIGN KEY (OrderID) REFERENCES dbo.Orders(OrderID) ON DELETE CASCADE,
    CONSTRAINT FK_OrderDetails_Courses FOREIGN KEY (CourseID) REFERENCES dbo.Courses(CourseID) ON DELETE CASCADE
);

-- Bảng lưu kết quả thanh toán 
CREATE TABLE dbo.Payments (
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NULL,                         -- Liên kết đến đơn hàng
    PaymentMethod NVARCHAR(100) NOT NULL,     -- Phương tiện thanh toán 
    TransactionID NVARCHAR(200) NULL,         -- Mã giao dịch từ cổng thanh toán
    Amount DECIMAL(18,2) NOT NULL,            -- Số tiền
    PaymentStatus NVARCHAR(50) NOT NULL DEFAULT 'pending', -- pending/success/failed
    PaidAt DATETIME2(3) NULL,                 -- Thời gian thanh toán
    RawResponse NVARCHAR(MAX) NULL,           -- Lưu JSON raw từ cổng thanh toán
    CONSTRAINT FK_Payments_Orders FOREIGN KEY (OrderID) REFERENCES dbo.Orders(OrderID) ON DELETE SET NULL
);


CREATE TABLE dbo.PaymentVerifications (
    VerificationID INT IDENTITY(1,1) PRIMARY KEY,
    PaymentID INT NOT NULL,                   -- Thanh toán nào
    VerifiedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    VerifiedBy INT NULL,                      -- Admin xác minh
    Status NVARCHAR(50) NOT NULL DEFAULT 'verified', -- verified/rejected
    Notes NVARCHAR(MAX) NULL,                 -- Ghi chú
    CONSTRAINT FK_PaymentVerifications_Payments FOREIGN KEY (PaymentID) REFERENCES dbo.Payments(PaymentID) ON DELETE CASCADE,
    CONSTRAINT FK_PaymentVerifications_Admins FOREIGN KEY (VerifiedBy) REFERENCES dbo.Users(UserID) ON DELETE SET NULL
);

-- Bảng Dòng tiền ra ( dành cho giảng viên muốn rút tiền )
CREATE TABLE dbo.Payouts (
    PayoutID INT IDENTITY(1,1) PRIMARY KEY,
    InstructorID INT NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    RequestedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    ProcessedAt DATETIME2(3) NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'pending', -- pending/paid/rejected
	PlatformFee DECIMAL(18,2) NOT NULL DEFAULT 0.00, -- Hoa hồng trang web
	NetAmount DECIMAL(18,2) NOT NULL,               -- Số tiền thực nhận sau khi trừ fee
	Notes NVARCHAR(MAX) NULL                        -- Ghi chú admin

    CONSTRAINT FK_Payouts_Instructors FOREIGN KEY (InstructorID) REFERENCES dbo.Instructors(InstructorID) ON DELETE CASCADE
);


CREATE TABLE dbo.Banners (
    BannerID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(400) NULL,                 -- Tiêu đề banner
    ImageURL NVARCHAR(2000) NULL,             -- Link ảnh
    LinkURL NVARCHAR(2000) NULL,              -- Link đích khi click
    SortOrder INT NOT NULL DEFAULT 0,         -- Thứ tự sắp xếp
    IsActive BIT NOT NULL DEFAULT 1,          -- Có đang hiển thị không
    StartDate DATETIME2(3) NULL,              -- Ngày bắt đầu
    EndDate DATETIME2(3) NULL                 -- Ngày kết thúc
);

-- Bảng lịch học 
CREATE TABLE dbo.Schedules (
    ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NULL,
    InstructorID INT NULL,
    StartTime DATETIME2(3) NOT NULL,
    EndTime DATETIME2(3) NULL,
    Type NVARCHAR(50) NULL,                   -- Hình thức học: 
    MeetingLink NVARCHAR(2000) NULL,          -- Link
    CONSTRAINT FK_Schedules_Courses FOREIGN KEY (CourseID) REFERENCES dbo.Courses(CourseID) ON DELETE CASCADE,
    CONSTRAINT FK_Schedules_Instructors FOREIGN KEY (InstructorID) REFERENCES dbo.Instructors(InstructorID) ON DELETE SET NULL
);

-- Bảng nhật ký hoạt động ( bảng chung )
CREATE TABLE dbo.Logs (
    LogID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NULL,
    Action NVARCHAR(200) NOT NULL,            -- Hành động 
    Details NVARCHAR(MAX) NULL,               -- Mô tả chi tiết (JSON/text)
    CreatedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Logs_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE SET NULL
);


CREATE TABLE dbo.EnrollmentLogs (
    EnrollmentLogID INT IDENTITY(1,1) PRIMARY KEY,
    EnrollmentID INT NOT NULL,
    Action NVARCHAR(200) NOT NULL,            -- Hành động (enrolled, cancelled)
    Details NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_EnrollmentLogs_Enrollments FOREIGN KEY (EnrollmentID) REFERENCES dbo.Enrollments(EnrollmentID) ON DELETE CASCADE
);

-- Bảng lưu báo cáo (ví dụ: doanh thu tháng, số lượng học viên).
CREATE TABLE dbo.Reports (
    ReportID INT IDENTITY(1,1) PRIMARY KEY,
    ReportType NVARCHAR(200) NOT NULL,        -- Loại báo cáo
    GeneratedBy INT NULL,                     -- Ai tạo (Admin)
    ReportData NVARCHAR(MAX) NULL,            -- JSON dữ liệu
    CreatedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Reports_Admins FOREIGN KEY (GeneratedBy) REFERENCES dbo.Users(UserID) ON DELETE SET NULL
);

-- Feedback tự do từ người dùng (không gắn vào khóa học).
CREATE TABLE dbo.Feedbacks (
    FeedbackID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NULL,
    Content NVARCHAR(MAX) NULL,               -- Nội dung feedback
    Rating TINYINT NULL,                      -- Nếu muốn cho điểm
    CreatedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Feedbacks_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE SET NULL
);

-- Giúp giảng viên theo dõi tiến độ học tập của học viên.
CREATE TABLE dbo.InstructorProgress (
    InstructorProgressID INT IDENTITY(1,1) PRIMARY KEY,
    InstructorID INT NOT NULL,
    CourseID INT NOT NULL,
    StudentCompleted INT NOT NULL DEFAULT 0,  -- Học viên đã hoàn thành
    TotalStudents INT NOT NULL DEFAULT 0,     -- Tổng số học viên
    UpdatedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_InstructorProgress_Instructors FOREIGN KEY (InstructorID) REFERENCES dbo.Instructors(InstructorID) ON DELETE CASCADE,
    CONSTRAINT FK_InstructorProgress_Courses FOREIGN KEY (CourseID) REFERENCES dbo.Courses(CourseID) ON DELETE CASCADE,
    CONSTRAINT UQ_InstructorCourse UNIQUE (InstructorID, CourseID) -- Một instructor chỉ có 1 dòng cho mỗi khóa học
);


CREATE TABLE dbo.Messages (
    MessageID BIGINT IDENTITY(1,1) PRIMARY KEY,
    SenderID INT NOT NULL,                    -- Người gửi
    ReceiverID INT NOT NULL,                  -- Người nhận
    Content NVARCHAR(MAX) NOT NULL,           -- Nội dung
    MessageType NVARCHAR(50) NULL,            -- text/file/image
    CreatedAt DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    IsRead BIT NOT NULL DEFAULT 0,            -- 0 = chưa đọc, 1 = đã đọc
   CONSTRAINT FK_Messages_Sender FOREIGN KEY (SenderID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE,
	CONSTRAINT FK_Messages_Receiver FOREIGN KEY (ReceiverID) REFERENCES dbo.Users(UserID) ON DELETE NO ACTION -- Khi xóa User, chỉ các tin nhắn mà User đó là Sender(người gửi)->bị xóa. Nếu User là Receiver(người nhận)->tin nhắn sẽ vẫn còn (có thể để lại orphan record).
);


-- Indexes on frequently queried columns ( truy vấn bảng nhanh hơn )
CREATE INDEX IX_Users_Email ON dbo.Users(Email);
CREATE INDEX IX_Courses_InstructorID ON dbo.Courses(InstructorID);
CREATE INDEX IX_Courses_CategoryID ON dbo.Courses(CategoryID);
CREATE INDEX IX_Lessons_CourseID_Sort ON dbo.Lessons(CourseID, SortOrder);
CREATE INDEX IX_Enrollments_UserID ON dbo.Enrollments(UserID);
CREATE INDEX IX_Enrollments_CourseID ON dbo.Enrollments(CourseID);
CREATE INDEX IX_Payments_TransactionID ON dbo.Payments(TransactionID);
CREATE INDEX IX_Orders_UserID ON dbo.Orders(UserID);
CREATE INDEX IX_Reveiws_CourseID ON dbo.Reviews(CourseID);


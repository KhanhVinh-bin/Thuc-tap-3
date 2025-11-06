// API service for instructor-related endpoints
const API_URL = "https://localhost:5000/api";

// Get instructor's courses with statistics
export const getInstructorCourses = async (token) => {
  // Validate token
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  // Kiểm tra token không phải demo token
  if (typeof token === 'string' && token.startsWith('demo_token_')) {
    throw new Error("Token không hợp lệ. Vui lòng đăng nhập qua trang login chính thức.");
  }

  try {
    console.log("📤 GET Request to:", `${API_URL}/Courses/Get/my-courses/coursesAll/Thong_Tin_Nhieu_Khoa_Hoc`);
    console.log("🔑 Token:", token ? `${token.substring(0, 30)}...` : "MISSING");

    const response = await fetch(`${API_URL}/Courses/Get/my-courses/coursesAll/Thong_Tin_Nhieu_Khoa_Hoc`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Nếu lỗi 401, token có thể đã hết hạn hoặc không hợp lệ
      if (response.status === 401) {
        const errorText = await response.text().catch(() => "Unauthorized");
        console.error("❌ 401 Unauthorized:", errorText);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const errorText = await response.text().catch(() => `HTTP ${response.status}`);
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ getInstructorCourses - API Response:", data);
    console.log("📦 Response type:", Array.isArray(data) ? "Array" : typeof data);
    if (Array.isArray(data)) {
      console.log("📦 Response length:", data.length);
      if (data.length > 0) {
        console.log("📦 First course:", data[0]);
      }
    }
    return data;
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    throw error;
  }
};

// Create or update course step
export const createOrUpdateCourseStep = async (courseData, token) => {
  // Validate token
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  try {
    console.log("📤 Sending request to:", `${API_URL}/Courses/Post/CreateOrUpdateCourseStep/Tao_Khoa_hoc_4_buoc`);
    console.log("🔑 Token:", token ? `${token.substring(0, 20)}...` : "MISSING");

    const response = await fetch(`${API_URL}/Courses/Post/CreateOrUpdateCourseStep/Tao_Khoa_hoc_4_buoc`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      // Nếu lỗi 401, token có thể đã hết hạn hoặc không hợp lệ
      if (response.status === 401) {
        const errorText = await response.text();
        console.error("❌ 401 Unauthorized:", errorText);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ createOrUpdateCourseStep - API Response:", {
      courseId: data.CourseId || data.courseId,
      title: data.Title || data.title,
      status: data.Status || data.status,
      lessonsCount: data.Lessons?.length || data.lessons?.length || 0
    });
    return data;
  } catch (error) {
    console.error('Error creating/updating course step:', error);
    throw error;
  }
};

// Get instructor profile
export const getInstructorProfile = async (token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  try {
    console.log("📤 Getting instructor profile...");

    const response = await fetch(`${API_URL}/Instructors/Get/Instructors/Lay_ho_so_Giang_vien`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.error("❌ 401 Unauthorized:", errorText);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Instructor profile:", data);
    return data;
  } catch (error) {
    console.error('Error getting instructor profile:', error);
    throw error;
  }
};

// Get instructor's students (Danh sách học viên đã đăng ký)
export const getInstructorStudents = async (token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  try {
    const url = `${API_URL}/Students/Get/instructor/Lay_danh_sach_hoc_vien_da_dang_ky`;
    console.log("📤 GET Instructor Students:", url);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        const txt = await res.text().catch(() => 'Unauthorized');
        console.error("❌ 401 Unauthorized:", txt);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const txt = await res.text().catch(() => `HTTP ${res.status}`);
      console.error("❌ API Error:", res.status, txt);
      throw new Error(`HTTP error! status: ${res.status} - ${txt}`);
    }

    const data = await res.json();
    // Normalize array response
    const arr = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
    return arr.map((it) => {
      const fullName = it.FullName ?? it.fullName ?? it.name ?? '';
      const email = it.Email ?? it.email ?? '';
      const courseTitle = it.CourseTitle ?? it.courseTitle ?? it.Title ?? it.title ?? it.course ?? '';
      const enrollmentDate = it.EnrollmentDate ?? it.enrollmentDate ?? it.registeredAt ?? it.RegisteredAt ?? null;
      const lastActive = it.LastActive ?? it.lastActive ?? it.lastAccess ?? null;
      const progressPercent = it.ProgressPercent ?? it.progressPercent ?? it.progress ?? 0;
      const progressText = it.ProgressText ?? it.progressText ?? it.lessons ?? '';
      const statusRaw = it.EnrollmentStatus ?? it.enrollmentStatus ?? it.Status ?? it.status ?? '';

      // Map status to label/type
      let statusType = 'inactive';
      let statusLabel = 'Không hoạt động';
      const s = String(statusRaw).toLowerCase();
      if (s.includes('active') || s.includes('hoạt')) { statusType = 'active'; statusLabel = 'Hoạt động'; }
      else if (s.includes('learning') || s.includes('đang')) { statusType = 'learning'; statusLabel = 'Đang học'; }

      return {
        fullName,
        email,
        courseTitle,
        enrollmentDate,
        lastActive,
        lastAccess: lastActive,
        progressPercent: Number(progressPercent) || 0,
        progressText,
        enrollmentStatus: { label: statusLabel, type: statusType },
      };
    });
  } catch (error) {
    console.error('Error getInstructorStudents:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      throw new Error("Không thể kết nối tới server. Vui lòng kiểm tra backend port 3001 đã chạy chưa.");
    }
    throw error;
  }
};

// Search instructor's students with filters
// Filters: { FullName, Email, Title, Status, EnrollDate }
export const searchInstructorStudents = async (token, filters = {}) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  try {
    const params = new URLSearchParams();
    const { FullName, Email, Title, Status, EnrollDate } = filters;
    if (FullName) params.append('FullName', FullName);
    if (Email) params.append('Email', Email);
    if (Title) params.append('Title', Title);
    if (Status) params.append('Status', Status);
    // Gửi nguyên chuỗi ngày người dùng nhập để backend xử lý linh hoạt
    if (EnrollDate) {
      params.append('EnrollDate', String(EnrollDate).trim());
    }

    const url = `${API_URL}/Students/Get/instructor/students/search/Tim_kiem_co_bo_loc?${params.toString()}`;
    console.log("📤 SEARCH Instructor Students:", url);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        const txt = await res.text().catch(() => 'Unauthorized');
        console.error("❌ 401 Unauthorized:", txt);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const txt = await res.text().catch(() => `HTTP ${res.status}`);
      console.error("❌ API Error:", res.status, txt);
      throw new Error(`HTTP error! status: ${res.status} - ${txt}`);
    }

    const data = await res.json();
    const arr = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
    return arr.map((it) => {
      const fullName = it.FullName ?? it.fullName ?? it.name ?? '';
      const email = it.Email ?? it.email ?? '';
      const courseTitle = it.CourseTitle ?? it.courseTitle ?? it.Title ?? it.title ?? it.course ?? '';
      const enrollmentDate = it.EnrollmentDate ?? it.enrollmentDate ?? it.registeredAt ?? it.RegisteredAt ?? null;
      const lastActive = it.LastActive ?? it.lastActive ?? it.lastAccess ?? null;
      const progressPercent = it.ProgressPercent ?? it.progressPercent ?? it.progress ?? 0;
      const progressText = it.ProgressText ?? it.progressText ?? it.lessons ?? '';
      const statusRaw = it.EnrollmentStatus ?? it.enrollmentStatus ?? it.Status ?? it.status ?? '';

      let statusType = 'inactive';
      let statusLabel = 'Không hoạt động';
      const s = String(statusRaw).toLowerCase();
      if (s.includes('active') || s.includes('hoạt')) { statusType = 'active'; statusLabel = 'Hoạt động'; }
      else if (s.includes('learning') || s.includes('đang')) { statusType = 'learning'; statusLabel = 'Đang học'; }

      return {
        fullName,
        email,
        courseTitle,
        enrollmentDate,
        lastActive,
        lastAccess: lastActive,
        progressPercent: Number(progressPercent) || 0,
        progressText,
        enrollmentStatus: { label: statusLabel, type: statusType },
      };
    });
  } catch (error) {
    console.error('Error searchInstructorStudents:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      throw new Error("Không thể kết nối tới server. Vui lòng kiểm tra backend port 3001 đã chạy chưa.");
    }
    throw error;
  }
};

// Change instructor password
export const changeInstructorPassword = async (payload, token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  // payload is expected to contain: currentPassword, newPassword, confirmPassword
  // Backend endpoint expects only the password fields in body
  const body = {
    currentPassword: payload?.currentPassword,
    newPassword: payload?.newPassword,
    confirmPassword: payload?.confirmPassword,
  };

  try {
    const url = `${API_URL}/Setting/Put/change-password/Thay_doi_mat_khau`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.error("❌ 401 Unauthorized:", errorText);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error changing instructor password:', error);
    // Network related hints
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      throw new Error("Không thể kết nối tới server. Vui lòng kiểm tra backend đã chạy chưa.");
    }
    throw error;
  }
};

// Dashboard: Monthly revenue and delta
export const getDashboardMonthlyRevenue = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorTongQuat/Get/monthly-revenue`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const d = await res.json();
    return {
      currentMonthRevenue: d?.CurrentMonthRevenue ?? d?.currentMonthRevenue ?? 0,
      revenueDifference: d?.RevenueDifference ?? d?.revenueDifference ?? 0,
    };
  } catch (err) { console.error('Error getDashboardMonthlyRevenue:', err); throw err; }
};

// Dashboard: Total courses and percent change
export const getDashboardTotalCourses = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorTongQuat/total-courses`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const d = await res.json();
    return {
      totalCourses: d?.TotalCourses ?? d?.totalCourses ?? 0,
      percentChange: d?.PercentChange ?? d?.percentChange ?? 0,
      currentMonthCourses: d?.CurrentMonthCourses ?? d?.currentMonthCourses ?? 0,
      lastMonthCourses: d?.LastMonthCourses ?? d?.lastMonthCourses ?? 0,
    };
  } catch (err) { console.error('Error getDashboardTotalCourses:', err); throw err; }
};

// Dashboard: Total students and percent change
export const getDashboardTotalStudents = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorTongQuat/total-students`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const d = await res.json();
    return {
      totalStudents: d?.TotalStudents ?? d?.totalStudents ?? 0,
      percentChange: d?.PercentChange ?? d?.percentChange ?? 0,
      currentMonthStudents: d?.CurrentMonthStudents ?? d?.currentMonthStudents ?? 0,
      lastMonthStudents: d?.LastMonthStudents ?? d?.lastMonthStudents ?? 0,
    };
  } catch (err) { console.error('Error getDashboardTotalStudents:', err); throw err; }
};

// Dashboard: Completion rate and comparison
export const getDashboardCompletionRate = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorTongQuat/completion-rate`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const d = await res.json();
    return {
      currentRate: d?.CurrentRate ?? d?.currentRate ?? 0,
      difference: d?.Difference ?? d?.difference ?? 0,
      percentChange: d?.PercentChange ?? d?.percentChange ?? 0,
    };
  } catch (err) { console.error('Error getDashboardCompletionRate:', err); throw err; }
};

// Dashboard: Recent courses
export const getDashboardRecentCourses = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorTongQuat/recent-courses`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const arr = await res.json();
    // Chuẩn hóa thumbnail URL tương tự logic dùng cho trang khóa học
    const normalizeThumb = (raw) => {
      let thumbUrl = raw || "/react-course.png";
      if (thumbUrl && thumbUrl !== "/react-course.png" && String(thumbUrl).trim() !== "") {
        if (thumbUrl.startsWith('http://') || thumbUrl.startsWith('https://')) {
          // dùng trực tiếp
        } else if (thumbUrl.includes('/uploads/')) {
          // các file upload backend chạy trên 5000
          thumbUrl = `https://localhost:5000${thumbUrl.startsWith('/') ? '' : '/'}${thumbUrl}`;
        } else if (!thumbUrl.startsWith('/')) {
          thumbUrl = `/${thumbUrl}`;
        }
      } else {
        thumbUrl = "/react-course.png";
      }
      return thumbUrl;
    };

    return Array.isArray(arr) ? arr.map(c => {
      const rawThumb = c?.ThumbnailUrl ?? c?.thumbnailUrl;
      return ({
        courseId: c?.CourseId ?? c?.courseId,
        title: c?.Title ?? c?.title,
        status: c?.Status ?? c?.status,
        studentCount: c?.StudentCount ?? c?.studentCount ?? 0,
        createdAt: c?.CreatedAt ?? c?.createdAt ?? null,
        thumbnailUrl: normalizeThumb(rawThumb),
      });
    }) : [];
  } catch (err) { console.error('Error getDashboardRecentCourses:', err); throw err; }
};

// Dashboard: Recent activities
export const getDashboardRecentActivities = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorTongQuat/recent-activities`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const arr = await res.json();
    return Array.isArray(arr) ? arr.map(a => ({
      type: a?.Type ?? a?.type,
      message: a?.Message ?? a?.message,
      date: a?.Date ?? a?.date ?? null,
    })) : [];
  } catch (err) { console.error('Error getDashboardRecentActivities:', err); throw err; }
};

// =========================
// Doanh thu & Rút tiền APIs
// =========================

// Revenue summary: totalRevenue, currentMonthRevenue, previousMonthRevenue, percentChange
export const getRevenueSummary = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorSaleRevenue/summary`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const d = await res.json();
    return {
      totalRevenue: d?.TotalRevenue ?? d?.totalRevenue ?? 0,
      currentMonthRevenue: d?.CurrentMonthRevenue ?? d?.currentMonthRevenue ?? 0,
      previousMonthRevenue: d?.PreviousMonthRevenue ?? d?.previousMonthRevenue ?? 0,
      percentChange: d?.PercentChange ?? d?.percentChange ?? 0,
    };
  } catch (err) { console.error('Error getRevenueSummary:', err); throw err; }
};

// Current month revenue: { month, totalRevenue, courseSold }
export const getRevenueCurrentMonth = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorSaleRevenue/Get/current-month/Doanh_thu_theo_thang`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const d = await res.json();
    return {
      month: d?.Month ?? d?.month ?? '',
      totalRevenue: d?.TotalRevenue ?? d?.totalRevenue ?? 0,
      courseSold: d?.CourseSold ?? d?.courseSold ?? 0,
    };
  } catch (err) { console.error('Error getRevenueCurrentMonth:', err); throw err; }
};

// Revenue chart for last 6 months: [{ label, revenue }]
export const getRevenueChart6Months = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorSaleRevenue/Get/chart/Bieu_do_doanh_thu_trong_6_thang_gan_nhat`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const arr = await res.json();
    return Array.isArray(arr) ? arr.map(it => ({
      label: it?.Label ?? it?.label ?? '',
      revenue: it?.Revenue ?? it?.revenue ?? 0,
    })) : [];
  } catch (err) { console.error('Error getRevenueChart6Months:', err); throw err; }
};

// Instructor balance DTO (available, pending, withdrawn, total earnings)
export const getInstructorBalance = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorSaleRevenue/Get/Order/So_du_kha_dung_cua_Giang_vien`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const d = await res.json();
    return {
      totalEarnings: d?.TotalEarnings ?? d?.totalEarnings ?? 0,
      pendingPayouts: d?.PendingPayouts ?? d?.pendingPayouts ?? 0,
      withdrawn: d?.Withdrawn ?? d?.withdrawn ?? 0,
      availableBalance: d?.AvailableBalance ?? d?.availableBalance ?? 0,
    };
  } catch (err) { console.error('Error getInstructorBalance:', err); throw err; }
};

// Available balance summary
export const getAvailableBalanceSummary = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorSaleRevenue/Get/available-balance/So_du_kha_dung`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const d = await res.json();
    return {
      totalEarnings: d?.TotalEarnings ?? d?.totalEarnings ?? 0,
      totalWithdrawn: d?.TotalWithdrawn ?? d?.totalWithdrawn ?? 0,
      totalPendingWithdraw: d?.TotalPendingWithdraw ?? d?.totalPendingWithdraw ?? 0,
      availableBalance: d?.AvailableBalance ?? d?.availableBalance ?? 0,
    };
  } catch (err) { console.error('Error getAvailableBalanceSummary:', err); throw err; }
};

// Pending balance summary
export const getPendingBalanceSummary = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorSaleRevenue/Get/pending-balance/So_du_dang_cho_xu_ly`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const d = await res.json();
    return {
      pendingOrders: d?.PendingOrders ?? d?.pendingOrders ?? 0,
      pendingPayouts: d?.PendingPayouts ?? d?.pendingPayouts ?? 0,
      totalPending: d?.TotalPending ?? d?.totalPending ?? 0,
    };
  } catch (err) { console.error('Error getPendingBalanceSummary:', err); throw err; }
};

// Create payout request
export const createPayoutRequest = async (payload, token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorSaleRevenue/Post/request/Form_yeu_cau_rut_tien`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Amount: payload?.amount ?? payload?.Amount ?? 0,
        Method: payload?.method ?? payload?.Method ?? null,
        Notes: payload?.notes ?? payload?.Notes ?? null,
      }),
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const d = await res.json();
    return d; // { message, payout, quickOptions }
  } catch (err) { console.error('Error createPayoutRequest:', err); throw err; }
};

// Get payout history list
export const getPayoutHistory = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorSaleRevenue/Get/history/Lich_su_rut_tien`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const arr = await res.json();
    return Array.isArray(arr) ? arr.map(p => ({
      payoutId: p?.PayoutId ?? p?.payoutId,
      amount: p?.Amount ?? p?.amount ?? 0,
      platformFee: p?.PlatformFee ?? p?.platformFee ?? 0,
      netAmount: p?.NetAmount ?? p?.netAmount ?? 0,
      status: p?.Status ?? p?.status ?? 'pending',
      requestedAt: p?.RequestedAt ?? p?.requestedAt ?? null,
      processedAt: p?.ProcessedAt ?? p?.processedAt ?? null,
      notes: p?.Notes ?? p?.notes ?? '',
    })) : [];
  } catch (err) { console.error('Error getPayoutHistory:', err); throw err; }
};

// Add bank account for withdrawal
export const addBankAccount = async (payload, token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorSaleRevenue/Post/accounts/Them_tai_khoan_ngan_hang_moi`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const d = await res.json();
    return {
      message: d?.message || d?.Message || 'Đã thêm tài khoản rút tiền',
      bankAccounts: Array.isArray(d?.bankAccounts || d?.BankAccounts) ? (d?.bankAccounts || d?.BankAccounts).map(a => ({
        bankName: a?.bankName ?? a?.BankName ?? '',
        accountHolder: a?.accountHolder ?? a?.AccountHolder ?? '',
        accountNumber: a?.accountNumber ?? a?.AccountNumber ?? '',
      })) : [],
    };
  } catch (err) { console.error('Error addBankAccount:', err); throw err; }
};

// Get list of bank accounts (temporary storage per instructor session)
export const getBankAccounts = async (token) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  try {
    const url = `${API_URL}/InstructorSaleRevenue/Get/accounts/Lay_danh_sach_rut_tien`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const arr = await res.json();
    return Array.isArray(arr) ? arr.map(a => ({
      bankName: a?.bankName ?? a?.BankName ?? '',
      accountHolder: a?.accountHolder ?? a?.AccountHolder ?? '',
      accountNumber: a?.accountNumber ?? a?.AccountNumber ?? '',
    })) : [];
  } catch (err) { console.error('Error getBankAccounts:', err); throw err; }
};

// =========================
// Support Center APIs
// =========================
// Send support message: { message, reportId }
export const sendSupportMessage = async (token, payload) => {
  if (!token) throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  const { fullName, email, subject, content } = payload || {};
  if (!fullName || !email || !subject || !content) {
    throw new Error("Vui lòng nhập đầy đủ thông tin: họ tên, email, tiêu đề, nội dung.");
  }
  try {
    const url = `${API_URL}/SupportCenter/Post/send/Giang_vien_gui_yeu_cau_ho_tro_den_admin`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
      body: JSON.stringify({ fullName, email, subject, content }),
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      const txt = await res.text().catch(() => `HTTP ${res.status}`);
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const d = await res.json();
    return {
      message: d?.message ?? "Gửi yêu cầu hỗ trợ thành công.",
      reportId: d?.reportId ?? null,
    };
  } catch (err) {
    if (err.message?.includes('Failed to fetch') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
      throw new Error("Không thể kết nối tới server. Vui lòng kiểm tra backend port 3001 đã chạy chưa.");
    }
    console.error('Error sendSupportMessage:', err);
    throw err;
  }
};

// Patch/Update instructor profile
export const patchInstructorProfile = async (profileData, token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  try {
    console.log("📤 Updating instructor profile...");

    const response = await fetch(`${API_URL}/Instructors/Patch/instructor/Update_1_phan_Thong_Tin_Giang_Vien`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.error("❌ 401 Unauthorized:", errorText);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Profile updated:", data);
    return data;
  } catch (error) {
    console.error('Error updating instructor profile:', error);
    throw error;
  }
};

// Upload course thumbnail
export const uploadCourseThumbnail = async (courseId, file, token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  if (!file) {
    throw new Error("Không có file để upload.");
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    console.log("📤 Uploading thumbnail for course:", courseId);

    const response = await fetch(`${API_URL}/Courses/Post/${courseId}/upload-thumbnail/Upload_Anh_Thumbnail`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Không set Content-Type để browser tự động thêm boundary cho FormData
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.error("❌ 401 Unauthorized:", errorText);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Thumbnail uploaded:", data);
    return data;
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    throw error;
  }
};

// Upload lesson video or file
export const uploadLessonFile = async (courseId, lessonId, file, token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  if (!file) {
    throw new Error("Không có file để upload.");
  }

  if (!courseId || !lessonId) {
    throw new Error("CourseId và LessonId là bắt buộc.");
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    console.log("📤 Uploading file for lesson:", { courseId, lessonId, fileName: file.name });

    const response = await fetch(`${API_URL}/Lesson/Post/${courseId}/lessons/${lessonId}/upload_File_cho_bai_hoc`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Không set Content-Type để browser tự động thêm boundary cho FormData
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.error("❌ 401 Unauthorized:", errorText);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      if (response.status === 404) {
        const errorText = await response.text();
        console.error("❌ 404 Not Found:", errorText);
        throw new Error("Không tìm thấy bài học hoặc bạn không có quyền upload.");
      }
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ File uploaded successfully:", data);
    return data;
  } catch (error) {
    console.error('Error uploading lesson file:', error);
    throw error;
  }
};

// Delete course
export const deleteCourse = async (courseId, token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  if (!courseId) {
    throw new Error("CourseId không hợp lệ.");
  }

  try {
    const url = `${API_URL}/Courses/courses/${courseId}/delete/Xoa_khoa_hoc`;
    console.log("🗑️ DELETE Request to:", url);
    console.log("🔑 Token:", token ? `${token.substring(0, 20)}...` : "null");

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.error("❌ 401 Unauthorized:", errorText);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      if (response.status === 404) {
        const errorText = await response.text();
        console.error("❌ 404 Not Found:", errorText);
        throw new Error("Không tìm thấy khóa học hoặc bạn không có quyền xóa.");
      }
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Course deleted successfully:", data);
    return data;
  } catch (error) {
    console.error('Error deleting course:', error);
    // Nếu là network error, cung cấp thông báo rõ ràng hơn
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      throw new Error("Không thể kết nối tới server. Vui lòng kiểm tra backend đã chạy chưa.");
    }
    throw error;
  }
};

// Helper function to format course data for display
export const formatCourseData = (apiCourse) => {
  // ✅ Hỗ trợ cả PascalCase và camelCase từ API
  const courseId = apiCourse.CourseId || apiCourse.courseId
  const title = apiCourse.Title || apiCourse.title || "Khóa học"
  const price = apiCourse.Price || apiCourse.price || 0
  const status = apiCourse.Status || apiCourse.status || "draft"
  const thumbnailUrl = apiCourse.ThumbnailUrl || apiCourse.thumbnailUrl
  const totalStudents = apiCourse.TotalStudents || apiCourse.totalStudents || 0
  const totalReviews = apiCourse.TotalReviews || apiCourse.totalReviews || 0
  const averageRating = apiCourse.AverageRating || apiCourse.averageRating || 0
  const totalRevenue = apiCourse.TotalRevenue || apiCourse.totalRevenue || 0

  // ✅ Xử lý thumbnail URL - hỗ trợ mọi loại đường dẫn
  let thumbUrl = thumbnailUrl || "/react-course.png"
  
  if (thumbUrl && thumbUrl !== "/react-course.png" && thumbUrl.trim() !== "") {
    // Nếu là URL tuyệt đối (http/https), dùng trực tiếp
    if (thumbUrl.startsWith('http://') || thumbUrl.startsWith('https://')) {
      // Giữ nguyên
    }
    // Nếu là đường dẫn file từ backend upload (/uploads/...), thêm base URL
    else if (thumbUrl.includes('/uploads/')) {
      // ✅ Backend API upload file trên port 5000 (instructor API)
    thumbUrl = `https://localhost:5000${thumbUrl.startsWith('/') ? '' : '/'}${thumbUrl}`
    }
    // Nếu là đường dẫn tương đối khác, đảm bảo bắt đầu bằng /
    else if (!thumbUrl.startsWith('/')) {
      thumbUrl = `/${thumbUrl}`
    }
  } else {
    thumbUrl = "/react-course.png" // Fallback
  }
  
  return {
    id: courseId,
    courseId: courseId, // Thêm để dùng cho các action khác
    title: title,
    price: price ? `${price.toLocaleString('vi-VN')}đ` : "0đ",
    status: {
      label: getStatusLabel(status),
      type: getStatusType(status)
    },
    thumb: thumbUrl,
    students: totalStudents?.toLocaleString('vi-VN') || "0",
    rating: averageRating ? averageRating.toFixed(1) : "0",
    reviews: totalReviews?.toLocaleString('vi-VN') || "0",
    revenue: formatRevenue(totalRevenue),
  };
};

// Helper function to get status label in Vietnamese
const getStatusLabel = (status) => {
  switch (status?.toLowerCase()) {
    case 'published':
    case 'active':
      return 'Đã xuất bản';
    case 'pending':
      return 'Chờ duyệt';
    case 'draft':
      return 'Bản nháp';
    case 'rejected':
      return 'Bị từ chối';
    case 'inactive':
      return 'Không hoạt động';
    default:
      return 'Không xác định';
  }
};

// Helper function to get status type for CSS classes
const getStatusType = (status) => {
  switch (status?.toLowerCase()) {
    case 'published':
    case 'active':
      return 'published';
    case 'pending':
      return 'review';
    case 'draft':
      return 'draft';
    case 'rejected':
      return 'rejected';
    case 'inactive':
      return 'inactive';
    default:
      return 'unknown';
  }
};

// Helper function to format revenue
const formatRevenue = (revenue) => {
  if (revenue >= 1000000000) {
    return `${(revenue / 1000000000).toFixed(1)}B`;
  } else if (revenue >= 1000000) {
    return `${(revenue / 1000000).toFixed(1)}M`;
  } else if (revenue >= 1000) {
    return `${(revenue / 1000).toFixed(1)}K`;
  } else {
    return revenue.toString();
  }
};

// Get lessons by course ID
export const getLessonsByCourse = async (courseId, token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  if (!courseId) {
    throw new Error("CourseId không hợp lệ.");
  }

  try {
    console.log("📤 GET Lessons for course:", courseId);

    const response = await fetch(`${API_URL}/Lesson/Get/courses/${courseId}/lessons/Danh_sach_bai_hoc_theo_khoa_hoc`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.error("❌ 401 Unauthorized:", errorText);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      if (response.status === 404) {
        const errorText = await response.text();
        console.error("❌ 404 Not Found:", errorText);
        throw new Error("Không tìm thấy khóa học hoặc bạn không có quyền truy cập.");
      }
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

// Update lesson (PUT - full update)
export const updateLesson = async (courseId, lessonId, lessonData, token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  if (!courseId || !lessonId) {
    throw new Error("CourseId và LessonId là bắt buộc.");
  }

  try {
    console.log("📤 PUT Update lesson:", { courseId, lessonId, lessonData });

    const response = await fetch(`${API_URL}/Lesson/Put/${courseId}/${lessonId}/Cap_nhap_bai_hoc`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.error("❌ 401 Unauthorized:", errorText);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      if (response.status === 404) {
        const errorText = await response.text();
        console.error("❌ 404 Not Found:", errorText);
        throw new Error("Không tìm thấy bài học hoặc bạn không có quyền chỉnh sửa.");
      }
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

// Patch lesson (partial update)
export const patchLesson = async (courseId, lessonId, lessonData, token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  if (!courseId || !lessonId) {
    throw new Error("CourseId và LessonId là bắt buộc.");
  }

  try {
    console.log("📤 PATCH Update lesson:", { courseId, lessonId, lessonData });

    const response = await fetch(`${API_URL}/Lesson/Patch/${courseId}/${lessonId}/Cap_nhap_tung_phan_bai_hoc`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.error("❌ 401 Unauthorized:", errorText);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      if (response.status === 404) {
        const errorText = await response.text();
        console.error("❌ 404 Not Found:", errorText);
        throw new Error("Không tìm thấy bài học hoặc bạn không có quyền chỉnh sửa.");
      }
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error patching lesson:', error);
    throw error;
  }
};

// Delete lesson
export const deleteLesson = async (courseId, lessonId, token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  if (!courseId || !lessonId) {
    throw new Error("CourseId và LessonId là bắt buộc.");
  }

  try {
    console.log("🗑️ DELETE Lesson:", { courseId, lessonId });

    const response = await fetch(`${API_URL}/Lesson/Delete/${courseId}/lessons/${lessonId}/Xoa_1_bai_hoc`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        const errorText = await response.text();
        console.error("❌ 401 Unauthorized:", errorText);
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      if (response.status === 404) {
        const errorText = await response.text();
        console.error("❌ 404 Not Found:", errorText);
        throw new Error("Không tìm thấy bài học hoặc bạn không có quyền xóa.");
      }
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};

// ========== REVIEW APIs ==========

// Get review summary (Tổng quan đánh giá)
export const getReviewSummary = async (token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  try {
    const response = await fetch(`${API_URL}/Review/Get/reviews/summary/Thong_tin_tong_quat`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting review summary:', error);
    throw error;
  }
};

// Get rating summary (Thống kê điểm đánh giá)
export const getRatingSummary = async (token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  try {
    const response = await fetch(`${API_URL}/Review/Get/my-courses/reviews/rating-summary/Thong_ke_Diem_danh_gia`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting rating summary:', error);
    throw error;
  }
};

// Search reviews with filters (Tìm kiếm theo bộ lọc)
export const searchReviews = async (token, filters = {}) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  try {
    const { courseTitle, keyword, rating, page = 1, pageSize = 10 } = filters;
    const params = new URLSearchParams();
    if (courseTitle) params.append('courseTitle', courseTitle);
    if (keyword) params.append('keyword', keyword);
    if (rating) params.append('rating', rating);
    params.append('page', page);
    params.append('pageSize', pageSize);

    const response = await fetch(`${API_URL}/Review/Get/my-courses/reviews/search/Tim_kiem_theo_bo_loc?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching reviews:', error);
    throw error;
  }
};

// Get all reviews (Lấy toàn bộ danh sách đánh giá)
export const getAllReviews = async (token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  try {
    const response = await fetch(`${API_URL}/Review/Get/reviews/all/Lay_toan_bo_danh_sach_danh_gia`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting all reviews:', error);
    throw error;
  }
};

// Auto reply to review (Phản hồi tự động)
export const autoReplyReview = async (reviewId, token) => {
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập lại.");
  }

  if (!reviewId) {
    throw new Error("ReviewId là bắt buộc.");
  }

  try {
    const response = await fetch(`${API_URL}/Review/reviews/${reviewId}/auto-reply/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error auto replying review:', error);
    throw error;
  }
};
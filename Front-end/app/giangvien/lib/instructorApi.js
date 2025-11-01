// API service for instructor-related endpoints
const API_URL = "https://localhost:3001/api";

// Get instructor's courses with statistics
export const getInstructorCourses = async (token) => {
  try {
    const response = await fetch(`${API_URL}/Courses/Get/my-courses/coursesAll/Thong_Tin_Nhieu_Khoa_Hoc`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    throw error;
  }
};

// Create or update course step
export const createOrUpdateCourseStep = async (courseData, token) => {
  try {
    const response = await fetch(`${API_URL}/Courses/Post/CreateOrUpdateCourseStep/Tao_Khoa_hoc_4_buoc`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating/updating course step:', error);
    throw error;
  }
};

// Publish draft course (change status from draft to pending)
export const publishDraftCourse = async (courseId, token) => {
  try {
    const response = await fetch(`${API_URL}/Courses/Post/publish/Tao_Khoa_hoc_o_trang_thai_Cho_Duyet/Pending`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ CourseId: courseId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error publishing course:', error);
    throw error;
  }
};

// Delete course
export const deleteCourse = async (courseId, token) => {
  try {
    const response = await fetch(`${API_URL}/Courses/courses/${courseId}/delete/Xoa_khoa_hoc`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Helper function to format course data for display
export const formatCourseData = (apiCourse) => {
  return {
    id: apiCourse.courseId,
    title: apiCourse.title,
    price: apiCourse.price ? `${apiCourse.price.toLocaleString('vi-VN')}đ` : "0đ",
    status: {
      label: getStatusLabel(apiCourse.status),
      type: getStatusType(apiCourse.status)
    },
    thumb: apiCourse.thumbnailUrl || "/react-course.png",
    students: apiCourse.totalStudents?.toLocaleString('vi-VN') || "0",
    rating: apiCourse.averageRating ? apiCourse.averageRating.toFixed(1) : "0",
    reviews: apiCourse.totalReviews?.toLocaleString('vi-VN') || "0",
    revenue: formatRevenue(apiCourse.totalRevenue || 0),
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
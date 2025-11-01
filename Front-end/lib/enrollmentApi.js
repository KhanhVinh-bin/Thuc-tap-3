const API_URL = "https://localhost:7025/api"

/**
 * Tạo enrollment mới cho học viên
 * @param {Object} enrollmentData - { courseId, userId, status, paymentId }
 * @returns {Promise<Object>} Enrollment đã tạo
 */
export async function createEnrollment(enrollmentData) {
  try {
    const response = await fetch(`${API_URL}/Enrollments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enrollmentData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create enrollment: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating enrollment:", error)
    throw error
  }
}

/**
 * Lấy danh sách enrollment của học viên
 * @param {number} userId - ID của học viên
 * @returns {Promise<Array>} Danh sách enrollments
 */
export async function getEnrollmentsByUser(userId) {
  try {
    const response = await fetch(`${API_URL}/Enrollments/ByUser/${userId}`)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch enrollments: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    throw error
  }
}

/**
 * Lấy danh sách enrollment của khóa học
 * @param {number} courseId - ID của khóa học
 * @returns {Promise<Array>} Danh sách enrollments
 */
export async function getEnrollmentsByCourse(courseId) {
  try {
    const response = await fetch(`${API_URL}/Enrollments/ByCourse/${courseId}`)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch enrollments: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    throw error
  }
}

/**
 * Lấy tiến độ học tập của enrollment
 * @param {number} enrollmentId - ID của enrollment
 * @returns {Promise<Object>} Tiến độ học tập
 */
export async function getEnrollmentProgress(enrollmentId) {
  try {
    const response = await fetch(`${API_URL}/Enrollments/${enrollmentId}/Progress`)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch progress: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching progress:", error)
    throw error
  }
}

/**
 * Đánh dấu bài học đã hoàn thành
 * @param {number} enrollmentId - ID của enrollment
 * @param {number} lessonId - ID của bài học
 * @returns {Promise<Object>} Kết quả
 */
export async function markLessonComplete(enrollmentId, lessonId) {
  try {
    const response = await fetch(
      `${API_URL}/Enrollments/${enrollmentId}/Progress/${lessonId}/Complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to mark lesson complete: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error marking lesson complete:", error)
    throw error
  }
}

/**
 * Đánh dấu enrollment đã hoàn thành
 * @param {number} enrollmentId - ID của enrollment
 * @returns {Promise<Object>} Kết quả
 */
export async function completeEnrollment(enrollmentId) {
  try {
    const response = await fetch(`${API_URL}/Enrollments/${enrollmentId}/Complete`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to complete enrollment: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error completing enrollment:", error)
    throw error
  }
}

/**
 * Xóa enrollment theo userId và courseId
 * @param {number} userId - ID của học viên
 * @param {number} courseId - ID của khóa học
 * @returns {Promise<void>}
 */
export async function deleteEnrollmentByUserAndCourse(userId, courseId) {
  try {
    const response = await fetch(
      `${API_URL}/Enrollments/ByUserAndCourse?userId=${userId}&courseId=${courseId}`,
      {
        method: "DELETE",
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to delete enrollment: ${errorText}`)
    }

    return true
  } catch (error) {
    console.error("Error deleting enrollment:", error)
    throw error
  }
}

/**
 * Tạo nhiều enrollments cùng lúc (batch)
 * @param {Array} enrollmentsData - Array of { courseId, userId, status, paymentId }
 * @returns {Promise<Array>} Array of created enrollments
 */
export async function createBatchEnrollments(enrollmentsData) {
  try {
    const enrollmentPromises = enrollmentsData.map((data) => createEnrollment(data))
    const results = await Promise.allSettled(enrollmentPromises)
    
    const successful = results.filter((r) => r.status === "fulfilled").map((r) => r.value)
    const failed = results.filter((r) => r.status === "rejected")
    
    if (failed.length > 0) {
      console.warn(`${failed.length} enrollments failed to create:`, failed)
    }
    
    return successful
  } catch (error) {
    console.error("Error creating batch enrollments:", error)
    throw error
  }
}


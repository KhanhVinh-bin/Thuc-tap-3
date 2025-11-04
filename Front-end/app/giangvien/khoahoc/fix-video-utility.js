// Utility để fix videoUrl cho lesson đã tồn tại
// Sử dụng trong console hoặc tạo trang admin

import { patchLesson, getLessonsByCourse } from "../../lib/instructorApi"

/**
 * Fix videoUrl cho tất cả lessons trong một course
 * Nếu lesson có file.FilePath nhưng không có VideoUrl, sẽ set VideoUrl = FilePath
 */
export async function fixVideoUrlsForCourse(courseId, token) {
  try {
    console.log(`🔧 Bắt đầu fix videoUrl cho course ${courseId}...`)
    
    // Lấy danh sách lessons
    const lessons = await getLessonsByCourse(courseId, token)
    console.log(`📚 Tìm thấy ${lessons.length} bài học`)
    
    const fixes = []
    
    for (const lesson of lessons) {
      const lessonId = lesson.lessonId || lesson.LessonId
      const hasVideoUrl = lesson.videoUrl || lesson.VideoUrl
      const filePath = lesson.file?.filePath || lesson.File?.FilePath || lesson.filePath || lesson.FilePath
      const contentType = lesson.contentType || lesson.ContentType
      
      // Chỉ fix nếu:
      // 1. ContentType là video
      // 2. Có filePath nhưng không có videoUrl
      if (contentType === "video" && filePath && !hasVideoUrl) {
        console.log(`🔧 Fixing lesson ${lessonId}: Setting videoUrl = ${filePath}`)
        
        try {
          await patchLesson(courseId, lessonId, {
            videoUrl: filePath
          }, token)
          
          fixes.push({
            lessonId,
            title: lesson.title || lesson.Title,
            filePath,
            success: true
          })
          console.log(`✅ Fixed lesson ${lessonId}`)
        } catch (err) {
          console.error(`❌ Error fixing lesson ${lessonId}:`, err)
          fixes.push({
            lessonId,
            title: lesson.title || lesson.Title,
            filePath,
            success: false,
            error: err.message
          })
        }
      }
    }
    
    console.log(`✅ Hoàn thành! Đã fix ${fixes.filter(f => f.success).length}/${fixes.length} bài học`)
    return fixes
  } catch (err) {
    console.error("❌ Error fixing videoUrls:", err)
    throw err
  }
}

/**
 * Fix videoUrl cho một lesson cụ thể
 */
export async function fixVideoUrlForLesson(courseId, lessonId, token) {
  try {
    const lessons = await getLessonsByCourse(courseId, token)
    const lesson = lessons.find(l => (l.lessonId || l.LessonId) === lessonId)
    
    if (!lesson) {
      throw new Error(`Không tìm thấy lesson ${lessonId}`)
    }
    
    const filePath = lesson.file?.filePath || lesson.File?.FilePath || lesson.filePath || lesson.FilePath
    
    if (!filePath) {
      throw new Error(`Lesson ${lessonId} không có filePath`)
    }
    
    await patchLesson(courseId, lessonId, {
      videoUrl: filePath
    }, token)
    
    console.log(`✅ Fixed lesson ${lessonId}: videoUrl = ${filePath}`)
    return { success: true, videoUrl: filePath }
  } catch (err) {
    console.error(`❌ Error fixing lesson ${lessonId}:`, err)
    throw err
  }
}

// Hướng dẫn sử dụng trong console:
// import { fixVideoUrlsForCourse } from './app/giangvien/khoahoc/fix-video-utility'
// const token = 'your-token-here'
// await fixVideoUrlsForCourse(19, token)


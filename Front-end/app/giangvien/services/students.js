// Mock students dataset shared across giangvien pages
export const students = [
  { id: 1, name: 'Nguyễn Văn A', email: 'a@gmail.com', courseId: 'react-1', course: 'Complete React Development Course', teacherId: 1, registered: '15/08/2024', progress: 85, lessons: '34/40', lastAccess: '3 giờ trước', status: 'Đang học' },
  { id: 2, name: 'Nguyễn Văn B', email: 'b@gmail.com', courseId: 'react-1', course: 'Complete React Development Course', teacherId: 1, registered: '15/08/2024', progress: 15, lessons: '13/40', lastAccess: '3 giờ trước', status: 'Không hoạt động' },
  { id: 3, name: 'Nguyễn Văn C', email: 'c@gmail.com', courseId: 'node-1', course: 'Node.js Mastery', teacherId: 2, registered: '15/08/2024', progress: 67, lessons: '28/40', lastAccess: '3 giờ trước', status: 'Hoạt động' },
  { id: 4, name: 'Nguyễn Văn D', email: 'd@gmail.com', courseId: 'react-1', course: 'Complete React Development Course', teacherId: 1, registered: '15/08/2024', progress: 67, lessons: '28/40', lastAccess: '3 giờ trước', status: 'Hoạt động' }
]

export function getStudentsByTeacher(teacherId){
  return students.filter(s => s.teacherId === teacherId)
}

export function getStudentsByCourse(courseId){
  return students.filter(s => s.courseId === courseId)
}

export function getStudentById(id){
  return students.find(s => s.id === id)
}

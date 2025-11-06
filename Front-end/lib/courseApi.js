const API_BASE = "https://localhost:7025/api";

export async function getCourseById(id) {
  const res = await fetch(`${API_BASE}/Courses/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Không thể tải khóa học");
  return res.json();
}

export async function getReviewsByCourse(courseId) {
  const res = await fetch(`${API_BASE}/Reviews/ByCourse/${courseId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Không thể tải đánh giá");
  return res.json();
}

export async function createReview(reviewData) {
  const res = await fetch(`${API_BASE}/Reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData),
  });
  if (!res.ok) throw new Error("Không thể gửi đánh giá");
  return res.json();
}

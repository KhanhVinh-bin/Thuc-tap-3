"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { safeFetch } from "@/lib/safe-fetch" // nếu bạn đặt helper ở đó

export default function StudentLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { ok, status, data, rawText, error } = await safeFetch(
        "https://localhost:7025/api/Users/Login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password })
        }
      )

      if (error) throw error

      if (!ok) {
        console.error("Login failed, status:", status, "response:", data ?? rawText)
        throw new Error(data?.message || `Đăng nhập thất bại (status ${status})`)
      }

      // data có thể là object nếu backend trả JSON dạng { token, user }
      if (!data || typeof data !== "object") {
        console.error("Unexpected login response:", data ?? rawText)
        throw new Error("Phản hồi từ server không đúng định dạng")
      }

      if (data.token) localStorage.setItem("token", data.token)
      if (data.user) localStorage.setItem("user", JSON.stringify(data))


      router.push("/khoa-hoc-cua-toi")
    } catch (err) {
      console.error("Lỗi đăng nhập:", err)
      alert(err.message || "Sai email hoặc mật khẩu!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Đăng nhập học viên</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  )
}

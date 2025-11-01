"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function RegisterPage() {
const router = useRouter();
const [role, setRole] = useState("student");
const [formData, setFormData] = useState({
fullName: "",
email: "",
password: "",
confirmPassword: "",
agreeTerms: false,
expertise: "",
experienceYears: 0,
biography: "",
});
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState("");
const [shakeInput, setShakeInput] = useState(false);
const [fieldErrors, setFieldErrors] = useState({});
const [touched, setTouched] = useState({});

const shake = () => {
setShakeInput(true);
setTimeout(() => setShakeInput(false), 500);
setIsLoading(false);
};

// Validation function
const validateField = (name, value, role) => {
  const errors = {}
  
  if (name === "fullName") {
    if (!value.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên"
    }
  } else if (name === "email") {
    if (!value.trim()) {
      errors.email = "Vui lòng nhập email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.email = "Email không hợp lệ"
    }
  } else if (name === "password") {
    if (!value.trim()) {
      errors.password = "Vui lòng nhập mật khẩu"
    } else if (value.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }
  } else if (name === "confirmPassword") {
    if (!value.trim()) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    } else if (value !== formData.password) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }
  } else if (role === "instructor") {
    if (name === "expertise" && !value.trim()) {
      errors.expertise = "Vui lòng nhập chuyên môn"
    } else if (name === "experienceYears") {
      if (!value || value < 0) {
        errors.experienceYears = "Vui lòng nhập số năm kinh nghiệm hợp lệ"
      }
    }
    // biography không bắt buộc, không validate
  }
  
  return errors
}

const handleChange = (e) => {
const { name, value, type, checked } = e.target;
const newValue = type === "checkbox" ? checked : value;

setFormData({
...formData,
[name]: newValue,
});

// Clear error khi user đang nhập
if (fieldErrors[name]) {
  setFieldErrors(prev => {
    const updated = { ...prev }
    delete updated[name]
    return updated
  })
}

// Validate real-time nếu field đã được touch
if (touched[name]) {
  const errors = validateField(name, newValue, role)
  if (errors[name]) {
    setFieldErrors(prev => ({ ...prev, ...errors }))
  } else {
    setFieldErrors(prev => {
      const updated = { ...prev }
      delete updated[name]
      return updated
    })
  }
}
};

const handleBlur = (e) => {
  const { name, value } = e.target
  setTouched(prev => ({ ...prev, [name]: true }))
  
  // Validate khi blur
  const errors = validateField(name, value, role)
  setFieldErrors(prev => ({ ...prev, ...errors }))
}

const handleSubmit = async (e) => {
e.preventDefault();
setError("");
setIsLoading(true);

// Validate tất cả fields
const errors = {}
const requiredFields = ["fullName", "email", "password", "confirmPassword"]
if (role === "instructor") {
  requiredFields.push("expertise", "experienceYears")
}

// Validate từng field
requiredFields.forEach(field => {
  const fieldError = validateField(field, formData[field], role)
  if (fieldError[field]) {
    errors[field] = fieldError[field]
  }
})

// Validate confirm password riêng vì cần check với password
if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
  errors.confirmPassword = "Mật khẩu xác nhận không khớp"
}

// Validate agreeTerms
if (!formData.agreeTerms) {
  errors.agreeTerms = "Vui lòng đồng ý với điều khoản dịch vụ"
}

// Set tất cả fields đã được touch
setTouched({
  fullName: true,
  email: true,
  password: true,
  confirmPassword: true,
  agreeTerms: true,
  ...(role === "instructor" && {
    expertise: true,
    experienceYears: true,
  })
})

// Nếu có lỗi, dừng lại
if (Object.keys(errors).length > 0) {
  setFieldErrors(errors)
  setIsLoading(false)
  shake()
  return
}

try {
  // Chọn endpoint đúng theo role
  const endpoint =
    role === "instructor"
      ? "https://localhost:3001/api/Auth/register/instructor"
      : "https://localhost:7025/api/Users/Register";

  const body =
    role === "instructor"
      ? {
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          fullName: formData.fullName,
          acceptTerms: formData.agreeTerms,
          expertise: formData.expertise || "Chưa cập nhật",
          experienceYears: Number(formData.experienceYears) || 0,
          biography: formData.biography || "Chưa có giới thiệu",
        }
      : {
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          fullName: formData.fullName,
          acceptTerms: formData.agreeTerms,
        };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Đăng ký thất bại");
  }

  const result = await res.json();
  console.log("Kết quả đăng ký:", result);

  alert("Đăng ký thành công! Vui lòng đăng nhập.");
  router.push("/login");
} catch (err) {
  console.error("Lỗi đăng ký:", err);
  setError(err.message || "Lỗi khi đăng ký tài khoản!");
} finally {
  setIsLoading(false);
}


};

const benefits = [
"Truy cập hàng ngàn khóa học chất lượng",
"Học tập theo tiến độ riêng",
"Nhận chứng chỉ sau khi hoàn thành",
"Tương tác trực tiếp với giảng viên",
"Theo dõi tiến độ học tập chi tiết",
];

return (
<>
<Header />
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
<div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
{/* Bên trái */}
<div className="hidden lg:block">
<div className="flex items-center gap-3 mb-8">
<div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
</svg>
</div>
<div>
<h1 className="text-3xl font-bold text-gray-900">EduLearn</h1>
<p className="text-sm text-gray-600">
Nền tảng học trực tuyến hàng đầu
</p>
</div>
</div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Nâng cao kỹ năng
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Học từ các chuyên gia hàng đầu và phát triển sự nghiệp của bạn.
        </p>

        <div className="space-y-4">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bên phải - form */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 zoom-in">
        <h2 className="text-2xl font-bold mb-2 text-center">
          Đăng ký tài khoản
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Chọn vai trò và tạo tài khoản của bạn
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-full">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
              role === "student"
                ? "bg-white text-gray-900 shadow-md"
                : "text-gray-600"
            }`}
          >
            Học viên
          </button>
          <button
            type="button"
            onClick={() => setRole("instructor")}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
              role === "instructor"
                ? "bg-white text-gray-900 shadow-md"
                : "text-gray-600"
            }`}
          >
            Giảng viên
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {["fullName", "email", "password", "confirmPassword"].map(
            (field) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {field === "fullName"
                    ? "Họ và tên *"
                    : field === "email"
                    ? "Email *"
                    : field === "password"
                    ? "Mật khẩu *"
                    : "Xác nhận mật khẩu *"}
                </label>
                <input
                  type={
                    field.includes("password")
                      ? "password"
                      : field === "email"
                      ? "email"
                      : "text"
                  }
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={
                    field === "fullName"
                      ? "Nguyễn Văn A"
                      : field === "email"
                      ? "email@example.com"
                      : "••••••••"
                  }
                  className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    shakeInput ? "shake" : ""
                  } ${
                    fieldErrors[field] 
                      ? "border-2 border-red-500 bg-red-50 focus:ring-red-500" 
                      : touched[field] && !fieldErrors[field]
                      ? "border-2 border-green-500 bg-green-50"
                      : "border border-gray-300"
                  }`}
                />
                {fieldErrors[field] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{fieldErrors[field]}</span>
                  </p>
                )}
              </div>
            )
          )}

          {/* Giảng viên thêm thông tin chuyên môn */}
          {role === "instructor" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Chuyên môn *
                </label>
                <input
                  type="text"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="VD: Lập trình, Thiết kế web..."
                  className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    fieldErrors.expertise 
                      ? "border-2 border-red-500 bg-red-50 focus:ring-red-500" 
                      : touched.expertise && !fieldErrors.expertise
                      ? "border-2 border-green-500 bg-green-50"
                      : "border border-gray-300"
                  }`}
                />
                {fieldErrors.expertise && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{fieldErrors.expertise}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Số năm kinh nghiệm *
                </label>
                <input
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="0"
                  placeholder="0"
                  className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    fieldErrors.experienceYears 
                      ? "border-2 border-red-500 bg-red-50 focus:ring-red-500" 
                      : touched.experienceYears && !fieldErrors.experienceYears
                      ? "border-2 border-green-500 bg-green-50"
                      : "border border-gray-300"
                  }`}
                />
                {fieldErrors.experienceYears && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{fieldErrors.experienceYears}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Giới thiệu ngắn
                </label>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Giới thiệu bản thân... (không bắt buộc)"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-300"
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">Trường này không bắt buộc</p>
              </div>
            </>
          )}

          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="terms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-4 h-4 mt-1 rounded border-gray-300 cursor-pointer ${
                fieldErrors.agreeTerms ? "border-red-500" : ""
              }`}
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              Tôi đồng ý với{" "}
              <a href="#" className="text-indigo-600 hover:underline font-semibold">
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a href="#" className="text-indigo-600 hover:underline font-semibold">
                Chính sách bảo mật
              </a>{" "}
              *
            </label>
          </div>
          {fieldErrors.agreeTerms && (
            <p className="text-sm text-red-600 flex items-center gap-1 -mt-2">
              <span>⚠️</span>
              <span>{fieldErrors.agreeTerms}</span>
            </p>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
          </button>

          <p className="text-center text-sm text-gray-600 pt-2">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-indigo-600 hover:underline font-semibold"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </form>
      </div>
    </div>

    <style jsx>{`
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      .shake { animation: shake 0.5s ease-in-out; }
      .zoom-in { animation: zoomIn 0.3s ease-out; }
      @keyframes zoomIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    `}</style>
  </div>
  <Footer />
</>
);
}
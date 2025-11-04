"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
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
const [touchedFields, setTouchedFields] = useState({});
const [fieldStates, setFieldStates] = useState({}); // 'idle', 'error', 'success'
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const shake = () => {
setShakeInput(true);
setTimeout(() => setShakeInput(false), 500);
setIsLoading(false);
};

// Validation function cho từng trường
const validateField = (name, value) => {
  switch (name) {
    case "fullName":
      if (!value.trim()) return "Vui lòng nhập họ và tên";
      // Chỉ cho phép chữ cái (kể cả tiếng Việt có dấu) và khoảng trắng
      if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value.trim())) {
        return "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
      }
      if (value.trim().length < 2) return "Họ và tên phải có ít nhất 2 ký tự";
      return "";
    case "email":
      if (!value.trim()) return "Vui lòng nhập email";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email không hợp lệ";
      return "";
    case "password":
      if (!value) return "Vui lòng nhập mật khẩu";
      if (value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
      // Kiểm tra không được chứa format email (không có @)
      if (value.includes("@")) {
        return "Mật khẩu không được chứa ký tự @ (để tránh nhầm lẫn với email)";
      }
      // Kiểm tra không được chứa format email như "@gmail.com", "@yahoo.com", etc.
      if (/@[a-zA-Z0-9]+\.[a-zA-Z]{2,}/.test(value)) {
        return "Mật khẩu không được chứa format email (ví dụ: @gmail.com)";
      }
      return "";
    case "confirmPassword":
      if (!value) return "Vui lòng xác nhận mật khẩu";
      if (formData.password && value !== formData.password) return "Mật khẩu xác nhận không khớp";
      return "";
    case "expertise":
      if (role === "instructor" && !value.trim()) return "Vui lòng nhập chuyên môn";
      return "";
    case "biography":
      if (role === "instructor" && !value.trim()) return "Vui lòng nhập giới thiệu";
      return "";
    default:
      return "";
  }
};

const handleChange = (e) => {
const { name, value, type, checked } = e.target;
setFormData({
...formData,
[name]: type === "checkbox" ? checked : value,
});

// Validate real-time nếu đã từng touched
if (touchedFields[name]) {
  const fieldValue = type === "checkbox" ? checked : value;
  const error = validateField(name, fieldValue);
  if (error) {
    setFieldErrors(prev => ({ ...prev, [name]: error }));
    setFieldStates(prev => ({ ...prev, [name]: 'error' }));
  } else {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    if (type === "checkbox") {
      setFieldStates(prev => ({ ...prev, [name]: checked ? 'success' : 'error' }));
    } else {
      setFieldStates(prev => ({ ...prev, [name]: value.trim() ? 'success' : 'idle' }));
    }
  }
} else {
  // Reset state when not touched yet
  setFieldStates(prev => ({ ...prev, [name]: 'idle' }));
}

// Nếu đổi password, validate lại confirmPassword nếu đã touched
if (name === "password" && touchedFields.confirmPassword && formData.confirmPassword) {
  const confirmError = validateField("confirmPassword", formData.confirmPassword);
  if (confirmError) {
    setFieldErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    setFieldStates(prev => ({ ...prev, confirmPassword: 'error' }));
  } else {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.confirmPassword;
      return newErrors;
    });
    setFieldStates(prev => ({ ...prev, confirmPassword: formData.confirmPassword.trim() ? 'success' : 'idle' }));
  }
}
};

// Handle blur - validate khi rời khỏi input
const handleBlur = (e) => {
const { name, value, type, checked } = e.target;
setTouchedFields(prev => ({ ...prev, [name]: true }));
const fieldValue = type === "checkbox" ? checked : value;
const error = validateField(name, fieldValue);
if (error) {
  setFieldErrors(prev => ({ ...prev, [name]: error }));
  setFieldStates(prev => ({ ...prev, [name]: 'error' }));
} else {
  setFieldErrors(prev => {
    const newErrors = { ...prev };
    delete newErrors[name];
    return newErrors;
  });
  if (type === "checkbox") {
    setFieldStates(prev => ({ ...prev, [name]: checked ? 'success' : 'error' }));
  } else {
    setFieldStates(prev => ({ ...prev, [name]: value.trim() ? 'success' : 'idle' }));
  }
}
};

const handleSubmit = async (e) => {
e.preventDefault();
setError("");
setFieldErrors({});
setIsLoading(true);

// Kiểm tra và hiển thị lỗi cho từng trường
const errors = {};

if (!formData.fullName.trim()) {
  errors.fullName = "Vui lòng nhập họ và tên";
} else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.fullName.trim())) {
  errors.fullName = "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
} else if (formData.fullName.trim().length < 2) {
  errors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
}
if (!formData.email.trim()) {
  errors.email = "Vui lòng nhập email";
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
  errors.email = "Email không hợp lệ";
}
if (!formData.password) {
  errors.password = "Vui lòng nhập mật khẩu";
} else if (formData.password.length < 6) {
  errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
} else if (formData.password.includes("@")) {
  errors.password = "Mật khẩu không được chứa ký tự @ (để tránh nhầm lẫn với email)";
} else if (/@[a-zA-Z0-9]+\.[a-zA-Z]{2,}/.test(formData.password)) {
  errors.password = "Mật khẩu không được chứa format email (ví dụ: @gmail.com)";
}
if (!formData.confirmPassword) {
  errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
} else if (formData.password !== formData.confirmPassword) {
  errors.confirmPassword = "Mật khẩu xác nhận không khớp";
}

// Kiểm tra thông tin giảng viên
if (role === "instructor") {
  if (!formData.expertise.trim()) {
    errors.expertise = "Vui lòng nhập chuyên môn";
  }
  if (!formData.biography.trim()) {
    errors.biography = "Vui lòng nhập giới thiệu";
  }
}

if (!formData.agreeTerms) {
  errors.agreeTerms = "Vui lòng đồng ý với điều khoản dịch vụ";
}

// Đánh dấu tất cả các trường là đã touched khi submit
const allFields = role === "instructor" 
  ? ["fullName", "email", "password", "confirmPassword", "expertise", "biography", "agreeTerms"]
  : ["fullName", "email", "password", "confirmPassword", "agreeTerms"];
const touched = {};
const states = {};
allFields.forEach(field => {
  touched[field] = true;
  states[field] = 'idle';
});
setTouchedFields(touched);
setFieldStates(states);

// Nếu có lỗi, hiển thị và dừng
if (Object.keys(errors).length > 0) {
  setFieldErrors(errors);
  setError("Vui lòng điền đầy đủ thông tin bắt buộc");
  // Set error states for invalid fields
  Object.keys(errors).forEach(field => {
    setFieldStates(prev => ({ ...prev, [field]: 'error' }));
  });
  shake();
  setIsLoading(false);
  return;
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
          expertise: formData.expertise.trim(),
          experienceYears: Number(formData.experienceYears) || 0,
          biography: formData.biography.trim(),
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
    let errorMessage = "Đăng ký thất bại";
    try {
      // ✅ Clone response để có thể đọc nhiều lần nếu cần
      const responseClone = res.clone();
      
      // ✅ Đọc text trước, rồi parse JSON nếu có thể
      const errorText = await responseClone.text();
      console.error("Lỗi từ server:", errorText);
      
      // Thử parse JSON
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData || errorMessage;
        
        // Nếu là string, thử parse thêm một lần nữa (trường hợp nested JSON string)
        if (typeof errorMessage === 'string' && errorMessage.includes('"')) {
          try {
            const parsed = JSON.parse(errorMessage);
            errorMessage = parsed.message || parsed || errorMessage;
          } catch {}
        }
      } catch {
        // Nếu không parse được, dùng text trực tiếp
        errorMessage = errorText || errorMessage;
      }
    } catch (e) {
      console.error("Lỗi khi đọc response:", e);
      errorMessage = `Đăng ký thất bại (${res.status})`;
    }
    throw new Error(errorMessage);
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
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Họ và tên *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nguyễn Văn A"
              className={`w-full px-4 py-3 rounded-lg focus:ring-2 transition-all ${
                shakeInput ? "shake" : ""
              } ${
                touchedFields.fullName && fieldErrors.fullName 
                  ? "border-2 border-red-400 bg-red-50 focus:ring-red-500" 
                  : touchedFields.fullName && fieldStates.fullName === 'success' && !fieldErrors.fullName
                  ? "border-2 border-green-400 bg-green-50 focus:ring-green-500"
                  : "border-0 bg-gray-100 focus:ring-indigo-500"
              }`}
              required
            />
            {touchedFields.fullName && fieldErrors.fullName && (
              <p className="text-red-600 text-xs mt-1 animate-fade-in flex items-center gap-1">
                <span>⚠️</span>
                <span>{fieldErrors.fullName}</span>
              </p>
            )}
            {touchedFields.fullName && !fieldErrors.fullName && fieldStates.fullName === 'success' && (
              <p className="text-green-600 text-xs mt-1 animate-fade-in flex items-center gap-1">
                <span>✓</span>
                <span>Họ tên hợp lệ</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="email@example.com"
              className={`w-full px-4 py-3 rounded-lg focus:ring-2 transition-all ${
                shakeInput ? "shake" : ""
              } ${
                touchedFields.email && fieldErrors.email 
                  ? "border-2 border-red-400 bg-red-50 focus:ring-red-500" 
                  : touchedFields.email && fieldStates.email === 'success' && !fieldErrors.email
                  ? "border-2 border-green-400 bg-green-50 focus:ring-green-500"
                  : "border-0 bg-gray-100 focus:ring-indigo-500"
              }`}
              required
            />
            {touchedFields.email && fieldErrors.email && (
              <p className="text-red-600 text-xs mt-1 animate-fade-in flex items-center gap-1">
                <span>⚠️</span>
                <span>{fieldErrors.email}</span>
              </p>
            )}
            {touchedFields.email && !fieldErrors.email && fieldStates.email === 'success' && (
              <p className="text-green-600 text-xs mt-1 animate-fade-in flex items-center gap-1">
                <span>✓</span>
                <span>Email hợp lệ</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Mật khẩu *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="•••••••• "
                className={`w-full px-4 py-3 pr-12 rounded-lg focus:ring-2 transition-all ${
                  shakeInput ? "shake" : ""
                } ${
                  touchedFields.password && fieldErrors.password 
                    ? "border-2 border-red-400 bg-red-50 focus:ring-red-500" 
                    : touchedFields.password && fieldStates.password === 'success' && !fieldErrors.password
                    ? "border-2 border-green-400 bg-green-50 focus:ring-green-500"
                    : "border-0 bg-gray-100 focus:ring-indigo-500"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {touchedFields.password && fieldErrors.password && (
              <p className="text-red-600 text-xs mt-1 animate-fade-in flex items-center gap-1">
                <span>⚠️</span>
                <span>{fieldErrors.password}</span>
              </p>
            )}
            {touchedFields.password && !fieldErrors.password && fieldStates.password === 'success' && (
              <p className="text-green-600 text-xs mt-1 animate-fade-in flex items-center gap-1">
                <span>✓</span>
                <span>Mật khẩu hợp lệ</span>
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Xác nhận mật khẩu *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-12 rounded-lg focus:ring-2 transition-all ${
                  shakeInput ? "shake" : ""
                } ${
                  touchedFields.confirmPassword && fieldErrors.confirmPassword 
                    ? "border-2 border-red-400 bg-red-50 focus:ring-red-500" 
                    : touchedFields.confirmPassword && fieldStates.confirmPassword === 'success' && !fieldErrors.confirmPassword
                    ? "border-2 border-green-400 bg-green-50 focus:ring-green-500"
                    : "border-0 bg-gray-100 focus:ring-indigo-500"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {touchedFields.confirmPassword && fieldErrors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1 animate-fade-in flex items-center gap-1">
                <span>⚠️</span>
                <span>{fieldErrors.confirmPassword}</span>
              </p>
            )}
            {touchedFields.confirmPassword && !fieldErrors.confirmPassword && fieldStates.confirmPassword === 'success' && (
              <p className="text-green-600 text-xs mt-1 animate-fade-in flex items-center gap-1">
                <span>✓</span>
                <span>Xác nhận mật khẩu khớp</span>
              </p>
            )}
          </div>

          {/* Giảng viên thêm thông tin chuyên môn */}
          {role === "instructor" && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Chuyên môn *
                </label>
                <input
                  type="text"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="VD: Lập trình, Thiết kế web..."
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 transition-all ${
                    touchedFields.expertise && fieldErrors.expertise 
                      ? "border-2 border-red-400 bg-red-50 focus:ring-red-500" 
                      : touchedFields.expertise && fieldStates.expertise === 'success' && !fieldErrors.expertise
                      ? "border-2 border-green-400 bg-green-50 focus:ring-green-500"
                      : "border-0 bg-gray-100 focus:ring-indigo-500"
                  }`}
                  required
                />
                {touchedFields.expertise && fieldErrors.expertise && (
                  <p className="text-red-600 text-xs mt-1 animate-fade-in flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{fieldErrors.expertise}</span>
                  </p>
                )}
                {touchedFields.expertise && !fieldErrors.expertise && fieldStates.expertise === 'success' && (
                  <p className="text-green-600 text-xs mt-1 animate-fade-in flex items-center gap-1">
                    <span>✓</span>
                    <span>Chuyên môn hợp lệ</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Số năm kinh nghiệm
                </label>
                <input
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Giới thiệu ngắn *
                </label>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows="3"
                  placeholder="Giới thiệu bản thân..."
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 transition-all ${
                    touchedFields.biography && fieldErrors.biography 
                      ? "border-2 border-red-400 bg-red-50 focus:ring-red-500" 
                      : touchedFields.biography && fieldStates.biography === 'success' && !fieldErrors.biography
                      ? "border-2 border-green-400 bg-green-50 focus:ring-green-500"
                      : "border-0 bg-gray-100 focus:ring-indigo-500"
                  }`}
                  required
                ></textarea>
                {touchedFields.biography && fieldErrors.biography && (
                  <p className="text-red-600 text-xs mt-1 animate-fade-in flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{fieldErrors.biography}</span>
                  </p>
                )}
                {touchedFields.biography && !fieldErrors.biography && fieldStates.biography === 'success' && (
                  <p className="text-green-600 text-xs mt-1 animate-fade-in flex items-center gap-1">
                    <span>✓</span>
                    <span>Giới thiệu hợp lệ</span>
                  </p>
                )}
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
              className="w-4 h-4 mt-1 rounded border-gray-300 cursor-pointer"
            />
            <label htmlFor="terms" className={`text-sm ${
              touchedFields.agreeTerms && fieldErrors.agreeTerms 
                ? "text-red-600" 
                : touchedFields.agreeTerms && fieldStates.agreeTerms === 'success'
                ? "text-green-600"
                : "text-gray-600"
            }`}>
              Tôi đồng ý với{" "}
              <a href="#" className="text-indigo-600 hover:underline font-semibold">
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a href="#" className="text-indigo-600 hover:underline font-semibold">
                Chính sách bảo mật
              </a>
            </label>
            {touchedFields.agreeTerms && fieldErrors.agreeTerms && (
              <p className="text-red-600 text-xs mt-1 animate-fade-in flex items-center gap-1">
                <span>⚠️</span>
                <span>{fieldErrors.agreeTerms}</span>
              </p>
            )}
          </div>

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
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in { animation: fade-in 0.3s ease-out; }
    `}</style>
  </div>
  <Footer />
</>
);
}
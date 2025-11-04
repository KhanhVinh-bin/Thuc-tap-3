"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/lib/auth-context"; // ✅ import useAuth

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); // ✅ sử dụng hook useAuth
  
  const [userType, setUserType] = useState("student"); // student | instructor
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shakeInput, setShakeInput] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [fieldStates, setFieldStates] = useState({}); // 'idle', 'error', 'success'
  
  // Validation function cho từng trường
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value.trim()) return "Vui lòng nhập email";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email không hợp lệ";
        return "";
      case "password":
        if (!value.trim()) return "Vui lòng nhập mật khẩu";
        return "";
      default:
        return "";
    }
  };

  // Handle blur - validate khi rời khỏi input
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    if (error) {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
      setFieldStates(prev => ({ ...prev, [name]: 'error' }));
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      // Only show success if field has value
      if (value.trim()) {
        setFieldStates(prev => ({ ...prev, [name]: 'success' }));
      } else {
        setFieldStates(prev => ({ ...prev, [name]: 'idle' }));
      }
    }
  };

  // Hiệu ứng rung khi nhập sai
  const triggerShake = (msg) => {
    setError(msg);
    setShakeInput(true);
    setTimeout(() => setShakeInput(false), 500);
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    // Validation
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!formData.password.trim()) {
      errors.password = "Vui lòng nhập mật khẩu";
    }

    // Đánh dấu tất cả các trường là đã touched khi submit
    setTouchedFields({ email: true, password: true });
    // Reset field states on submit
    setFieldStates({ email: 'idle', password: 'idle' });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Vui lòng điền đầy đủ thông tin");
      // Set error states for invalid fields
      Object.keys(errors).forEach(field => {
        setFieldStates(prev => ({ ...prev, [field]: 'error' }));
      });
      triggerShake("");
      return;
    }

    const apiUrl =
      userType === "student"
        ? "https://localhost:7025/api/Users/Login"
        : "https://localhost:3001/api/Auth/Post/login/Dang_Nhap";

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // ✅ Clone response để có thể đọc nhiều lần nếu cần
      const responseClone = res.clone();
      
      // Kiểm tra lỗi và lấy thông tin chi tiết
      if (!res.ok) {
        let errorMessage = "Đăng nhập thất bại";
        try {
          // ✅ Đọc text trước, rồi parse JSON nếu có thể
          const errorText = await responseClone.text();
          console.error("Lỗi server (status " + res.status + "):", errorText);
          
          // Thử parse JSON
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorText;
          } catch {
            // Nếu không parse được, dùng text trực tiếp
            errorMessage = errorText || `Đăng nhập thất bại (${res.status})`;
          }
        } catch (e) {
          console.error("Lỗi khi đọc response:", e);
          errorMessage = `Đăng nhập thất bại (${res.status})`;
        }
        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log("Kết quả:", result);

      // Decode JWT token để lấy thông tin user (cho instructor)
      let userId = null;
      let userEmail = formData.email; // Dùng email từ form nếu không decode được
      let userName = null;
      let userRole = "Học viên";
      let isInstructor = false;

      if (result.token && userType === "instructor") {
        try {
          // Decode JWT token (chỉ phần payload, không verify)
          const tokenParts = result.token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            
            // Lấy userId từ các format khác nhau của nameidentifier claim
            const nameId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
                          payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"] ||
                          payload.nameidentifier ||
                          payload.nameid ||
                          payload.sub;
            if (nameId) {
              userId = parseInt(nameId) || null;
            }
            
            // Lấy email từ các format khác nhau của name claim
            const name = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
                        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/name"] ||
                        payload.unique_name ||
                        payload.name ||
                        payload.email;
            if (name) {
              userEmail = name;
            }
            
            // Kiểm tra role từ claims (hỗ trợ cả array và string)
            const rolesClaim = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
                              payload.role ||
                              payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/groups"];
            if (Array.isArray(rolesClaim)) {
              isInstructor = rolesClaim.some(r => r.toLowerCase() === "instructor");
            } else if (rolesClaim) {
              isInstructor = rolesClaim.toLowerCase() === "instructor";
            }
            
            console.log("Decoded JWT payload:", { userId, userEmail, isInstructor, rolesClaim });
          }
        } catch (e) {
          console.warn("Không thể decode JWT token:", e);
        }
      }

      // Xử lý role từ response - Hỗ trợ nhiều cách xác định role
      // 1. Kiểm tra RoleId (thường 2 = instructor, 1 = student)
      if (result.roleId !== undefined || result.RoleId !== undefined) {
        const roleId = result.roleId || result.RoleId;
        if (roleId === 2 || roleId === "2") {
          isInstructor = true;
          userRole = "Giảng viên";
        } else {
          isInstructor = false;
          userRole = "Học viên";
        }
      }
      
      // 2. Kiểm tra roles array
      if (result.roles && Array.isArray(result.roles)) {
        const hasInstructor = result.roles.some(r => {
          const roleLower = String(r).toLowerCase();
          return roleLower === "instructor" || roleLower === "giảng viên";
        });
        
        if (hasInstructor) {
          isInstructor = true;
          userRole = "Giảng viên";
        } else {
          // Chỉ set student nếu chưa xác định được role từ RoleId
          if (result.roleId === undefined && result.RoleId === undefined) {
            const roleName = result.roles[0];
            if (roleName) {
              const roleLower = String(roleName).toLowerCase();
              isInstructor = roleLower === "instructor";
              userRole = isInstructor ? "Giảng viên" : 
                         roleLower === "student" ? "Học viên" : roleName;
            }
          }
        }
      } 
      // 3. Kiểm tra role (single value)
      else if (result.role) {
        const roleLower = String(result.role).toLowerCase();
        isInstructor = roleLower === "instructor" || roleLower === "giảng viên";
        userRole = isInstructor ? "Giảng viên" : 
                   roleLower === "student" ? "Học viên" : result.role;
      } 
      // 4. Fallback: dựa vào userType
      else if (userType === "instructor" || isInstructor) {
        userRole = "Giảng viên";
        isInstructor = true;
      }

      // Lấy thông tin từ student login response (nếu có)
      if (userType === "student" && result.userId) {
        userId = result.userId;
        userName = result.fullName || result.name || userName;
        userEmail = result.email || userEmail;
        // Chỉ override nếu chưa xác định được role từ RoleId hoặc roles
        if (result.roleId === undefined && result.RoleId === undefined && 
            (!result.roles || !result.roles.length)) {
          if (result.roles && Array.isArray(result.roles)) {
            const roleLower = result.roles[0]?.toLowerCase();
            userRole = roleLower === "student" ? "Học viên" : result.roles[0];
            isInstructor = false;
          }
        }
      }

      // ✅ Lưu user vào context + localStorage
      // Lấy token từ response
      const authToken = result.token || result.Token || null;
      
      // Xác định lại role một lần nữa để chắc chắn
      // Kiểm tra RoleId, roles array, role string, và userType
      const roleId = result.roleId || result.RoleId;
      const hasInstructorRoleId = roleId === 2 || roleId === "2";
      
      const finalIsInstructor = hasInstructorRoleId ||
                                 userType === "instructor" || 
                                 isInstructor || 
                                 userRole === "Giảng viên" || 
                                 userRole === "Instructor" ||
                                 (result.roles && result.roles.some(r => {
                                   const rStr = String(r).toLowerCase();
                                   return rStr === "instructor" || rStr === "giảng viên";
                                 }));
      
      const finalRole = finalIsInstructor ? "Giảng viên" : "Học viên";
      
      // Log để debug
      console.log("🔍 Xác định role:", {
        roleId: roleId,
        hasInstructorRoleId,
        roles: result.roles,
        userRole,
        isInstructor,
        finalIsInstructor,
        finalRole,
        userType
      });
      
      // ✅ Kiểm tra role có khớp với tab đã chọn không
      if (userType === "student" && finalIsInstructor) {
        // Học viên đăng nhập nhưng là giảng viên
        throw new Error("Không tìm thấy tài khoản học viên. Vui lòng đăng nhập bằng tab Giảng viên.");
      }
      
      if (userType === "instructor" && !finalIsInstructor) {
        // Giảng viên đăng nhập nhưng là học viên
        throw new Error("Không tìm thấy tài khoản giảng viên. Vui lòng đăng nhập bằng tab Học viên.");
      }
      
      // ✅ Lưu vào localStorage TRƯỚC để đảm bảo layout có thể đọc được
      const userData = {
        id: userId,
        userId: userId,
        name: userName || result.fullName || result.name || "Người dùng",
        email: userEmail,
        role: finalRole,
      }
      
      // Lưu vào localStorage ngay lập tức
      localStorage.setItem("currentUser", JSON.stringify(userData))
      if (authToken) {
        localStorage.setItem("authToken", authToken)
      }
      
      // Sau đó mới update state
      login(userData, authToken); // ✅ Truyền token riêng như tham số thứ 2

      // ✅ Chuyển trang theo role - Tăng delay để đảm bảo state đã được cập nhật
      setTimeout(() => {
        try {
          if (finalIsInstructor) {
            // Instructor chuyển sang trang dashboard giảng viên
            console.log("✅ Chuyển trang giảng viên → /giangvien/tongquan");
            // Sử dụng window.location để đảm bảo full reload và clear redirect params
            window.location.href = "/giangvien/tongquan";
          } else {
            // Student hoặc user khác chuyển sang trang khóa học
            console.log("✅ Chuyển trang học viên → /courses");
            window.location.href = "/courses";
          }
        } catch (redirectError) {
          console.error("❌ Lỗi khi chuyển trang:", redirectError);
          // Fallback: chuyển sang trang khóa học nếu có lỗi
          router.push("/courses");
        }
      }, 200);
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      triggerShake(err.message || "Sai email hoặc mật khẩu!");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits =
    userType === "student"
      ? [
          "Truy cập hàng ngàn khóa học chất lượng",
          "Học tập theo tiến độ riêng",
          "Nhận chứng chỉ sau khi hoàn thành",
          "Tương tác trực tiếp với giảng viên",
          "Theo dõi tiến độ học tập chi tiết",
        ]
      : [
          "Tạo và quản lý khóa học không giới hạn",
          "Theo dõi tiến độ học viên",
          "Tạo bài tập và nội dung giảng dạy",
          "Nhận doanh thu từ khóa học",
          "Phân tích thống kê học viên chi tiết",
        ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">EduLearn</h1>
                <p className="text-sm text-gray-600">Nền tảng học trực tuyến hàng đầu</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-3 text-gray-900">
              {userType === "student" ? "Nâng cao kỹ năng" : "Chia sẻ kiến thức"}
            </h2>
            <p className="text-gray-600 mb-8">
              {userType === "student"
                ? "Học từ các chuyên gia hàng đầu và phát triển sự nghiệp."
                : "Trở thành giảng viên và chia sẻ kiến thức cùng học viên."}
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

          {/* RIGHT */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 zoom-in">
            <h2 className="text-2xl font-bold mb-2 text-center">Đăng nhập</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Chọn vai trò và đăng nhập
            </p>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-full">
              <button
                type="button"
                onClick={() => setUserType("student")}
                className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
                  userType === "student"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600"
                }`}
              >
                Học viên
              </button>
              <button
                type="button"
                onClick={() => setUserType("instructor")}
                className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
                  userType === "instructor"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600"
                }`}
              >
                Giảng viên
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, email: value });
                    // Validate real-time nếu đã từng touched
                    if (touchedFields.email) {
                      const error = validateField("email", value);
                      if (error) {
                        setFieldErrors(prev => ({ ...prev, email: error }));
                        setFieldStates(prev => ({ ...prev, email: 'error' }));
                      } else {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.email;
                          return newErrors;
                        });
                        setFieldStates(prev => ({ ...prev, email: value.trim() ? 'success' : 'idle' }));
                      }
                    } else {
                      // Reset state when not touched yet
                      setFieldStates(prev => ({ ...prev, email: 'idle' }));
                    }
                  }}
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

              <div>
                <label className="block text-sm font-semibold mb-2">Mật khẩu *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, password: value });
                    // Validate real-time nếu đã từng touched
                    if (touchedFields.password) {
                      const error = validateField("password", value);
                      if (error) {
                        setFieldErrors(prev => ({ ...prev, password: error }));
                        setFieldStates(prev => ({ ...prev, password: 'error' }));
                      } else {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.password;
                          return newErrors;
                        });
                        setFieldStates(prev => ({ ...prev, password: value.trim() ? 'success' : 'idle' }));
                      }
                    } else {
                      // Reset state when not touched yet
                      setFieldStates(prev => ({ ...prev, password: 'idle' }));
                    }
                  }}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-lg focus:ring-2 transition-all ${
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
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <p className="text-center text-sm text-gray-600 pt-2">
                Chưa có tài khoản?{" "}
                <Link href="/register" className="text-indigo-600 hover:underline font-semibold">
                  Đăng ký ngay
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

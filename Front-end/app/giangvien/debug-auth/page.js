"use client";

import { useAuth } from "@/lib/auth-context";

export default function DebugAuthPage() {
  const { user, token, loading, isAuthenticated } = useAuth();

  const clearAuth = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");
    window.location.reload();
  };

  const createDemoToken = () => {
    const demoToken = `demo_token_instructor_${Date.now()}`;
    localStorage.setItem("authToken", demoToken);
    window.location.reload();
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Debug Authentication</h1>
      
      <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}>
        <h3>Auth Context State:</h3>
        <p><strong>Loading:</strong> {loading ? "true" : "false"}</p>
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? "true" : "false"}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : "null"}</p>
        <p><strong>Token:</strong> {token ? token : "null"}</p>
      </div>

      <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}>
        <h3>LocalStorage Values:</h3>
        <p><strong>currentUser:</strong> {typeof window !== 'undefined' ? localStorage.getItem("currentUser") : "N/A"}</p>
        <p><strong>authToken:</strong> {typeof window !== 'undefined' ? localStorage.getItem("authToken") : "N/A"}</p>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <button 
          onClick={clearAuth}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Clear All Auth Data
        </button>
        
        <button 
          onClick={createDemoToken}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Create Demo Token
        </button>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Nếu bạn đã đăng nhập nhưng không có token, click "Create Demo Token"</li>
          <li>Nếu muốn đăng nhập lại từ đầu, click "Clear All Auth Data" rồi đăng nhập lại</li>
          <li>Sau khi có token, bạn có thể test API ở trang /giangvien/api-test</li>
        </ol>
      </div>
    </div>
  );
}
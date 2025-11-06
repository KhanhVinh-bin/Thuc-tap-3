"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getInstructorCourses } from "../lib/instructorApi";

export default function ApiTestInstructor() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const testApi = async () => {
    if (!token) {
      setError("Không có token xác thực");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await getInstructorCourses(token);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Test Instructor API</h1>
      
      <div style={{ marginBottom: "2rem" }}>
        <h3>Authentication Status:</h3>
        <p>User: {user ? user.name || user.email || "Logged in" : "Not logged in"}</p>
        <p>Token: {token ? "✅ Available" : "❌ Missing"}</p>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>API Endpoint Being Tested:</h3>
      <code>GET https://localhost:5000/api/Courses/Get/my-courses/coursesAll/Thong_Tin_Nhieu_Khoa_Hoc</code>
        <p style={{ marginTop: "1rem", fontSize: "14px", color: "#666" }}>
      Base URL: https://localhost:5000 (Instructor API)
        </p>
      </div>

      <button 
        onClick={testApi} 
        disabled={loading || !token}
        style={{
          padding: "10px 20px",
          backgroundColor: loading || !token ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading || !token ? "not-allowed" : "pointer",
          marginTop: "1rem"
        }}
      >
        {loading ? "Testing..." : "Test API"}
      </button>

      {loading && (
        <div style={{ marginTop: "1rem" }}>
          <p>Loading...</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "1rem", color: "red" }}>
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}

      {data && (
        <div style={{ marginTop: "1rem" }}>
          <h3>API Response:</h3>
          <pre style={{ 
            backgroundColor: "#f5f5f5", 
            padding: "1rem", 
            borderRadius: "4px",
            overflow: "auto",
            maxHeight: "400px"
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
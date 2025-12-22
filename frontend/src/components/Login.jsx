import { useState } from "react";
import { loginUser } from "../api/authApi";
import "../Auth.css";

function Login({ onLogin }) {
  const [citizenId, setCitizenId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({ 
        citizenId: citizenId.trim(), 
        password: password.trim() 
      });
      
      if (response.data.success) {
        const userData = response.data.data;
        onLogin({
          ...userData,
          name: userData.fullName
        });
      } else {
        setError(response.data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("Login error:", err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      setError(serverMsg || "Lỗi đăng nhập: " + (err.response?.status === 401 ? "Sai thông tin đăng nhập" : err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Đăng Nhập</h2>
        {error && <div className="auth-error" style={{color: 'red', marginBottom: 10, textAlign: 'center'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mã số định danh</label>
            <input
              type="text"
              className="auth-input"
              value={citizenId}
              onChange={(e) => setCitizenId(e.target.value)}
              required
              placeholder="Nhập số CCCD/CMND"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>
        
        <div style={{marginTop: 20, fontSize: 12, color: '#666', background: '#f5f5f5', padding: 10, borderRadius: 4}}>
          <strong>Demo Credentials:</strong><br/>
          User: 001090000001 / password123<br/>
          Admin: 001090000008 / admin123
        </div>
      </div>
    </div>
  );
}

export default Login;

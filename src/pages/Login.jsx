import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .auth-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
          overflow: hidden;
        }

        .auth-left {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          position: relative;
        }

        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 20%, rgba(236,72,153,0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
          animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
        }

        .auth-brand-dot {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .auth-brand-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #f1f5f9;
          letter-spacing: -0.3px;
        }

        .auth-heading {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #f1f5f9;
          margin: 0 0 8px;
          line-height: 1.15;
          letter-spacing: -0.5px;
        }

        .auth-sub {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 36px;
        }

        .field-group { margin-bottom: 16px; }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .field-wrap { position: relative; }

        .field-input {
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #f1f5f9;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .field-input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        .field-input::placeholder { color: #475569; }

        .pass-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #475569;
          font-size: 16px;
          padding: 0;
          line-height: 1;
          transition: color 0.15s;
        }
        .pass-toggle:hover { color: #94a3b8; }

        .error-box {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: #fca5a5;
          margin-bottom: 16px;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          margin-top: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
          letter-spacing: 0.1px;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(99,102,241,0.45);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: #64748b;
        }
        .auth-footer a {
          color: #818cf8;
          text-decoration: none;
          font-weight: 500;
          margin-left: 4px;
          transition: color 0.15s;
        }
        .auth-footer a:hover { color: #a5b4fc; }

        .auth-right {
          width: 45%;
          background: linear-gradient(135deg, #0f0f1a 0%, #12121f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 48px;
          position: relative;
          overflow: hidden;
          border-left: 1px solid rgba(255,255,255,0.04);
        }

        .auth-right::before {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          top: -100px;
          right: -100px;
        }

        .chat-preview {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 320px;
        }

        .preview-label {
          font-size: 12px;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .bubble {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
          animation: bubbleIn 0.4s ease both;
        }
        .bubble:nth-child(2) { animation-delay: 0.15s; }
        .bubble:nth-child(3) { animation-delay: 0.3s; justify-content: flex-end; }
        .bubble:nth-child(4) { animation-delay: 0.45s; }

        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .bubble-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .bubble-avatar.a { background: rgba(99,102,241,0.2); }
        .bubble-avatar.b { background: rgba(20,184,166,0.2); }

        .bubble-msg {
          max-width: 200px;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.5;
        }
        .bubble-msg.received {
          background: rgba(255,255,255,0.06);
          color: #cbd5e1;
          border-radius: 4px 16px 16px 16px;
        }
        .bubble-msg.sent {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          border-radius: 16px 4px 16px 16px;
        }

        .bubble-time {
          font-size: 10px;
          color: #334155;
          align-self: flex-end;
          margin-bottom: 4px;
        }

        @media (max-width: 768px) {
          .auth-right { display: none; }
          .auth-left { padding: 32px 24px; }
        }
      `}</style>

      <div className="auth-root">
        <div className="auth-left">
          <div className="auth-card">
            <div className="auth-brand">
              <div className="auth-brand-dot">💬</div>
              <span className="auth-brand-name">LiveChat</span>
            </div>

            <h1 className="auth-heading">Welcome back 2</h1>
            <p className="auth-sub">Sign in to continue your conversations</p>

            {error && <div className="error-box">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label">Email</label>
                <input
                  className="field-input"
                  type="email"
                  name="email"
                  placeholder="ahmad@example.com"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <div className="field-wrap">
                  <input
                    className="field-input"
                    type={showPass ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    onChange={handleChange}
                    style={{ paddingRight: 44 }}
                    required
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in →"}
              </button>
            </form>

            <div className="auth-footer">
              Don't have an account?
              <Link to="/register">Create one</Link>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="chat-preview">
            <p className="preview-label">Live preview</p>

            <div className="bubble">
              <div className="bubble-avatar a">👋</div>
              <div className="bubble-msg received">Hey! Are you free to chat?</div>
              <span className="bubble-time">9:41</span>
            </div>

            <div className="bubble" style={{ justifyContent: "flex-end" }}>
              <span className="bubble-time">9:42</span>
              <div className="bubble-msg sent">Yeah, what's up? 😊</div>
            </div>

            <div className="bubble">
              <div className="bubble-avatar b">🎤</div>
              <div className="bubble-msg received">Sending you a voice note!</div>
              <span className="bubble-time">9:42</span>
            </div>

            <div className="bubble" style={{ justifyContent: "flex-end" }}>
              <span className="bubble-time">9:43</span>
              <div className="bubble-msg sent">Got it ✔✔</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
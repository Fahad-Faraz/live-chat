import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const uploadAvatar = async () => {
    if (!file) return;
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await API.put("/users/avatar", formData);
      updateUser?.(data);
      showToast("Avatar updated successfully!");
      setFile(null);
      setPreview(null);
    } catch (err) {
      showToast("Failed to update avatar.", "error");
    } finally {
      setAvatarLoading(false);
    }
  };

  const updateProfile = async () => {
    setProfileLoading(true);
    try {
      const { data } = await API.put("/users/profile", { name, email });
      updateUser?.(data);
      showToast("Profile updated!");
    } catch (err) {
      showToast("Failed to update profile.", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword) return showToast("Fill both fields.", "error");
    setPassLoading(true);
    try {
      await API.put("/users/password", { oldPassword, newPassword });
      showToast("Password changed!");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed.", "error");
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const avatarSrc = preview || user?.avatar || "https://www.gravatar.com/avatar/?d=mp";
  const initials = user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        .profile-root {
          min-height: 100vh;
          background: #0a0a0f;
          font-family: 'DM Sans', sans-serif;
          color: #f1f5f9;
          padding: 0;
        }

        /* TOPBAR */
        .topbar {
          height: 60px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          padding: 0 32px;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 10;
          backdrop-filter: blur(10px);
        }

        .back-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 20px;
          padding: 4px;
          border-radius: 8px;
          transition: color 0.15s, background 0.15s;
          display: flex;
          align-items: center;
        }
        .back-btn:hover { color: #f1f5f9; background: rgba(255,255,255,0.06); }

        .topbar-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #f1f5f9;
        }

        /* CONTENT */
        .profile-content {
          max-width: 640px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        /* AVATAR SECTION */
        .avatar-section {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 28px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          margin-bottom: 20px;
          animation: fadeUp 0.4s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .avatar-img {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(99,102,241,0.4);
        }

        .avatar-upload-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 28px;
          height: 28px;
          background: #6366f1;
          border: 2px solid #0a0a0f;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 13px;
          transition: background 0.15s;
        }
        .avatar-upload-btn:hover { background: #818cf8; }

        .avatar-info h2 {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 4px;
          color: #f1f5f9;
        }
        .avatar-info p {
          margin: 0 0 12px;
          font-size: 13px;
          color: #64748b;
        }

        .save-avatar-btn {
          padding: 8px 18px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .save-avatar-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .save-avatar-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* TABS */
        .tabs {
          display: flex;
          gap: 4px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 4px;
          margin-bottom: 20px;
          animation: fadeUp 0.4s 0.1s ease both;
        }

        .tab-btn {
          flex: 1;
          padding: 10px;
          background: none;
          border: none;
          border-radius: 10px;
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .tab-btn.active {
          background: rgba(99,102,241,0.15);
          color: #818cf8;
        }
        .tab-btn:hover:not(.active) { color: #94a3b8; background: rgba(255,255,255,0.04); }

        /* CARD */
        .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px;
          animation: fadeUp 0.4s 0.15s ease both;
        }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 20px;
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

        .field-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #f1f5f9;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .field-input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .field-input::placeholder { color: #475569; }

        .action-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
          margin-top: 4px;
        }
        .action-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
        }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* DANGER ZONE */
        .danger-card {
          margin-top: 20px;
          background: rgba(239,68,68,0.05);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 20px;
          padding: 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          animation: fadeUp 0.4s 0.2s ease both;
        }

        .danger-info h4 {
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 600;
          color: #fca5a5;
        }
        .danger-info p {
          margin: 0;
          font-size: 12px;
          color: #64748b;
        }

        .logout-btn {
          padding: 10px 20px;
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .logout-btn:hover { background: rgba(239,68,68,0.2); }

        /* TOAST */
        .toast {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          z-index: 100;
          animation: toastIn 0.3s ease;
          white-space: nowrap;
        }
        .toast.success {
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.3);
          color: #6ee7b7;
        }
        .toast.error {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.25);
          color: #fca5a5;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div className="profile-root">

        {/* TOPBAR */}
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate("/chat")}>←</button>
          <span className="topbar-title">Profile Settings</span>
        </div>

        <div className="profile-content">

          {/* AVATAR SECTION */}
          <div className="avatar-section">
            <div className="avatar-wrap">
              <img className="avatar-img" src={avatarSrc} alt="avatar" />
              <label className="avatar-upload-btn" title="Change photo">
                ✏️
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
              </label>
            </div>
            <div className="avatar-info">
              <h2>{user?.name}</h2>
              <p>{user?.email}</p>
              {file && (
                <button className="save-avatar-btn" onClick={uploadAvatar} disabled={avatarLoading}>
                  {avatarLoading ? "Uploading..." : "Save photo"}
                </button>
              )}
              {!file && <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>Click the pencil to change your photo</p>}
            </div>
          </div>

          {/* TABS */}
          <div className="tabs">
            <button className={`tab-btn ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
              👤 Edit Profile
            </button>
            <button className={`tab-btn ${activeTab === "password" ? "active" : ""}`} onClick={() => setActiveTab("password")}>
              🔒 Password
            </button>
          </div>

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="card">
              <p className="card-title">Personal Information</p>

              <div className="field-group">
                <label className="field-label">Full Name</label>
                <input
                  className="field-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Email Address</label>
                <input
                  className="field-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <button className="action-btn" onClick={updateProfile} disabled={profileLoading}>
                {profileLoading ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === "password" && (
            <div className="card">
              <p className="card-title">Change Password</p>

              <div className="field-group">
                <label className="field-label">Current Password</label>
                <input
                  className="field-input"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div className="field-group">
                <label className="field-label">New Password</label>
                <input
                  className="field-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                />
              </div>

              <button className="action-btn" onClick={changePassword} disabled={passLoading}>
                {passLoading ? "Updating..." : "Update password"}
              </button>
            </div>
          )}

          {/* DANGER ZONE */}
          <div className="danger-card">
            <div className="danger-info">
              <h4>Sign out</h4>
              <p>You'll be redirected to the login page</p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Sign out →</button>
          </div>
        </div>

        {/* TOAST */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.type === "success" ? "✓" : "⚠"} {toast.msg}
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
import { useEffect, useState } from "react";
import API from "../api/axios";

const Sidebar = ({
  selectedUser,
  setSelectedUser,
  onlineUsers = [],
  typingUsers = [],
  darkMode,
}) => {
  const [users, setUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchUnread();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUnread = async () => {
    try {
      const { data } = await API.get("/messages/unread/count");
      setUnreadCounts(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getLastSeen = (user) => {
    if (!user.lastSeen) return "Offline";
    const diff = Date.now() - new Date(user.lastSeen).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getUnread = (userId) => {
    const found = unreadCounts?.find((u) => u._id === userId);
    return found ? found.count : 0;
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ FIX: all colors use dynamic values, hover works in dark mode
  const bg = darkMode ? "#1f2937" : "#ffffff";
  const textPrimary = darkMode ? "#f3f4f6" : "#111827";
  const textSecondary = darkMode ? "#9ca3af" : "#6b7280";
  const borderColor = darkMode ? "#374151" : "#f3f4f6";
  const inputBg = darkMode ? "#374151" : "#f9fafb";
  const hoverBg = darkMode ? "#374151" : "#f3f4f6";
  const selectedBg = darkMode ? "#1d4ed8" : "#eff6ff";
  const selectedBorder = darkMode ? "#3b82f6" : "#93c5fd";

  return (
    <div style={{
      width: 300,
      borderRight: `1px solid ${borderColor}`,
      overflowY: "auto",
      height: "100%",
      background: bg,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>

      {/* HEADER */}
      <div style={{
        padding: "16px 16px 12px",
        borderBottom: `1px solid ${borderColor}`,
      }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700, color: textPrimary }}>
          Messages
        </h2>
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 14px",
            borderRadius: 20,
            border: `1px solid ${borderColor}`,
            background: inputBg,
            color: textPrimary,
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* USERS LIST */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredUsers.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: textSecondary, fontSize: 13 }}>
            No users found
          </div>
        )}

        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const isTypingNow = typingUsers.includes(user._id);
          const unread = getUnread(user._id);
          const isSelected = selectedUser?._id === user._id;

          return (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                borderBottom: `1px solid ${borderColor}`,
                background: isSelected ? selectedBg : "transparent",
                borderLeft: isSelected ? `3px solid ${selectedBorder}` : "3px solid transparent",
                transition: "background 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = hoverBg;
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = "transparent";
              }}
            >
              {/* AVATAR with online dot */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src={user.avatar || "https://www.gravatar.com/avatar/?d=mp"}
                  alt="avatar"
                  style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
                />
                {isOnline && (
                  <span style={{
                    position: "absolute",
                    bottom: 1,
                    right: 1,
                    width: 11,
                    height: 11,
                    background: "#10b981",
                    borderRadius: "50%",
                    border: `2px solid ${bg}`,
                  }} />
                )}
              </div>

              {/* INFO */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    color: textPrimary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {user.name}
                  </h3>

                  {/* UNREAD BADGE */}
                  {unread > 0 && (
                    <span style={{
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 10,
                      flexShrink: 0,
                    }}>
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>

                <p style={{
                  margin: "2px 0 0",
                  fontSize: 12,
                  color: isTypingNow ? "#3b82f6" : textSecondary,
                  fontStyle: isTypingNow ? "italic" : "normal",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {isTypingNow
                    ? "typing..."
                    : isOnline
                    ? "Online"
                    : getLastSeen(user)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
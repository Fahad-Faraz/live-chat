import { useState } from "react";
import API from "../api/axios";

const EMOJIS = ["❤️", "😂", "😮", "😢", "👍", "👎"];

const MessageBubble = ({ message, own, onReply, onDelete, onEdit }) => {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");

  const getStatus = () => {
    if (!own) return null;
    if (message.status === "seen") return { icon: "✔✔", label: "Seen", color: "#60a5fa" };
    if (message.status === "delivered") return { icon: "✔✔", label: "Delivered", color: "#9ca3af" };
    return { icon: "✔", label: "Sent", color: "#9ca3af" };
  };

  const status = getStatus();

  const handleReact = async (emoji) => {
    try {
      await API.put("/messages/reaction", { messageId: message._id, emoji });
      setShowEmojiBar(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/messages/${message._id}`);
      onDelete?.(message._id);
    } catch (err) {
      console.log(err);
    }
    setShowActions(false);
  };

  const handleEdit = async () => {
    try {
      await API.put("/messages/edit", { messageId: message._id, text: editText });
      onEdit?.(message._id, editText);
      setEditing(false);
    } catch (err) {
      console.log(err);
    }
  };

  if (message.deleted) {
    return (
      <div className={`flex ${own ? "justify-end" : "justify-start"} mb-1`}>
        <span style={{
          fontSize: 13,
          color: "#9ca3af",
          fontStyle: "italic",
          padding: "6px 14px",
          background: "rgba(0,0,0,0.05)",
          borderRadius: 16,
        }}>
          🚫 This message was deleted
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex ${own ? "justify-end" : "justify-start"} mb-1 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiBar(false); }}
    >
      <div style={{ maxWidth: "72%", position: "relative" }}>

        {/* Reply preview */}
        {message.replyTo && (
          <div style={{
            background: "rgba(0,0,0,0.07)",
            borderLeft: "3px solid #60a5fa",
            borderRadius: "8px 8px 0 0",
            padding: "6px 10px",
            fontSize: 12,
            color: "#6b7280",
            marginBottom: 2,
          }}>
            ↩ Replying to a message
          </div>
        )}

        {/* Pinned indicator */}
        {message.pinned && (
          <div style={{ fontSize: 11, color: "#f59e0b", marginBottom: 2, textAlign: own ? "right" : "left" }}>
            📌 Pinned
          </div>
        )}

        {/* Bubble */}
        <div style={{
          background: own
            ? "linear-gradient(135deg, #3b82f6, #2563eb)"
            : "rgba(243,244,246,1)",
          color: own ? "#fff" : "#111827",
          borderRadius: own ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "10px 14px",
          boxShadow: own
            ? "0 2px 8px rgba(59,130,246,0.3)"
            : "0 1px 4px rgba(0,0,0,0.08)",
          position: "relative",
          wordBreak: "break-word",
        }}>

          {/* Text or edit */}
          {editing ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: 8,
                  padding: "4px 8px",
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                }}
                autoFocus
              />
              <button onClick={handleEdit} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, padding: "4px 8px", color: "#fff", cursor: "pointer", fontSize: 12 }}>Save</button>
              <button onClick={() => setEditing(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 12 }}>Cancel</button>
            </div>
          ) : (
            message.text && (
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {message.text}
              </p>
            )
          )}

          {/* Image */}
          {message.image && (
            <img
              src={message.image}
              alt="img"
              style={{ maxHeight: 220, width: "100%", objectFit: "cover", borderRadius: 10, marginTop: message.text ? 8 : 0, display: "block" }}
            />
          )}

          {/* ✅ FIX: Voice uses message.voice field, not fileUrl */}
          {message.voice && (
            <audio controls style={{ marginTop: message.text ? 8 : 0, width: "100%", borderRadius: 8 }}>
              <source src={message.voice} type="audio/webm" />
            </audio>
          )}

          {/* File */}
          {message.fileUrl && !message.voice && (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: message.text ? 8 : 0,
                color: own ? "rgba(255,255,255,0.9)" : "#3b82f6",
                fontSize: 13,
                textDecoration: "none",
                background: own ? "rgba(255,255,255,0.15)" : "rgba(59,130,246,0.08)",
                padding: "6px 10px",
                borderRadius: 8,
              }}
            >
              📎 {message.fileName || "Download file"}
            </a>
          )}

          {/* Reactions */}
          {message.reactions?.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
              {message.reactions.map((r, i) => (
                <span key={i} style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 12,
                  padding: "2px 6px",
                  fontSize: 13,
                  backdropFilter: "blur(4px)",
                }}>
                  {r.emoji}
                </span>
              ))}
            </div>
          )}

          {/* Time + Status */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
          }}>
            <span style={{ fontSize: 10, opacity: 0.6 }}>
              {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {own && status && (
              <span style={{ fontSize: 10, color: status.color }}>{status.icon}</span>
            )}
          </div>
        </div>

        {/* Action buttons (hover) */}
        {showActions && (
          <div style={{
            position: "absolute",
            top: -30,
            [own ? "right" : "left"]: 0,
            display: "flex",
            gap: 4,
            background: "#1f2937",
            borderRadius: 20,
            padding: "4px 8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 10,
            whiteSpace: "nowrap",
          }}>
            <ActionBtn onClick={() => setShowEmojiBar(!showEmojiBar)} title="React">😊</ActionBtn>
            <ActionBtn onClick={() => onReply?.(message)} title="Reply">↩</ActionBtn>
            {own && !message.deleted && (
              <>
                {message.text && <ActionBtn onClick={() => setEditing(true)} title="Edit">✏️</ActionBtn>}
                <ActionBtn onClick={handleDelete} title="Delete">🗑</ActionBtn>
              </>
            )}
          </div>
        )}

        {/* Emoji bar */}
        {showEmojiBar && (
          <div style={{
            position: "absolute",
            top: -70,
            [own ? "right" : "left"]: 0,
            display: "flex",
            gap: 6,
            background: "#1f2937",
            borderRadius: 20,
            padding: "6px 10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 20,
          }}>
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => handleReact(e)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", transition: "transform 0.1s" }}
                onMouseEnter={(el) => (el.currentTarget.style.transform = "scale(1.3)")}
                onMouseLeave={(el) => (el.currentTarget.style.transform = "scale(1)")}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ActionBtn = ({ onClick, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 14,
      padding: "2px 4px",
      borderRadius: 6,
      color: "#fff",
      transition: "background 0.15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
  >
    {children}
  </button>
);

export default MessageBubble;
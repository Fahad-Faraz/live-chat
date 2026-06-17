import {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
} from "react";
import API from "../api/axios";
import MessageBubble from "./MessageBubble";
import { AuthContext } from "../context/AuthContext";
import EmojiPicker from "emoji-picker-react";

const ChatBox = ({ selectedUser, socket, darkMode }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef();
  const typingTimeout = useRef(null);
  const fileInputRef = useRef();

  const { user } = useContext(AuthContext);

  /* ── VOICE RECORDING ─────────────────────────── */

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.log(err);
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  /* ── FETCH MESSAGES ───────────────────────────── */

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  const fetchMessages = async () => {
    try {
      const { data } = await API.get(`/messages/${selectedUser._id}`);
      setMessages(data);

      if (socket) {
        socket.emit("messageSeen", {
          senderId: selectedUser._id,
          receiverId: user._id,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* ── RECEIVE MESSAGE ──────────────────────────── */

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      if (
        data.senderId === selectedUser?._id ||
        data.receiverId === selectedUser?._id
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("getMessage", handleMessage);
    return () => socket.off("getMessage", handleMessage);
  }, [socket, selectedUser]);

  /* ── MESSAGE SEEN ─────────────────────────────── */

  useEffect(() => {
    if (!socket) return;

    const handleSeen = () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === user._id ? { ...msg, status: "seen" } : msg
        )
      );
    };

    socket.on("messageSeen", handleSeen);
    return () => socket.off("messageSeen", handleSeen);
  }, [socket, user]);

  /* ── TYPING ───────────────────────────────────── */

  const handleTextChange = (e) => {
    setText(e.target.value);

    // ✅ NEW: emit typing to receiver
    if (socket && selectedUser) {
      socket.emit("typing", {
        senderId: user._id,
        receiverId: selectedUser._id,
      });

      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit("stopTyping", {
          senderId: user._id,
          receiverId: selectedUser._id,
        });
      }, 1500);
    }
  };

  /* ── SEND MESSAGE ─────────────────────────────── */

  const sendMessage = async () => {
    if (!text && !file && !audioBlob) return;

    try {
      const formData = new FormData();
      formData.append("receiverId", selectedUser._id);
      formData.append("text", text);

      if (replyTo) {
        formData.append("replyTo", replyTo._id);
      }

      if (file) formData.append("file", file);
      if (audioBlob) formData.append("file", audioBlob, "voice.webm");

      const { data } = await API.post("/messages", formData);

      socket?.emit("sendMessage", {
        senderId: user._id,
        receiverId: selectedUser._id,
        message: data,
      });

      socket?.emit("stopTyping", {
        senderId: user._id,
        receiverId: selectedUser._id,
      });

      setMessages((prev) => [...prev, data]);
      setText("");
      setFile(null);
      setAudioBlob(null);
      setReplyTo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ✅ FIX: was `setText((prev) + ...)` — wrong syntax
  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  /* ── HANDLERS from MessageBubble ─────────────── */

  const handleDelete = useCallback((msgId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === msgId ? { ...m, deleted: true, text: "" } : m
      )
    );
  }, []);

  const handleEdit = useCallback((msgId, newText) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === msgId ? { ...m, text: newText } : m))
    );
  }, []);

  /* ── AUTO SCROLL ──────────────────────────────── */

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── NO CHAT SELECTED ─────────────────────────── */

  if (!selectedUser) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: darkMode ? "#111827" : "#f9fafb",
        }}
      >
        <div style={{ fontSize: 64 }}>💬</div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: darkMode ? "#f3f4f6" : "#111827" }}>
          Select a conversation
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "#9ca3af" }}>
          Choose someone from the sidebar to start chatting
        </p>
      </div>
    );
  }

  const bg = darkMode ? "#111827" : "#f9fafb";
  const headerBg = darkMode ? "#1f2937" : "#ffffff";
  const inputBg = darkMode ? "#1f2937" : "#ffffff";
  const inputColor = darkMode ? "#f3f4f6" : "#111827";
  const borderColor = darkMode ? "#374151" : "#e5e7eb";
  const placeholderColor = darkMode ? "#6b7280" : "#9ca3af";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* HEADER */}
      <div style={{
        padding: "12px 20px",
        borderBottom: `1px solid ${borderColor}`,
        background: headerBg,
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        <img
          src={selectedUser.avatar || "https://www.gravatar.com/avatar/?d=mp"}
          alt="avatar"
          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
        />
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: inputColor }}>
            {selectedUser.name}
          </div>
          <div style={{ fontSize: 12, color: "#10b981" }}>
            online
          </div>
        </div>
      </div>

      {/* REPLY PREVIEW */}
      {replyTo && (
        <div style={{
          padding: "8px 20px",
          background: darkMode ? "#374151" : "#eff6ff",
          borderLeft: "3px solid #3b82f6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ fontSize: 13, color: "#3b82f6" }}>
            ↩ Replying to: <span style={{ color: inputColor }}>{replyTo.text || "media"}</span>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18 }}
          >
            ×
          </button>
        </div>
      )}

      {/* VOICE READY */}
      {audioBlob && (
        <div style={{
          padding: "8px 20px",
          background: darkMode ? "#064e3b" : "#d1fae5",
          color: "#10b981",
          fontSize: 13,
          borderBottom: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          🎤 Voice message recorded — click Send to send it
          <button
            onClick={() => setAudioBlob(null)}
            style={{ background: "none", border: "none", color: "#10b981", cursor: "pointer", fontSize: 16, marginLeft: "auto" }}
          >
            ×
          </button>
        </div>
      )}

      {/* FILE PREVIEW */}
      {file && (
        <div style={{
          padding: "8px 20px",
          background: darkMode ? "#1e3a5f" : "#eff6ff",
          color: "#3b82f6",
          fontSize: 13,
          borderBottom: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          📎 {file.name}
          <button
            onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
            style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 16, marginLeft: "auto" }}
          >
            ×
          </button>
        </div>
      )}

      {/* MESSAGES */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 16px",
        background: bg,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}>
        {messages.map((msg, i) => (
          <div
            key={msg._id || i}
            ref={i === messages.length - 1 ? scrollRef : null}
          >
            <MessageBubble
              message={msg}
              own={msg.senderId === user._id}
              onReply={setReplyTo}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>
        ))}
      </div>

      {/* INPUT AREA */}
      <div style={{
        padding: "12px 16px",
        borderTop: `1px solid ${borderColor}`,
        background: inputBg,
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
      }}>

        {/* Emoji */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 22,
              lineHeight: 1,
              padding: "6px",
              borderRadius: 8,
              color: "#9ca3af",
              transition: "color 0.15s",
            }}
            title="Emoji"
          >
            😊
          </button>
          {showEmoji && (
            <div style={{ position: "absolute", bottom: 48, left: 0, zIndex: 50 }}>
              <EmojiPicker onEmojiClick={onEmojiClick} theme={darkMode ? "dark" : "light"} height={350} />
            </div>
          )}
        </div>

        {/* File attach */}
        <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
          <span style={{
            fontSize: 22,
            padding: "6px",
            borderRadius: 8,
            color: "#9ca3af",
            lineHeight: 1,
          }}>
            📎
          </span>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: "none" }}
          />
        </label>

        {/* Text input */}
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          style={{
            flex: 1,
            border: `1px solid ${borderColor}`,
            borderRadius: 20,
            padding: "10px 16px",
            background: darkMode ? "#374151" : "#f3f4f6",
            color: inputColor,
            fontSize: 14,
            outline: "none",
            resize: "none",
            lineHeight: 1.5,
            maxHeight: 120,
            overflowY: "auto",
            fontFamily: "inherit",
          }}
        />

        {/* Voice */}
        <button
          onClick={recording ? stopRecording : startRecording}
          style={{
            background: recording ? "#ef4444" : "#10b981",
            border: "none",
            borderRadius: "50%",
            width: 42,
            height: 42,
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "transform 0.1s",
            boxShadow: recording ? "0 0 0 4px rgba(239,68,68,0.2)" : "none",
          }}
          title={recording ? "Stop recording" : "Voice message"}
        >
          {recording ? "⏹" : "🎤"}
        </button>

        {/* Send */}
        <button
          onClick={sendMessage}
          disabled={!text && !file && !audioBlob}
          style={{
            background: (!text && !file && !audioBlob) ? "#e5e7eb" : "#3b82f6",
            border: "none",
            borderRadius: "50%",
            width: 42,
            height: 42,
            cursor: (!text && !file && !audioBlob) ? "not-allowed" : "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.2s, transform 0.1s",
            color: "#fff",
          }}
          title="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
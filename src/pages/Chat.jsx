import { useEffect, useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";

import {
  socket,
  connectSocket,
  disconnectSocket,
} from "../api/Socket";

import { AuthContext } from "../context/AuthContext";

const Chat = () => {
  const [selectedUser, setSelectedUser] =
    useState(null);

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  const [typingUsers, setTypingUsers] =
    useState([]);

  const [darkMode, setDarkMode] =
    useState(false);

  const { user } =
    useContext(AuthContext);

  // Socket Connection
  useEffect(() => {
    if (!user?._id) return;

    connectSocket(user._id);

    socket.on(
      "getOnlineUsers",
      (users) => {
        setOnlineUsers(users);
      }
    );

    return () => {
      socket.off(
        "getOnlineUsers"
      );
      disconnectSocket();
    };
  }, [user]);

  // Typing Events
  useEffect(() => {
    const handleTyping = ({
      senderId,
    }) => {
      setTypingUsers((prev) =>
        prev.includes(senderId)
          ? prev
          : [...prev, senderId]
      );
    };

    const handleStopTyping = ({
      senderId,
    }) => {
      setTypingUsers((prev) =>
        prev.filter(
          (id) =>
            id !== senderId
        )
      );
    };

    socket.on(
      "typing",
      handleTyping
    );

    socket.on(
      "stopTyping",
      handleStopTyping
    );

    return () => {
      socket.off(
        "typing",
        handleTyping
      );

      socket.off(
        "stopTyping",
        handleStopTyping
      );
    };
  }, []);

  return (
    <div
      className={`h-screen flex relative ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-white text-black"
      }`}
    >
      {/* Dark Mode Button */}
      <button
        onClick={() =>
          setDarkMode(
            !darkMode
          )
        }
        className="absolute top-4 right-4 z-50 bg-gray-800 text-white px-3 py-2 rounded-lg shadow"
      >
        {darkMode
          ? "☀️ Light"
          : "🌙 Dark"}
      </button>

      {/* Sidebar */}
      <Sidebar
        selectedUser={
          selectedUser
        }
        setSelectedUser={
          setSelectedUser
        }
        onlineUsers={
          onlineUsers
        }
        typingUsers={
          typingUsers
        }
        darkMode={
          darkMode
        }
      />

      {/* Chat Box */}
      <ChatBox
        selectedUser={
          selectedUser
        }
        socket={socket}
        darkMode={
          darkMode
        }
      />
    </div>
  );
};

export default Chat;
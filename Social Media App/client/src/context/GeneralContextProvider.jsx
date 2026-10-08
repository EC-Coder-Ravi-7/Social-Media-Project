import React, { createContext, useCallback, useEffect, useState } from "react";
import io from "socket.io-client";

export const GeneralContext = createContext();

export const socket = io("http://localhost:6001");

export const GeneralContextProvider = ({ children }) => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Message unread state
  const [unreadMessages, setUnreadMessages] = useState({});
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [activeChatUserId, setActiveChatUserId] = useState(null);

  // Join user's personal socket room
  useEffect(() => {
    const joinUserRoom = () => {
      const userId =
        localStorage.getItem("userId") || localStorage.getItem("_id");

      if (!userId) {
        console.log("⚠️ Notification room: userId not available");
        return;
      }

      console.log("🔔 Joining notification room:", userId);

      socket.emit("join-user-room", {
        userId: String(userId),
      });
    };

    socket.on("connect", joinUserRoom);

    if (socket.connected) {
      joinUserRoom();
    }

    const interval = setInterval(() => {
      if (socket.connected) {
        joinUserRoom();
      }
    }, 1000);

    return () => {
      socket.off("connect", joinUserRoom);
      clearInterval(interval);
    };
  }, []);

  // Listen for new incoming messages globally
  useEffect(() => {
    const handleNewMessageNotification = (message) => {
      const currentUserId =
        localStorage.getItem("userId") || localStorage.getItem("_id");

      if (!currentUserId) return;

      if (String(message.receiverId) !== String(currentUserId)) {
        return;
      }

      const senderId = String(message.senderId);

      // If this conversation is currently open,
      // don't create an unread notification.
      if (String(activeChatUserId) === senderId) {
        return;
      }

      setUnreadMessages((prev) => ({
        ...prev,
        [senderId]: (prev[senderId] || 0) + 1,
      }));
    };

    socket.on("new-message-notification", handleNewMessageNotification);

    return () => {
      socket.off("new-message-notification", handleNewMessageNotification);
    };
  }, [activeChatUserId]);

  // Calculate total unread messages
  useEffect(() => {
    const total = Object.values(unreadMessages).reduce(
      (sum, count) => sum + count,
      0,
    );

    setTotalUnreadMessages(total);
  }, [unreadMessages]);

  // Clear unread messages for a particular sender
  const clearUnreadMessages = useCallback((senderId) => {
    setUnreadMessages((prev) => {
      const updated = { ...prev };

      delete updated[String(senderId)];

      return updated;
    });
  }, []);

  // Get unread count for a particular sender
  const getUnreadCount = useCallback(
    (senderId) => {
      return unreadMessages[String(senderId)] || 0;
    },
    [unreadMessages],
  );

  const setActiveChat = useCallback((userId) => {
    setActiveChatUserId(userId ? String(userId) : null);
  }, []);

  return (
    <GeneralContext.Provider
      value={{
        socket,

        isCreatePostOpen,
        setIsCreatePostOpen,

        isCreateStoryOpen,
        setIsCreateStoryOpen,

        isNotificationsOpen,
        setIsNotificationsOpen,

        unreadMessages,
        totalUnreadMessages,

        clearUnreadMessages,
        getUnreadCount,

        activeChatUserId,
        setActiveChat,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

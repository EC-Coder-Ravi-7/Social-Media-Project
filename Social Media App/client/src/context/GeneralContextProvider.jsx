import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import io from "socket.io-client";

export const GeneralContext = createContext();

export const socket = io("http://localhost:6001");

export const GeneralContextProvider = ({ children }) => {
  const [isCreatePostOpen, setIsCreatePostOpen] =
    useState(false);

  const [isCreateStoryOpen, setIsCreateStoryOpen] =
    useState(false);

  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState(false);

  // =====================================================
  // MESSAGE UNREAD STATE
  // =====================================================

  const [unreadMessages, setUnreadMessages] =
    useState({});

  const [totalUnreadMessages, setTotalUnreadMessages] =
    useState(0);

  const [activeChatUserId, setActiveChatUserId] =
    useState(null);

  // =====================================================
  // NOTIFICATION UNREAD STATE
  // =====================================================

  const [unreadNotifications, setUnreadNotifications] =
    useState(0);

  // =====================================================
  // JOIN USER'S PERSONAL SOCKET ROOM
  // =====================================================

  useEffect(() => {
    const joinUserRoom = () => {
      const userId =
        localStorage.getItem("userId") ||
        localStorage.getItem("_id");

      if (!userId) {
        console.log(
          "⚠️ Notification room: userId not available"
        );
        return;
      }

      console.log(
        "🔔 Joining notification room:",
        userId
      );

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

  // =====================================================
  // GLOBAL NEW MESSAGE NOTIFICATION
  // =====================================================

  useEffect(() => {
    const handleNewMessageNotification = (message) => {
      const currentUserId =
        localStorage.getItem("userId") ||
        localStorage.getItem("_id");

      if (!currentUserId) return;

      if (
        String(message.receiverId) !==
        String(currentUserId)
      ) {
        return;
      }

      const senderId = String(message.senderId);

      // If this conversation is currently open,
      // don't create an unread notification.
      if (
        String(activeChatUserId) ===
        senderId
      ) {
        return;
      }

      setUnreadMessages((prev) => ({
        ...prev,
        [senderId]:
          (prev[senderId] || 0) + 1,
      }));
    };

    socket.on(
      "new-message-notification",
      handleNewMessageNotification
    );

    return () => {
      socket.off(
        "new-message-notification",
        handleNewMessageNotification
      );
    };
  }, [activeChatUserId]);

  // =====================================================
  // GLOBAL NEW FOLLOW / OTHER NOTIFICATION
  // =====================================================

  useEffect(() => {
    const handleNewNotification = () => {
      setUnreadNotifications(
        (prev) => prev + 1
      );
    };

    socket.on(
      "new-notification",
      handleNewNotification
    );

    socket.on(
      "notification-received",
      handleNewNotification
    );

    return () => {
      socket.off(
        "new-notification",
        handleNewNotification
      );

      socket.off(
        "notification-received",
        handleNewNotification
      );
    };
  }, []);

  // =====================================================
  // CALCULATE TOTAL UNREAD MESSAGES
  // =====================================================

  useEffect(() => {
    const total = Object.values(
      unreadMessages
    ).reduce(
      (sum, count) => sum + count,
      0
    );

    setTotalUnreadMessages(total);
  }, [unreadMessages]);

  // =====================================================
  // CLEAR UNREAD MESSAGES FOR ONE USER
  // =====================================================

  const clearUnreadMessages = useCallback(
    (senderId) => {
      setUnreadMessages((prev) => {
        const updated = {
          ...prev,
        };

        delete updated[String(senderId)];

        return updated;
      });
    },
    []
  );

  // =====================================================
  // GET UNREAD MESSAGE COUNT FOR ONE USER
  // =====================================================

  const getUnreadCount = useCallback(
    (senderId) => {
      return (
        unreadMessages[String(senderId)] ||
        0
      );
    },
    [unreadMessages]
  );

  // =====================================================
  // SET ACTIVE CHAT
  // =====================================================

  const setActiveChat = useCallback(
    (userId) => {
      setActiveChatUserId(
        userId
          ? String(userId)
          : null
      );
    },
    []
  );

  // =====================================================
  // CLEAR NOTIFICATION RED BADGE
  // =====================================================

  const clearUnreadNotifications =
    useCallback(() => {
      setUnreadNotifications(0);
    }, []);

  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <GeneralContext.Provider
      value={{
        // Socket
        socket,

        // Create Post
        isCreatePostOpen,
        setIsCreatePostOpen,

        // Create Story
        isCreateStoryOpen,
        setIsCreateStoryOpen,

        // Notifications panel
        isNotificationsOpen,
        setIsNotificationsOpen,

        // =========================
        // Messages
        // =========================

        unreadMessages,
        totalUnreadMessages,

        clearUnreadMessages,
        getUnreadCount,

        activeChatUserId,
        setActiveChat,

        // =========================
        // Notifications
        // =========================

        unreadNotifications,
        clearUnreadNotifications,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};
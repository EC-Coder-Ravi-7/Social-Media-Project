import React, { useEffect, useRef, useState, useContext } from "react";
import "../styles/Chat.css";
import Navbar from "../components/Navbar";
import { FiSearch, FiSend } from "react-icons/fi";
import { GeneralContext } from "../context/GeneralContextProvider";
import navProfile from "../images/nav-profile.avif";
import axios from "axios";

const Chat = () => {
  const {
    socket,
    getUnreadCount,
    clearUnreadMessages,
    setActiveChat,
  } = useContext(GeneralContext);

  const userId = localStorage.getItem("userId");
  const currentUsername = localStorage.getItem("username");

  const [searchUser, setSearchUser] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);

  const [swipedMessageId, setSwipedMessageId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyingMessageId, setReplyingMessageId] = useState(null);

  const swipeStartX = useRef(0);
  const isMouseSwiping = useRef(false);

  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  /*
   * Clear the globally active chat when leaving
   * the Chat page.
   */
  useEffect(() => {
    return () => {
      setActiveChat(null);
    };
  }, [setActiveChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /*
   * Fetch mutual chat contacts
   */
  useEffect(() => {
    const fetchMutualContacts = async () => {
      if (!userId) return;

      try {
        const res = await axios.get(
          `http://localhost:6001/chat/contacts/${userId}`
        );

        const contacts = (res.data || []).map((user) => ({
          id: user.id || user._id,
          username: user.username,
          profilePic: user.profilePic || navProfile,
        }));

        setUsersList(contacts);

        if (contacts.length === 0) {
          setActiveChatUser(null);
        }
      } catch (err) {
        console.error(
          "Error fetching mutual chat contacts:",
          err
        );
      }
    };

    fetchMutualContacts();
  }, [userId]);

  /*
   * Socket listeners for the active conversation
   */
  useEffect(() => {
    if (!socket || !activeChatUser || !userId) return;

    const handleNewMessage = (data) => {
      const isCurrentConversation =
        (String(data.senderId) === String(activeChatUser.id) &&
          String(data.receiverId) === String(userId)) ||
        (String(data.senderId) === String(userId) &&
          String(data.receiverId) === String(activeChatUser.id));

      if (!isCurrentConversation) return;

      setMessages((prev) => [...prev, data]);

      /*
       * If receiver is currently viewing this conversation,
       * immediately mark the incoming message as seen.
       */
      if (
        String(data.senderId) === String(activeChatUser.id) &&
        String(data.receiverId) === String(userId)
      ) {
        socket.emit("mark-messages-seen", {
          userId,
          otherUserId: activeChatUser.id,
        });

        clearUnreadMessages(activeChatUser.id);
      }
    };

    const handleChatHistory = ({
      otherUserId,
      messages,
    }) => {
      if (
        String(otherUserId) ===
        String(activeChatUser.id)
      ) {
        setMessages(messages);
      }
    };

    const handleUserTyping = ({ senderId }) => {
      if (
        String(senderId) ===
        String(activeChatUser.id)
      ) {
        setIsOtherUserTyping(true);
      }
    };

    const handleUserStoppedTyping = ({
      senderId,
    }) => {
      if (
        String(senderId) ===
        String(activeChatUser.id)
      ) {
        setIsOtherUserTyping(false);
      }
    };

    const handleMessagesSeen = ({
      userId: seenByUserId,
    }) => {
      /*
       * The person who saw the messages must be
       * the other person in the current conversation.
       */
      if (
        String(seenByUserId) !==
        String(activeChatUser.id)
      ) {
        return;
      }

      setMessages((prev) =>
        prev.map((message) => {
          if (
            String(message.senderId) ===
            String(userId)
          ) {
            return {
              ...message,
              isSeen: true,
              seenAt: new Date().toISOString(),
            };
          }

          return message;
        })
      );
    };

    socket.on(
      "receive-message",
      handleNewMessage
    );

    socket.on(
      "chat-history",
      handleChatHistory
    );

    socket.on(
      "messages-seen",
      handleMessagesSeen
    );

    socket.on(
      "user-typing",
      handleUserTyping
    );

    socket.on(
      "user-stopped-typing",
      handleUserStoppedTyping
    );

    return () => {
      socket.off(
        "receive-message",
        handleNewMessage
      );

      socket.off(
        "chat-history",
        handleChatHistory
      );

      socket.off(
        "messages-seen",
        handleMessagesSeen
      );

      socket.off(
        "user-typing",
        handleUserTyping
      );

      socket.off(
        "user-stopped-typing",
        handleUserStoppedTyping
      );
    };
  }, [
    socket,
    activeChatUser,
    userId,
    clearUnreadMessages,
  ]);

  /*
   * When active chat changes:
   *
   * 1. Set global active chat
   * 2. Clear current messages temporarily
   * 3. Clear unread count
   * 4. Fetch chat history
   * 5. Mark received messages as seen
   */
  useEffect(() => {
    if (
      !socket ||
      !activeChatUser ||
      !userId
    ) {
      return;
    }

    setActiveChat(activeChatUser.id);

    setMessages([]);
    setIsOtherUserTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    isTypingRef.current = false;

    clearUnreadMessages(activeChatUser.id);

    socket.emit("fetch-chat-history", {
      userId,
      otherUserId: activeChatUser.id,
    });

    socket.emit("mark-messages-seen", {
      userId,
      otherUserId: activeChatUser.id,
    });
  }, [
    socket,
    activeChatUser,
    userId,
    setActiveChat,
    clearUnreadMessages,
  ]);

  /*
   * Typing
   */
  const handleTyping = (value) => {
    setTypedMessage(value);

    if (
      !socket ||
      !activeChatUser ||
      !userId
    ) {
      return;
    }

    if (!isTypingRef.current) {
      socket.emit("typing-started", {
        senderId: userId,
        receiverId: activeChatUser.id,
      });

      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-stopped", {
        senderId: userId,
        receiverId: activeChatUser.id,
      });

      isTypingRef.current = false;
    }, 1500);
  };

  /*
   * Send message
   */
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (
      !typedMessage.trim() ||
      !activeChatUser ||
      !socket
    ) {
      return;
    }

    const newMsg = {
      senderId: userId,
      senderName: currentUsername,
      receiverId: activeChatUser.id,
      text: typedMessage.trim(),
      replyToId: replyingTo?.id || null,
      timestamp: new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    };

    socket.emit("send-message", newMsg);

    if (typingTimeoutRef.current) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    socket.emit("typing-stopped", {
      senderId: userId,
      receiverId: activeChatUser.id,
    });

    isTypingRef.current = false;

    setTypedMessage("");
    setReplyingTo(null);
    setReplyingMessageId(null);
  };

  const filteredUsers = usersList.filter((u) =>
    u.username
      .toLowerCase()
      .includes(searchUser.toLowerCase())
  );

  const getMessageDate = (message) => {
    return new Date(message.createdAt);
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() ===
        date2.getFullYear() &&
      date1.getMonth() ===
        date2.getMonth() &&
      date1.getDate() ===
        date2.getDate()
    );
  };

  const getDateLabel = (date) => {
    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(
      today.getDate() - 1
    );

    if (isSameDay(date, today)) {
      return "Today";
    }

    if (isSameDay(date, yesterday)) {
      return "Yesterday";
    }

    const differenceInDays = Math.floor(
      (today.setHours(0, 0, 0, 0) -
        new Date(date).setHours(
          0,
          0,
          0,
          0
        )) /
        (1000 * 60 * 60 * 24)
    );

    if (differenceInDays < 7) {
      return date.toLocaleDateString(
        [],
        {
          weekday: "long",
        }
      );
    }

    return date.toLocaleDateString(
      [],
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  /*
   * Touch swipe
   */
  const handleMessageTouchStart = (e) => {
    swipeStartX.current =
      e.touches[0].clientX;
  };

  const handleMessageTouchEnd = (
    e,
    message
  ) => {
    const touchEndX =
      e.changedTouches[0].clientX;

    const swipeDistance =
      touchEndX - swipeStartX.current;

    // Swipe right → Reply
    if (swipeDistance > 60) {
      setReplyingTo(message);
      setReplyingMessageId(message.id);
      setSwipedMessageId(null);
      return;
    }

    // Swipe left → Show time
    if (swipeDistance < -60) {
      setSwipedMessageId(message.id);
      return;
    }

    // Small/no swipe → hide timestamp
    if (Math.abs(swipeDistance) < 30) {
      setSwipedMessageId(null);
    }
  };

  /*
   * Mouse swipe
   */
  const handleMessageMouseDown = (e) => {
    swipeStartX.current = e.clientX;
    isMouseSwiping.current = true;
  };

  const handleMessageMouseUp = (
    e,
    message
  ) => {
    if (!isMouseSwiping.current) {
      return;
    }

    const swipeDistance =
      e.clientX - swipeStartX.current;

    isMouseSwiping.current = false;

    // Mouse drag right → Reply
    if (swipeDistance > 60) {
      setReplyingTo(message);
      setReplyingMessageId(message.id);
      setSwipedMessageId(null);
      return;
    }

    // Mouse drag left → Show time
    if (swipeDistance < -60) {
      setSwipedMessageId(message.id);
      return;
    }

    // Small/no drag → hide timestamp
    if (Math.abs(swipeDistance) < 30) {
      setSwipedMessageId(null);
    }
  };

  /*
   * IMPORTANT:
   *
   * Find the latest outgoing message which has been seen.
   *
   * This is calculated ONCE, outside messages.map().
   * Therefore only one "Seen" label can appear.
   */
  const lastSeenMessageIndex = messages.reduce(
    (lastIndex, message, index) => {
      if (
        String(message.senderId) ===
          String(userId) &&
        message.isSeen
      ) {
        return index;
      }

      return lastIndex;
    },
    -1
  );

  return (
    <div className="chatRoot">
      <Navbar />

      <div className="igChatContainer">
        {/* LEFT SIDEBAR */}
        <div
          className={`igChatSidebar ${
            activeChatUser
              ? "hideOnMobile"
              : ""
          }`}
        >
          <div className="igChatSidebarHeader">
            <h3>{currentUsername}</h3>
          </div>

          <div className="igChatSearchWrapper">
            <FiSearch className="igSearchIcon" />

            <input
              type="text"
              placeholder="Search mutual friends..."
              value={searchUser}
              onChange={(e) =>
                setSearchUser(
                  e.target.value
                )
              }
            />
          </div>

          <div className="igConversationsList">
            {filteredUsers.length === 0 ? (
              <p className="noConversationsText">
                No mutual connections found
              </p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`igConversationCard ${
                    activeChatUser?.id ===
                    user.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    /*
                     * Clicking the currently open
                     * conversation should do nothing.
                     *
                     * This prevents the chat from
                     * being cleared/re-fetched.
                     */
                    if (
                      activeChatUser?.id ===
                      user.id
                    ) {
                      return;
                    }

                    setActiveChatUser(user);
                  }}
                >
                  <img
                    src={user.profilePic}
                    alt={user.username}
                    className="contactAvatar"
                  />

                  <div className="contactInfo">
                    <div className="contactNameRow">
                      <p className="contactName">
                        {user.username}
                      </p>

                      {getUnreadCount(
                        user.id
                      ) > 0 && (
                        <span className="chatUnreadBadge">
                          {getUnreadCount(
                            user.id
                          ) > 99
                            ? "99+"
                            : getUnreadCount(
                                user.id
                              )}
                        </span>
                      )}
                    </div>

                    <span className="contactSubtext">
                      Mutual Friend
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT CHAT */}
        <div
          className={`igChatMain ${
            !activeChatUser
              ? "hideOnMobile"
              : ""
          }`}
        >
          {activeChatUser ? (
            <>
              {/* CHAT HEADER */}
              <div className="igChatMainHeader">
                <button
                  className="mobileBackBtn"
                  onClick={() => {
                    setActiveChatUser(null);
                    setActiveChat(null);
                  }}
                >
                  ←
                </button>

                <img
                  src={activeChatUser.profilePic}
                  alt={activeChatUser.username}
                  className="activeAvatar"
                />

                <div className="activeUserMeta">
                  <h4>
                    {activeChatUser.username}
                  </h4>

                  <span
                    className={
                      isOtherUserTyping
                        ? "typingStatus"
                        : ""
                    }
                  >
                    {isOtherUserTyping
                      ? "Typing..."
                      : "Active now"}
                  </span>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="igMessagesBody">
                {messages.length === 0 ? (
                  <div className="noMessagesPlaceholder">
                    <img
                      src={
                        activeChatUser.profilePic
                      }
                      alt=""
                      className="largePlaceholderAvatar"
                    />

                    <h4>
                      {activeChatUser.username}
                    </h4>

                    <p>
                      Send a message to start
                      chatting on SocialeX.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMine =
                      String(msg.senderId) ===
                      String(userId);

                    const currentDate =
                      getMessageDate(msg);

                    const previousMessage =
                      messages[index - 1];

                    const previousDate =
                      previousMessage
                        ? getMessageDate(
                            previousMessage
                          )
                        : null;

                    const showDateSeparator =
                      !previousDate ||
                      !isSameDay(
                        currentDate,
                        previousDate
                      );

                    return (
                      <React.Fragment
                        key={msg.id}
                      >
                        {showDateSeparator && (
                          <div className="chatDateSeparator">
                            <span>
                              {getDateLabel(
                                currentDate
                              )}
                            </span>
                          </div>
                        )}

                        <div
                          className={`messageSwipeWrapper ${
                            swipedMessageId ===
                            msg.id
                              ? "showMessageTime"
                              : ""
                          } ${
                            replyingMessageId ===
                            msg.id
                              ? "replyingMessage"
                              : ""
                          }`}
                          onTouchStart={
                            handleMessageTouchStart
                          }
                          onTouchEnd={(e) =>
                            handleMessageTouchEnd(
                              e,
                              msg
                            )
                          }
                          onMouseDown={
                            handleMessageMouseDown
                          }
                          onMouseUp={(e) =>
                            handleMessageMouseUp(
                              e,
                              msg
                            )
                          }
                        >
                          <div className="messageTimeReveal">
                            {msg.timestamp}
                          </div>

                          <div
                            className={`igMessageRow ${
                              isMine
                                ? "mine"
                                : "theirs"
                            }`}
                          >
                            {!isMine && (
                              <img
                                src={
                                  activeChatUser.profilePic
                                }
                                alt=""
                                className="bubbleAvatar"
                              />
                            )}

                            <div
                              className={`igBubble ${
                                isMine
                                  ? "mine"
                                  : "theirs"
                              }`}
                            >
                              {msg.replyTo && (
                                <div className="repliedMessage">
                                  <span className="repliedMessageUser">
                                    {msg.replyTo
                                      .senderId ===
                                    userId
                                      ? "You"
                                      : activeChatUser.username}
                                  </span>

                                  <p>
                                    {
                                      msg.replyTo
                                        .text
                                    }
                                  </p>
                                </div>
                              )}

                              <p className="messageText">
                                {msg.text}
                              </p>

                              {/*
                               * Instagram-style Seen:
                               * ONLY the latest seen
                               * outgoing message shows Seen.
                               */}
                              {isMine &&
                                msg.isSeen &&
                                index ===
                                  lastSeenMessageIndex && (
                                  <span className="messageSeenStatus">
                                    Seen
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <form
                className="igChatInputArea"
                onSubmit={handleSendMessage}
              >
                {replyingTo && (
                  <div className="replyPreview">
                    <div className="replyPreviewContent">
                      <span>
                        Replying to
                      </span>

                      <p>
                        {replyingTo.text}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="replyCancelBtn"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyingMessageId(
                          null
                        );
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="igInputBoxWrapper">
                  <input
                    type="text"
                    placeholder="Message..."
                    value={typedMessage}
                    onFocus={() =>
                      setSwipedMessageId(
                        null
                      )
                    }
                    onChange={(e) => {
                      setSwipedMessageId(
                        null
                      );
                      handleTyping(
                        e.target.value
                      );
                    }}
                  />

                  <button
                    type="submit"
                    className="igSendBtn"
                    disabled={
                      !typedMessage.trim()
                    }
                  >
                    <FiSend />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="noChatSelected">
              <div className="noChatIcon">
                💬
              </div>

              <h3>Your Messages</h3>

              <p>
                Follow users who follow you back
                to unlock direct messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
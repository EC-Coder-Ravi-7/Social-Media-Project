import React, { useEffect, useRef, useState, useContext } from 'react';
import "../styles/Chat.css";
import Navbar from "../components/Navbar";
import { FiSearch, FiSend } from "react-icons/fi";
import { BsImage } from "react-icons/bs";
import { GeneralContext } from "../context/GeneralContextProvider";
import navProfile from "../images/nav-profile.avif";
import axios from "axios";

const Chat = () => {
  const { socket } = useContext(GeneralContext);
  const userId = localStorage.getItem("userId");

  const currentUsername = localStorage.getItem("username");

  const [searchUser, setSearchUser] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);

  const [swipedMessageId, setSwipedMessageId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const touchStartX = useRef(0);

  const [messages, setMessages] = useState([]);

  const [typedMessage, setTypedMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMutualContacts = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(
          `http://localhost:6001/chat/contacts/${userId}`,
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
        console.error("Error fetching mutual chat contacts:", err);
      }
    };

    fetchMutualContacts();
  }, [userId]);

  useEffect(() => {
    if (!socket || !activeChatUser || !userId) return;

    const handleNewMessage = (data) => {
      if (
        (data.senderId === activeChatUser.id && data.receiverId === userId) ||
        (data.senderId === userId && data.receiverId === activeChatUser.id)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    const handleChatHistory = ({ otherUserId, messages }) => {
      if (otherUserId === activeChatUser.id) {
        setMessages(messages);
      }
    };

    socket.on("receive-message", handleNewMessage);
    socket.on("chat-history", handleChatHistory);

    return () => {
      socket.off("receive-message", handleNewMessage);
      socket.off("chat-history", handleChatHistory);
    };
  }, [socket, activeChatUser, userId]);

  useEffect(() => {
    if (!socket || !activeChatUser || !userId) return;

    setMessages([]);

    socket.emit("fetch-chat-history", {
      userId,
      otherUserId: activeChatUser.id,
    });
  }, [socket, activeChatUser, userId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChatUser || !socket) return;

    const newMsg = {
      senderId: userId,
      senderName: currentUsername,
      receiverId: activeChatUser.id,
      text: typedMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send-message", newMsg);
    setTypedMessage("");
  };

  const filteredUsers = usersList.filter((u) =>
    u.username.toLowerCase().includes(searchUser.toLowerCase()),
  );

  const getMessageDate = (message) => {
    return new Date(message.createdAt);
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getDateLabel = (date) => {
    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(date, today)) {
      return "Today";
    }

    if (isSameDay(date, yesterday)) {
      return "Yesterday";
    }

    const differenceInDays = Math.floor(
      (today.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24),
    );

    if (differenceInDays < 7) {
      return date.toLocaleDateString([], {
        weekday: "long",
      });
    }

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleMessageTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleMessageTouchEnd = (e, message) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX.current;

    // Swipe right → Reply
    if (swipeDistance > 60) {
      setReplyingTo(message);
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

  return (
    <div className="chatRoot">
      <Navbar />

      <div className="igChatContainer">
        <div
          className={`igChatSidebar ${activeChatUser ? "hideOnMobile" : ""}`}
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
              onChange={(e) => setSearchUser(e.target.value)}
            />
          </div>

          <div className="igConversationsList">
            {filteredUsers.length === 0 ? (
              <p className="noConversationsText">No mutual connections found</p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`igConversationCard ${activeChatUser?.id === user.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveChatUser(user);
                    setMessages([]);
                  }}
                >
                  <img
                    src={user.profilePic}
                    alt={user.username}
                    className="contactAvatar"
                  />
                  <div className="contactInfo">
                    <p className="contactName">{user.username}</p>
                    <span className="contactSubtext">Mutual Friend</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`igChatMain ${!activeChatUser ? "hideOnMobile" : ""}`}>
          {activeChatUser ? (
            <>
              <div className="igChatMainHeader">
                <button
                  className="mobileBackBtn"
                  onClick={() => setActiveChatUser(null)}
                >
                  ←
                </button>
                <img
                  src={activeChatUser.profilePic}
                  alt={activeChatUser.username}
                  className="activeAvatar"
                />
                <div className="activeUserMeta">
                  <h4>{activeChatUser.username}</h4>
                  <span>Active now</span>
                </div>
              </div>

              <div className="igMessagesBody">
                {messages.length === 0 ? (
                  <div className="noMessagesPlaceholder">
                    <img
                      src={activeChatUser.profilePic}
                      alt=""
                      className="largePlaceholderAvatar"
                    />
                    <h4>{activeChatUser.username}</h4>
                    <p>Send a message to start chatting on SocialeX.</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMine = msg.senderId === userId;

                    const currentDate = getMessageDate(msg);

                    const previousMessage = messages[index - 1];

                    const previousDate = previousMessage
                      ? getMessageDate(previousMessage)
                      : null;

                    const showDateSeparator =
                      !previousDate || !isSameDay(currentDate, previousDate);

                    return (
                      <React.Fragment key={msg.id}>
                        {showDateSeparator && (
                          <div className="chatDateSeparator">
                            <span>{getDateLabel(currentDate)}</span>
                          </div>
                        )}

                        <div
                          className={`messageSwipeWrapper ${swipedMessageId === msg.id ? 'showMessageTime' : ''
                            }`}
                          onTouchStart={handleMessageTouchStart}
                          onTouchEnd={(e) => handleMessageTouchEnd(e, msg)}
                        >
                          <div className="messageTimeReveal">
                            {msg.timestamp}
                          </div>

                          <div
                            className={`igMessageRow ${isMine ? 'mine' : 'theirs'
                              }`}
                          >
                            {!isMine && (
                              <img
                                src={activeChatUser.profilePic}
                                alt=""
                                className="bubbleAvatar"
                              />
                            )}

                            <div
                              className={`igBubble ${isMine ? 'mine' : 'theirs'
                                }`}
                            >
                              <p>{msg.text}</p>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="igChatInputArea" onSubmit={handleSendMessage}>
                {replyingTo && (
                  <div className="replyPreview">
                    <div className="replyPreviewContent">
                      <span>Replying to</span>
                      <p>{replyingTo.text}</p>
                    </div>

                    <button
                      type="button"
                      className="replyCancelBtn"
                      onClick={() => setReplyingTo(null)}
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
                    onFocus={() => setSwipedMessageId(null)}
                    onChange={(e) => {
                      setSwipedMessageId(null);
                      setTypedMessage(e.target.value);
                    }}
                  />
                  <button
                    type="submit"
                    className="igSendBtn"
                    disabled={!typedMessage.trim()}
                  >
                    <FiSend />
                  </button>
                </div>
              </form>

            </>
          ) : (
            <div className="noChatSelected">
              <div className="noChatIcon">💬</div>
              <h3>Your Messages</h3>
              <p>
                Follow users who follow you back to unlock direct messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

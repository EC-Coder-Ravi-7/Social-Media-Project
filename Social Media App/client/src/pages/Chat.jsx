import React, { useContext, useEffect, useState, useRef } from 'react';
import '../styles/Chat.css';
import Navbar from '../components/Navbar';
import { FiSearch, FiSend } from 'react-icons/fi';
import { BsImage } from 'react-icons/bs';
import { GeneralContext } from '../context/GeneralContextProvider';
import navProfile from '../images/nav-profile.avif';
import axios from 'axios';

const Chat = () => {
  const { socket } = useContext(GeneralContext);
  const userId = localStorage.getItem('userId');
  const currentUsername = localStorage.getItem('username');

  const [searchUser, setSearchUser] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch initial users to chat with
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:6001/fetchAllPosts');
        // Extract distinct users from posts as conversation contacts
        const users = [];
        const map = new Set();
        (res.data || []).forEach((p) => {
          if (p.userId !== userId && !map.has(p.userId)) {
            map.add(p.userId);
            users.push({
              id: p.userId,
              username: p.userName,
              profilePic: p.userPic || navProfile,
            });
          }
        });
        setUsersList(users);
        if (users.length > 0 && !activeChatUser) {
          setActiveChatUser(users[0]);
        }
      } catch (err) {
        console.error('Error fetching chat users:', err);
      }
    };
    fetchUsers();
  }, [userId]);

  // Socket listener for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (
        (data.senderId === activeChatUser?.id && data.receiverId === userId) ||
        (data.senderId === userId && data.receiverId === activeChatUser?.id)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on('receive-message', handleNewMessage);
    return () => socket.off('receive-message', handleNewMessage);
  }, [socket, activeChatUser, userId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChatUser || !socket) return;

    const newMsg = {
      senderId: userId,
      senderName: currentUsername,
      receiverId: activeChatUser.id,
      text: typedMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit('send-message', newMsg);
    setMessages((prev) => [...prev, newMsg]);
    setTypedMessage('');
  };

  const filteredUsers = usersList.filter((u) =>
    u.username.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="chatRoot">
      <Navbar />

      <div className="igChatContainer">
        {/* Left Sidebar: Conversations List */}
        <div className={`igChatSidebar ${activeChatUser ? 'hideOnMobile' : ''}`}>
          <div className="igChatSidebarHeader">
            <h3>{currentUsername}</h3>
          </div>

          <div className="igChatSearchWrapper">
            <FiSearch className="igSearchIcon" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />
          </div>

          <div className="igConversationsList">
            {filteredUsers.length === 0 ? (
              <p className="noConversationsText">No users found</p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`igConversationCard ${activeChatUser?.id === user.id ? 'active' : ''}`}
                  onClick={() => setActiveChatUser(user)}
                >
                  <img src={user.profilePic} alt={user.username} className="contactAvatar" />
                  <div className="contactInfo">
                    <p className="contactName">{user.username}</p>
                    <span className="contactSubtext">Active recently</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Active Message Conversation */}
        <div className={`igChatMain ${!activeChatUser ? 'hideOnMobile' : ''}`}>
          {activeChatUser ? (
            <>
              {/* Header */}
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

              {/* Message Bubble History */}
              <div className="igMessagesBody">
                {messages.length === 0 ? (
                  <div className="noMessagesPlaceholder">
                    <img src={activeChatUser.profilePic} alt="" className="largePlaceholderAvatar" />
                    <h4>{activeChatUser.username}</h4>
                    <p>Send a message to start chatting on SocialeX.</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMine = msg.senderId === userId;
                    return (
                      <div
                        key={index}
                        className={`igMessageRow ${isMine ? 'mine' : 'theirs'}`}
                      >
                        {!isMine && (
                          <img
                            src={activeChatUser.profilePic}
                            alt=""
                            className="bubbleAvatar"
                          />
                        )}
                        <div className={`igBubble ${isMine ? 'mine' : 'theirs'}`}>
                          <p>{msg.text}</p>
                          <span className="bubbleTime">{msg.timestamp}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form className="igChatInputArea" onSubmit={handleSendMessage}>
                <div className="igInputBoxWrapper">
                  <input
                    type="text"
                    placeholder="Message..."
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
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
              <p>Send private photos and messages to a friend or contact.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
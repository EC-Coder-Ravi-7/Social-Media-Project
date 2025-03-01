import React, { useContext, useEffect } from 'react';
import { GeneralContext } from '../../context/GeneralContextProvider';

const Chatsch = () => {
  const { socket, chatFirends, setChatFriends, dispatch, chatData } = useContext(GeneralContext);
  const userId = localStorage.getItem('userId');

  // Fetch friends when the component mounts
  useEffect(() => {
    if (!socket) return;

    socket.emit('fetch-friends', { userId });

    socket.on('friends-data-fetched', ({ friendsData }) => {
      setChatFriends(friendsData);
    });

    // Clean up the socket listener when component unmounts
    return () => {
      socket.off('friends-data-fetched');
    };
  }, [socket, userId, setChatFriends]);

  // Handle selecting a friend/chat
  const handleSelect = (data) => {
    dispatch({ type: 'CHANGE_USER', payload: data });
    // For debugging or to confirm the correct user data is selected
    console.log('Selected Chat Data:', data);
  };

  // Fetch messages whenever chatData changes and a chatId is available
  useEffect(() => {
    if (!socket) return;

    if (chatData.chatId !== null) {
      socket.emit('fetch-messages', { chatId: chatData.chatId });
    }
  }, [socket, chatData]);

  return (
    <div className="chats">
      {chatFirends.map((friend) => (
        <div
          className="userInfo"
          key={friend._id}
          onClick={() => handleSelect(friend)}
        >
          <img src={friend.profilePic} alt="User" />
          <div className="userChatInfo">
            <span>{friend.username}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chatsch;

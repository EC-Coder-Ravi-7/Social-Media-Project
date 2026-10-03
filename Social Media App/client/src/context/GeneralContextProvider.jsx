import React, { createContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

export const GeneralContext = createContext();

export const socket = io('http://localhost:6001');

export const GeneralContextProvider = ({ children }) => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const joinUserRoom = () => {
      const userId =
        localStorage.getItem('userId') ||
        localStorage.getItem('_id');

      if (userId) {
        console.log('🔔 Joining notification room:', userId);
        socket.emit('join-user-room', { userId });
      } else {
        console.log('⚠️ No userId found. Cannot join notification room.');
      }
    };

    socket.on('connect', joinUserRoom);

    if (socket.connected) {
      joinUserRoom();
    }

    return () => {
      socket.off('connect', joinUserRoom);
    };
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
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};
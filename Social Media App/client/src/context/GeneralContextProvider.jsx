import React, { createContext, useState } from 'react';
import io from 'socket.io-client';

export const GeneralContext = createContext();

const socket = io('http://localhost:6001');

export const GeneralContextProvider = ({ children }) => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <GeneralContext.Provider
      value={{
        socket,
        isCreatePostOpen,
        setIsCreatePostOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};
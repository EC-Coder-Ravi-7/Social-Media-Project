import React, { createContext, useEffect, useState } from "react";
import socketIoClient from "socket.io-client";

export const SocketContext = createContext();

const WS = process.env.REACT_APP_SOCKET_URL;

const socket = socketIoClient(WS);

export const SocketContextProvider = ({ children }) => {
  <SocketContext.Provider value={{ socket }}>
    {children}
  </SocketContext.Provider>;
};

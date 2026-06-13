import React, { createContext} from 'react';
import socketIoClient from 'socket.io-client';


export const SocketContext = createContext();

const WS = 'https://socialx-backend-g765.onrender.com';

const socket = socketIoClient(WS);

export const SocketContextProvider =  ({children}) => {

    <SocketContext.Provider  value={{socket}} >{children}</SocketContext.Provider>
}


import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        if (currentUser) {
            // Создаем соединение только если пользователь авторизован
            const newSocket = io('http://localhost:5000', {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log('Socket.IO подключен:', newSocket.id);
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket.IO отключен');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Ошибка подключения Socket.IO:', error);
                setIsConnected(false);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
                setSocket(null);
                setIsConnected(false);
            };
        }
    }, [currentUser]);

    const joinChat = (chatId) => {
        if (socket && chatId) {
            socket.emit('join-chat', chatId);
        }
    };

    const leaveChat = (chatId) => {
        if (socket && chatId) {
            socket.emit('leave-chat', chatId);
        }
    };

    const sendMessage = (chatId, message) => {
        if (socket && chatId && message) {
            socket.emit('send-message', { chatId, message });
        }
    };

    const sendTyping = (chatId, userId, userName, isTyping) => {
        if (socket && chatId) {
            socket.emit('typing', { chatId, userId, userName, isTyping });
        }
    };

    const value = {
        socket,
        isConnected,
        joinChat,
        leaveChat,
        sendMessage,
        sendTyping
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}; 
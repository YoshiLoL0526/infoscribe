import React, { useRef, useEffect } from 'react';
import { useChat } from '../contexts/chat-context';
import ChatMessage from './ChatMessage';

const ChatWindow = () => {
    const { messages, error } = useChat();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 h-0 min-h-0">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-center font-medium">¡Hola! Soy tu asistente virtual.</p>
                    <p className="text-center text-gray-600">Escribe un mensaje para comenzar.</p>
                </div>
            ) : (
                messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                ))
            )}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                    <p className="font-medium">Error: {error}</p>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatWindow;
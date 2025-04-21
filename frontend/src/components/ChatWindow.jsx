import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '../contexts/chat-context';
import ChatMessage from './ChatMessage';
import { useTheme } from '../contexts/theme-context';

const ChatWindow = () => {
    const { messages, error, isLoading } = useChat();
    const messagesEndRef = useRef(null);
    const { theme, isDark } = useTheme();
    const [newMessages, setNewMessages] = useState([]);

    // Detectar nuevos mensajes para animación
    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            setNewMessages((prev) => [...prev, lastMessage.id]);

            // Eliminar de la lista de nuevos después de la animación
            setTimeout(() => {
                setNewMessages((prev) => prev.filter(id => id !== lastMessage.id));
            }, 1000);
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Clases dinámicas según el tema
    const getBgClass = () => (theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50');
    const getEmptyStateTextClass = () => (theme === 'dark' ? 'text-gray-300' : 'text-gray-500');
    const getEmptyDescriptionClass = () => (theme === 'dark' ? 'text-gray-400' : 'text-gray-600');

    // Vista de mensajes vacíos (estado inicial)
    const renderEmptyState = () => (
        <div className={`flex flex-col items-center justify-center h-full ${getEmptyStateTextClass()} transition-colors duration-300`}>
            <svg xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 mb-6 text-blue-500 opacity-80 animate-pulse"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className={`text-center text-xl font-medium mb-2 transition-colors duration-300`}>
                ¡Hola! Soy tu asistente virtual.
            </p>
            <p className={`text-center ${getEmptyDescriptionClass()} max-w-md transition-colors duration-300`}>
                Escribe un mensaje para comenzar una conversación. Puedo ayudarte con información y responder a tus preguntas.
            </p>
        </div>
    );

    // Renderizado de indicador de carga (3 puntos saltando)
    const renderTypingIndicator = () => {
        if (!isLoading) return null;

        return (
            <div className="flex justify-start mb-4">
                <div className={`max-w-[60%] p-4 rounded-lg ${isDark
                        ? 'bg-gray-800 border-gray-700 text-gray-200 rounded-bl-none shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                    }`}>
                    <div className="flex space-x-1 items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        );
    };

    // Renderizado de mensajes
    const renderMessages = () => (
        <div className="space-y-6">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`transition-all duration-500 ease-in-out ${newMessages.includes(message.id) ? 'opacity-0 translate-y-4 animate-fade-in-up' : 'opacity-100'}`}
                >
                    <ChatMessage message={message} />
                </div>
            ))}
            {renderTypingIndicator()}
        </div>
    );

    // Renderizado de error
    const renderError = () => {
        if (!error) return null;

        return (
            <div className={`border-l-4 border-red-500 p-4 mb-4 rounded shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}>
                <p className="font-medium">Error: {error}</p>
            </div>
        );
    };

    return (
        <div className={`flex-grow overflow-y-auto p-4 space-y-4 ${getBgClass()} h-0 min-h-0 transition-colors duration-300`}>
            {messages.length === 0 ? renderEmptyState() : renderMessages()}
            {renderError()}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatWindow;

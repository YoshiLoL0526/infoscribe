import React, { useState } from 'react';
import { ChatContext } from '../contexts/chat-context';
import { sendMessage } from '../services/api';

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const addMessage = (text, isUser = true) => {
        setMessages(prev => [...prev, { id: Date.now(), text, isUser }]);
    };

    const processMessage = async (messageText) => {
        setIsLoading(true);
        setError(null);

        try {
            addMessage(messageText, true);
            const response = await sendMessage({ query: messageText });

            if (response?.output) {
                addMessage(response.output, false);
            } else {
                throw new Error('Respuesta vacía o inválida');
            }
        } catch (err) {
            setError('Error al procesar tu mensaje. Por favor, intenta de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const resetConversation = () => {
        setMessages([]);
        setError(null);
    };

    return (
        <ChatContext.Provider value={{
            messages,
            isLoading,
            error,
            processMessage,
            resetConversation
        }}>
            {children}
        </ChatContext.Provider>
    );
};
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/chat-context';
import VoiceInput from './VoiceInput';
import { useTheme } from '../contexts/theme-context';

const ChatInput = () => {
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const inputRef = useRef(null);
    const { processMessage, isLoading } = useChat();
    const { isDark } = useTheme();
    const MAX_CHARS = 500;

    // Manejo de caracteres
    useEffect(() => {
        setCharCount(input.length);
    }, [input]);

    // Manejo del estado de escritura
    useEffect(() => {
        let typingTimer;
        if (input && !isTyping) {
            setIsTyping(true);
        } else if (input && isTyping) {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                setIsTyping(false);
            }, 1000);
        } else if (!input) {
            setIsTyping(false);
        }

        return () => {
            clearTimeout(typingTimer);
        };
    }, [input, isTyping]);

    // Enfoque automático en el input
    useEffect(() => {
        if (inputRef.current && !isLoading) {
            inputRef.current.focus();
        }
    }, [isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading && charCount <= MAX_CHARS) {
            processMessage(input);
            setInput('');
            setCharCount(0);
        }
    };

    // Función para expandir automáticamente el textarea según el contenido
    const handleInputChange = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    // Función para manejar atajos de teclado
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className={`p-4 border-t ${isDark ? 'border-gray-700 bg-gray-900 shadow-inner' : 'border-gray-200 bg-white shadow-inner'} transition-colors duration-200`}>
            <form onSubmit={handleSubmit} className="relative">
                <div className={`flex flex-col rounded-lg overflow-hidden border ${isDark ? 'border-gray-700 focus-within:ring-blue-700 focus-within:border-blue-700 bg-gray-800' : 'border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white'} focus-within:ring-2 transition-all duration-200`}>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe tu mensaje..."
                        className={`flex-grow py-3 px-4 bg-transparent ${isDark ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'} focus:outline-none resize-none min-h-[48px] max-h-[200px]`}
                        disabled={isLoading}
                        rows={1}
                    />

                    <div className={`border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'} px-3 py-2 flex items-center justify-between`}>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                className={`${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'} transition-colors p-1 rounded-full`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </button>

                            <button
                                type="button"
                                className={`${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'} transition-colors p-1 rounded-full`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                </svg>
                            </button>

                            <div className={`text-xs ${charCount > MAX_CHARS ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {charCount}/{MAX_CHARS}
                            </div>
                        </div>

                        <div className="flex items-center">
                            {!input.trim() && (
                                <div className="mr-2">
                                    <VoiceInput onVoiceInput={(text) => setInput(input + text)} />
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center ${isLoading || !input.trim() || charCount > MAX_CHARS ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}`}
                                disabled={isLoading || !input.trim() || charCount > MAX_CHARS}
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ChatInput;
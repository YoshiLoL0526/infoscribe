import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/chat-context';
import VoiceInput from './VoiceInput';
import { useTheme } from '../contexts/theme-context';
import ErrorToast from './ErrorToast';

const ChatInput = () => {
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [isProcessingAudio, setIsProcessingAudio] = useState(false);
    const inputRef = useRef(null);
    const { processMessage, isLoading } = useChat();
    const { isDark } = useTheme();
    const MAX_CHARS = 500;
    const [showError, setShowError] = useState(false);

    const handleNoButtonClick = () => {
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
    };

    useEffect(() => {
        setCharCount(input.length);
    }, [input]);

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
        return () => clearTimeout(typingTimer);
    }, [input, isTyping]);

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

    const handleInputChange = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleAudioProcessingChange = (isProcessing) => {
        setIsProcessingAudio(isProcessing);
    };

    const handleVoiceInput = (text) => {
        setInput((prev) => prev + text);
    };

    return (
        <>
            {/* Aquí montamos el toast en la esquina superior derecha */}
            <ErrorToast
                show={showError}
                message="❌ Esta función aún no está disponible"
                duration={3000}
                position="top-right"
                onClose={() => setShowError(false)}
            />

            <div className={`p-4 border-t ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} shadow-inner transition-colors duration-200`}>
                <form onSubmit={handleSubmit} className="relative">
                    <div className={`flex flex-col rounded-lg overflow-hidden border focus-within:ring-2 transition-all duration-200 ${isDark
                        ? 'border-gray-700 focus-within:ring-blue-700 focus-within:border-blue-700 bg-gray-800'
                        : 'border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white'
                        }`}
                    >
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe tu mensaje..."
                            className={`flex-grow py-3 px-4 bg-transparent resize-none focus:outline-none min-h-[48px] max-h-[200px] ${isDark ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
                                }`}
                            disabled={isLoading || isProcessingAudio}
                            rows={1}
                        />

                        <div className={`border-t px-3 py-2 flex items-center justify-between transition-colors duration-200 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'
                            }`}>
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={handleNoButtonClick}
                                    className={`${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'} p-1 rounded-full transition-colors`}
                                    disabled={isLoading || isProcessingAudio}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleNoButtonClick}
                                    className={`${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'} p-1 rounded-full transition-colors relative`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>

                                <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs ${charCount > MAX_CHARS ? 'text-red-500' : ''}`}> {charCount}/{MAX_CHARS} </div>
                            </div>

                            <div className="relative w-10 h-10">
                                {/* Botón de voz */}
                                <div
                                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform -ml-2 ${!input.trim() && !isLoading ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-0 pointer-events-none'
                                        }`}
                                >
                                    <VoiceInput onVoiceInput={handleVoiceInput} onProcessingChange={handleAudioProcessingChange} disabled={isLoading} />
                                </div>

                                {/* Botón de enviar */}
                                <button
                                    type="submit"
                                    className={`absolute inset-0 flex items-center justify-center w-10 h-10 transition-all duration-300 transform bg-blue-600 text-white rounded-full ${input.trim() || isLoading ? 'opacity-100 scale-100 pointer-events-auto hover:bg-blue-700 hover:scale-110' : 'opacity-0 scale-0 pointer-events-none'
                                        } ${isLoading || !input.trim() || charCount > MAX_CHARS || isProcessingAudio ? 'cursor-not-allowed opacity-50' : ''}`}
                                    disabled={isLoading || !input.trim() || charCount > MAX_CHARS || isProcessingAudio}
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
                                            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ChatInput;

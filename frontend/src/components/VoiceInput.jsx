import React, { useState, useRef } from 'react';
import { useChat } from '../contexts/chat-context';
import { useTheme } from '../contexts/theme-context';
import { transcribeAudio } from '../services/api';

const VoiceInput = ({ onVoiceInput }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { processMessage } = useChat();
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const { isDark } = useTheme();

    const handleVoiceInput = async () => {
        // If already recording, stop and process
        if (isListening && mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            return;
        }

        // If processing, don't do anything
        if (isProcessing) return;

        // Reset state
        setIsProcessing(false);
        audioChunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Especificar explícitamente el tipo MIME y comprobar compatibilidad
            let mimeType = 'audio/webm';

            // Comprobar compatibilidad y usar alternativas si es necesario
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                if (MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')) {
                    mimeType = 'audio/ogg; codecs=opus';
                } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                    mimeType = 'audio/mp4';
                } else {
                    console.warn('Formatos de audio comunes no soportados, usando el predeterminado');
                }
            }

            console.log('Usando formato de audio:', mimeType);

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.onstart = () => {
                setIsListening(true);
                console.log('Grabación de audio iniciada');
            };

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                setIsListening(false);
                setIsProcessing(true);
                console.log('Grabación de audio finalizada');

                // Detener todas las pistas de audio para liberar el micrófono
                stream.getTracks().forEach(track => track.stop());

                try {
                    // Asegurarnos de que usamos el tipo MIME correcto
                    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

                    console.log('Audio blob creado:', {
                        tipo: audioBlob.type,
                        tamaño: audioBlob.size
                    });

                    // Don't try to send empty audio files
                    if (audioBlob.size < 100) {
                        console.error('Audio recording too small, likely empty');
                        throw new Error('La grabación de audio está vacía o es demasiado corta');
                    }

                    console.log('Enviando audio para transcripción...');
                    const result = await transcribeAudio(audioBlob);
                    console.log('Transcripción recibida:', result);

                    if (result && result.text) {
                        const transcript = result.text;

                        if (transcript && transcript.trim()) {
                            // Usar onVoiceInput si está disponible, sino usar processMessage
                            if (onVoiceInput) {
                                onVoiceInput(transcript);
                            } else {
                                processMessage(transcript);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error al procesar la transcripción:', error);
                } finally {
                    setIsProcessing(false);
                    mediaRecorderRef.current = null;
                }
            };

            // Iniciar la grabación
            mediaRecorder.start();

        } catch (err) {
            console.error('Error al acceder al micrófono:', err);
            setIsListening(false);
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={handleVoiceInput}
                className={`ml-2 p-2 rounded-full focus:outline-none flex-shrink-0 w-10 h-10 flex items-center justify-center ${isListening
                    ? 'bg-red-500 text-white'
                    : isProcessing
                        ? 'bg-yellow-500 text-white'
                        : isDark
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                title={isListening ? "Detener grabación" : isProcessing ? "Procesando audio..." : "Entrada de voz"}
                disabled={isProcessing}
            >
                {isListening ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="6" y="6" width="12" height="12" strokeWidth={2} />
                    </svg>
                ) : isProcessing ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default VoiceInput;
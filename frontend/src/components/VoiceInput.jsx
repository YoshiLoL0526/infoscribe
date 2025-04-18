import React, { useState, useRef } from 'react';
import { useChat } from '../contexts/chat-context';

const VoiceInput = () => {
    const [isListening, setIsListening] = useState(false);
    const { processMessage } = useChat();
    const recognitionRef = useRef(null);

    const startListening = () => {
        // Si ya está escuchando, detener la grabación
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            return;
        }

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            // Configuración del reconocimiento de voz
            recognition.lang = 'es-ES';
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
                console.log('Reconocimiento de voz iniciado');
            };

            recognition.onresult = (event) => {
                if (event.results && event.results[0]) {
                    const transcript = event.results[0][0].transcript;
                    console.log('Texto reconocido:', transcript);
                    if (transcript && transcript.trim()) {
                        // Aquí es donde se procesa el texto reconocido
                        processMessage(transcript);
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error('Error de reconocimiento:', event.error);

                // Manejar diferentes tipos de errores
                if (event.error === 'network') {
                    alert('Error de conexión al servicio de reconocimiento de voz. Verifique su conexión a Internet.');
                } else if (event.error === 'not-allowed') {
                    alert('Acceso al micrófono denegado. Por favor, conceda permiso en la configuración de su navegador.');
                } else if (event.error === 'no-speech') {
                    alert('No se detectó voz. Intente hablar más fuerte o verificar que su micrófono esté funcionando.');
                } else {
                    alert(`Error de reconocimiento de voz: ${event.error}`);
                }

                setIsListening(false);
                recognitionRef.current = null;
            };

            recognition.onend = () => {
                console.log('Reconocimiento de voz finalizado');
                setIsListening(false);
                recognitionRef.current = null;
            };

            try {
                // Asegúrate de que el usuario tenga permisos de micrófono
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(() => {
                        recognition.start();
                    })
                    .catch((err) => {
                        console.error('Error al acceder al micrófono:', err);
                        alert('No se pudo acceder al micrófono. Por favor, conceda los permisos necesarios.');
                        setIsListening(false);
                    });
            } catch (err) {
                console.error('Error al iniciar el reconocimiento de voz:', err);
                alert(`Error al iniciar el reconocimiento de voz: ${err.message}`);
                setIsListening(false);
            }
        } else {
            alert('El reconocimiento de voz no está soportado en este navegador. Intente con Chrome o Edge.');
        }
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={startListening}
                className={`ml-2 p-2 rounded-full focus:outline-none flex-shrink-0 w-10 h-10 flex items-center justify-center ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                title={isListening ? "Detener grabación" : "Entrada de voz"}
            >
                {isListening ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="6" y="6" width="12" height="12" strokeWidth={2} />
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
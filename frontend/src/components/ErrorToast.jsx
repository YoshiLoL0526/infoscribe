import React, { useState, useEffect } from 'react';

const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
};

const ErrorToast = ({
    show,
    message = 'Ha ocurrido un error',
    duration = 3000,
    position = 'top-right',
    onClose = () => { }
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let timerHide;
        if (show) {
            // Disparamos animación de entrada
            setVisible(true);

            // Tras `duration` ms iniciamos animación de salida
            timerHide = setTimeout(() => {
                setVisible(false);
                // Después de 300ms (duración de la transición), cerramos del todo
                setTimeout(onClose, 300);
            }, duration);
        } else {
            // Si show pasa a false antes de tiempo, ocultamos inmediatamente
            setVisible(false);
        }

        return () => clearTimeout(timerHide);
    }, [show, duration, onClose]);

    // Mientras esté en proceso de entrada/salida, lo mantenemos montado
    if (!show && !visible) return null;

    return (
        <div
            className={`
        fixed ${positionClasses[position]}
        bg-red-600 text-white
        px-4 py-3
        rounded-lg shadow-lg
        flex items-center space-x-2
        z-50

        transform transition-all duration-300 ease-in-out

        ${visible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-4'
                }
      `}
        >
            <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                />
            </svg>
            <span className="text-sm">{message}</span>
        </div>
    );
};

export default ErrorToast;

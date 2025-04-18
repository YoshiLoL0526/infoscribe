import React from 'react';

const ChatMessage = ({ message }) => {
    const { text, isUser } = message;

    // Función para convertir texto plano a componentes con enlaces procesados
    const processLinks = React.useCallback((content) => {
        if (typeof content !== 'string') return content;

        const urlRegex = /(https?:\/\/[^\s]+)/g;

        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = urlRegex.exec(content)) !== null) {
            // Texto antes del enlace
            if (match.index > lastIndex) {
                parts.push(content.substring(lastIndex, match.index));
            }

            const url = match[0];
            parts.push(
                <a
                    key={`link-${match.index}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center hover:opacity-80"
                    title={url}
                >
                    <span className="px-1">🔗</span>
                </a>
            );

            lastIndex = match.index + match[0].length;
        }

        // Texto después del último enlace
        if (lastIndex < content.length) {
            parts.push(content.substring(lastIndex));
        }

        return parts.length > 0 ? parts : content;
    }, []);

    // Función para procesar negritas en un fragmento de texto
    const processBold = React.useCallback((textFragment) => {
        // Caso base: si no es string (ya es un elemento procesado), devolver tal cual
        if (typeof textFragment !== 'string') return textFragment;

        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(textFragment)) !== null) {
            // Añadimos el texto procesado antes del match
            if (match.index > lastIndex) {
                const beforeText = textFragment.substring(lastIndex, match.index);
                const processedBefore = processLinks(beforeText);
                if (Array.isArray(processedBefore)) {
                    parts.push(...processedBefore);
                } else {
                    parts.push(processedBefore);
                }
            }

            // Procesar enlaces dentro del texto en negrita
            const boldContent = match[1];
            const processedBoldContent = processLinks(boldContent);

            // Añadimos el texto en negrita
            parts.push(
                <strong key={`bold-${match.index}`}>
                    {processedBoldContent}
                </strong>
            );

            lastIndex = match.index + match[0].length;
        }

        // Añadimos el texto restante procesado
        if (lastIndex < textFragment.length) {
            const remainingText = textFragment.substring(lastIndex);
            const processedRemaining = processLinks(remainingText);
            if (Array.isArray(processedRemaining)) {
                parts.push(...processedRemaining);
            } else {
                parts.push(processedRemaining);
            }
        }

        return parts.length > 0 ? parts : textFragment;
    }, [processLinks]);

    // Procesar el texto completo
    const processedContent = React.useMemo(() => {
        // Dividir por párrafos y procesar cada uno
        return text.split('\n\n').map((paragraph, index) => (
            <React.Fragment key={index}>
                {index > 0 && <br />}
                {processBold(paragraph)}
            </React.Fragment>
        ));
    }, [text, processBold]);

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-md p-4 rounded-lg ${isUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    } break-words`}
            >
                {processedContent}
            </div>
        </div>
    );
};

export default ChatMessage;
const rawApi = import.meta.env.VITE_N8N_WEBHOOK_URL;
const API_URL = (rawApi ? rawApi : '/webhook').replace(/\/$/, '');


export const sendMessage = async (payload) => {
    try {
        const response = await fetch(API_URL + "/ask", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

export const transcribeAudio = async (audioBlob) => {
    try {
        const formData = new FormData();

        // Siempre crear un nuevo blob con tipo explícito
        // Usar .webm como formato predeterminado que es ampliamente compatible
        const blobToSend = new Blob([audioBlob], {
            type: audioBlob.type && audioBlob.type !== 'application/octet-stream'
                ? audioBlob.type
                : 'audio/webm'
        });

        // Crear un nombre de archivo con la extensión correcta basada en el tipo MIME
        const getExtension = (mime) => {
            if (mime.includes('webm')) return '.webm';
            if (mime.includes('ogg')) return '.ogg';
            if (mime.includes('mp4') || mime.includes('mp3')) return '.mp3';
            if (mime.includes('wav')) return '.wav';
            return '.webm'; // Default
        };

        const fileName = `recording${getExtension(blobToSend.type)}`;

        // Añadir el archivo al FormData con nombre específico
        formData.append('audio', blobToSend, fileName);

        console.log('Enviando archivo de audio:', {
            nombre: fileName,
            tipo: blobToSend.type,
            tamaño: blobToSend.size
        });

        const response = await fetch(API_URL + "/transcribe", {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Transcription server error:', errorData);
            throw new Error(`Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al transcribir audio:', error);
        throw error;
    }
};
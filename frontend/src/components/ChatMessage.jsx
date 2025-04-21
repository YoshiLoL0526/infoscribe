import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/theme-context';
import BookCard from './BookCard';
import NewsCard from './NewsCard';

const ChatMessage = ({ message }) => {
    const { text, isUser, timestamp = new Date() } = message;
    const [isVisible, setIsVisible] = useState(false);
    const { isDark } = useTheme();

    // Efecto para animación de entrada
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Function to extract XML content from code blocks and convert to objects
    const parseXML = React.useCallback((content) => {
        // Find XML code blocks
        const xmlBlockRegex = /```xml\s*([\s\S]*?)\s*```/g;
        let xmlBlocks = [];
        let blockMatch;

        while ((blockMatch = xmlBlockRegex.exec(content)) !== null) {
            const xmlContent = blockMatch[1];
            const blockStartIndex = blockMatch.index;
            const blockEndIndex = blockMatch.index + blockMatch[0].length;

            // Parse book XML blocks
            const bookRegex = /<book>([\s\S]*?)<\/book>/g;
            let bookMatch;

            while ((bookMatch = bookRegex.exec(xmlContent)) !== null) {
                const bookXml = bookMatch[0];
                const titleMatch = bookXml.match(/<title>(.*?)<\/title>/);
                const priceMatch = bookXml.match(/<price>(.*?)<\/price>/);
                const imageMatch = bookXml.match(/<image>(.*?)<\/image>/);
                const authorMatch = bookXml.match(/<author>(.*?)<\/author>/);
                const categoryMatch = bookXml.match(/<category>(.*?)<\/category>/);

                xmlBlocks.push({
                    type: 'book',
                    content: {
                        title: titleMatch ? titleMatch[1] : '',
                        price: priceMatch ? priceMatch[1] : '',
                        image: imageMatch ? imageMatch[1] : '',
                        author: authorMatch ? authorMatch[1] : '',
                        category: categoryMatch ? categoryMatch[1] : '',
                    },
                    startIndex: blockStartIndex,
                    endIndex: blockEndIndex
                });
            }

            // Parse news XML blocks
            const newsRegex = /<new>([\s\S]*?)<\/new>/g;
            let newsMatch;

            while ((newsMatch = newsRegex.exec(xmlContent)) !== null) {
                const newsXml = newsMatch[0];
                const titleMatch = newsXml.match(/<title>(.*?)<\/title>/);
                const urlMatch = newsXml.match(/<url>(.*?)<\/url>/);
                const scoreMatch = newsXml.match(/<score>(.*?)<\/score>/);
                const sourceMatch = newsXml.match(/<source>(.*?)<\/source>/);
                const dateMatch = newsXml.match(/<date>(.*?)<\/date>/);

                xmlBlocks.push({
                    type: 'news',
                    content: {
                        title: titleMatch ? titleMatch[1] : '',
                        url: urlMatch ? urlMatch[1] : '',
                        score: scoreMatch ? scoreMatch[1] : '',
                        source: sourceMatch ? sourceMatch[1] : '',
                        date: dateMatch ? dateMatch[1] : '',
                    },
                    startIndex: blockStartIndex,
                    endIndex: blockEndIndex
                });
            }
        }

        // If no XML blocks found, return content as is
        if (xmlBlocks.length === 0) return content;

        // Sort blocks by start index
        xmlBlocks.sort((a, b) => a.startIndex - b.startIndex);

        // Build the result with XML blocks replaced by their React components
        const result = [];
        let lastIndex = 0;

        xmlBlocks.forEach((block, index) => {
            // Add text before the XML block
            if (block.startIndex > lastIndex) {
                result.push(content.substring(lastIndex, block.startIndex));
            }

            // Add the appropriate component
            if (block.type === 'book') {
                result.push(
                    <BookCard key={`book-${index}`} book={block.content} />
                );
            } else if (block.type === 'news') {
                result.push(
                    <NewsCard key={`news-${index}`} news={block.content} />
                );
            }

            lastIndex = block.endIndex;
        });

        // Add remaining text
        if (lastIndex < content.length) {
            result.push(content.substring(lastIndex));
        }

        return result;
    }, []);

    // Function to process bold text
    const processBold = React.useCallback((textFragment) => {
        // Base case: if not a string (already a processed element), return as is
        if (typeof textFragment !== 'string') return textFragment;

        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(textFragment)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                parts.push(textFragment.substring(lastIndex, match.index));
            }

            // Add the bold text
            parts.push(
                <strong key={`bold-${match.index}`} className="font-semibold">
                    {match[1]}
                </strong>
            );

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < textFragment.length) {
            parts.push(textFragment.substring(lastIndex));
        }

        return parts.length > 0 ? parts : textFragment;
    }, []);

    // Process the full message
    const processMessage = React.useCallback((content) => {
        // First parse XML structures
        const xmlProcessed = parseXML(content);

        // If the content is already processed as XML components, return it
        if (Array.isArray(xmlProcessed)) {
            return xmlProcessed.map((item, index) => {
                if (typeof item === 'string') {
                    return <span key={index}>{processBold(item)}</span>;
                }
                return item;
            });
        }

        // If not, process bold text
        return processBold(xmlProcessed);
    }, [parseXML, processBold]);

    // Format timestamp
    const formatTime = (date) => {
        return new Intl.DateTimeFormat('default', {
            hour: 'numeric',
            minute: 'numeric'
        }).format(date);
    };

    // Process the entire content
    const processedContent = React.useMemo(() => {
        // Split by paragraphs and process each one
        return text.split('\n\n').map((paragraph, index) => (
            <React.Fragment key={index}>
                {index > 0 && <br />}
                {processMessage(paragraph)}
            </React.Fragment>
        ));
    }, [text, processMessage]);

    return (
        <div
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: `translateY(${isVisible ? 0 : '10px'})`,
                transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
            }}
        >
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2 mt-1 flex-shrink-0 shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                    </svg>
                </div>
            )}
            <div className="flex flex-col">
                <div
                    className={`max-w-2xl p-4 rounded-lg ${isUser
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-md'
                            : isDark
                                ? 'bg-gray-800 border-gray-700 text-gray-200 rounded-bl-none shadow-sm'
                                : 'bg-white border border-gray-200 shadow-sm text-gray-800 rounded-bl-none'
                        } break-words`}
                >
                    {processedContent}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1 ${isUser ? 'text-right mr-2' : 'ml-2'}`}>
                    {formatTime(timestamp)}
                </div>
            </div>
            {isUser && (
                <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'} flex items-center justify-center ml-2 mt-1 flex-shrink-0 shadow-sm`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                </div>
            )}
        </div>
    );
};

export default ChatMessage;
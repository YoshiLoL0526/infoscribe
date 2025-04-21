import { useState } from 'react';
import { useTheme } from '../contexts/theme-context';

const BookCard = ({ book }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { isDark } = useTheme();

    return (
        <div className={`my-6 ${isDark ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-800 border-gray-200'} rounded-lg shadow-lg overflow-hidden border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="flex flex-col md:flex-row">
                {book.image && !imageError ? (
                    <div className="w-full md:w-1/3 h-48 md:h-auto relative">
                        {!imageLoaded && (
                            <div className={`absolute inset-0 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse flex items-center justify-center`}>
                                <svg className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                        )}
                        <img
                            src={book.image}
                            alt={book.title}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => {
                                setImageError(true);
                                setImageLoaded(true);
                            }}
                        />
                    </div>
                ) : imageError ? (
                    <div className={`w-full md:w-1/3 h-48 md:h-auto ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                        <svg className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                ) : null}
                <div className="p-5 flex flex-col justify-between w-full md:w-2/3">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>{book.title}</h3>
                            {book.category && (
                                <span className={`text-xs font-semibold inline-block py-1 px-2 rounded-full ${isDark ? 'text-blue-400 bg-blue-900' : 'text-blue-600 bg-blue-100'} uppercase`}>
                                    {book.category}
                                </span>
                            )}
                        </div>
                        {book.author && (
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                                <span className="font-medium">Author:</span> {book.author}
                            </p>
                        )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <span className={`${isDark ? 'text-blue-400' : 'text-blue-600'} font-semibold text-lg`}>{book.price}</span>
                        <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                            <button className={`ml-2 p-1 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
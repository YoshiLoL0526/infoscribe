import { useTheme } from '../contexts/theme-context';

const NewsCard = ({ news }) => {
    const { isDark } = useTheme();

    return (
        <div className={`my-6 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'} rounded-lg shadow-lg overflow-hidden border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h3 className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{news.title}</h3>
                    <div className={`${isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'} rounded-full px-3 py-1 text-sm font-semibold flex items-center`}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                        </svg>
                        Score: {news.score}
                    </div>
                </div>

                {(news.source || news.date) && (
                    <div className={`flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                        {news.source && (
                            <span className="flex items-center mr-4">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                                </svg>
                                {news.source}
                            </span>
                        )}
                        {news.date && (
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                {news.date}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between mt-4">
                    <a
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors duration-300 font-medium`}
                    >
                        Read Article
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </a>
                    <button className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors duration-200`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsCard;
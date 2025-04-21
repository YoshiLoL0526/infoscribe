import React from 'react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/theme-context';

const Header = () => {
    const { isDark } = useTheme();

    return (
        <header className={`${isDark ? 'bg-blue-900' : 'bg-blue-600'} text-white p-4 shadow-md transition-colors duration-300`}>
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <h1 className="text-xl font-bold">Print AI Assessment</h1>
                </div>
                <ThemeToggle />
            </div>
        </header>
    );
};

export default Header;
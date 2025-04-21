import React from 'react';
import { ChatProvider } from './providers/ChatProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { useTheme } from './contexts/theme-context';


const ThemedApp = () => {
  const { isDark } = useTheme();

  return (
    <div className={`flex flex-col h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      <Header />
      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="container mx-auto flex-grow flex flex-col max-w-4xl">
          <ChatWindow />
          <ChatInput />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <ThemedApp />
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
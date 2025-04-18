import React from 'react';
import { ChatProvider } from './providers/ChatProvider';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

function App() {
  return (
    <ChatProvider>
      <div className="flex flex-col h-screen bg-gray-100">
        <Header />
        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="container mx-auto flex-grow flex flex-col max-w-4xl">
            <ChatWindow />
            <ChatInput />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}

export default App;
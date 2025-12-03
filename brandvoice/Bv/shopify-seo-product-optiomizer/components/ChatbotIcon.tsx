import React from 'react';
import { ChatIcon } from './icons/Icons';

interface ChatbotIconProps {
  isOpen: boolean;
  onClick: () => void;
}

const ChatbotIcon: React.FC<ChatbotIconProps> = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out
        ${isOpen ? 'bg-brand-primary-hover' : 'bg-brand-primary'} text-background-dark
        hover:bg-brand-primary-hover focus:outline-none focus:ring-4 focus:ring-brand-primary-hover/50`}
      aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
      aria-expanded={isOpen}
    >
      <ChatIcon />
    </button>
  );
};

export default ChatbotIcon;

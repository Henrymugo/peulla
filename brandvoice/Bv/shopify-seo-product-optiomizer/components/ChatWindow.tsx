import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, ChatMessageRole } from '../types';
import { SendIcon } from './icons/Icons';
import LoadingIndicator from './LoadingIndicator';

interface ChatWindowProps {
  isOpen: boolean;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
  isStreaming: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, messages, onSendMessage, onClose, isStreaming }) => {
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]); // Scroll when messages or streaming status changes

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      onSendMessage(input);
      setInput('');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-8 z-40 w-[90%] max-w-lg md:max-w-md bg-background-light border border-border-color rounded-2xl shadow-xl flex flex-col h-[500px] md:h-[600px]">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-background-dark rounded-t-2xl border-b border-border-color">
        <h2 className="text-xl font-serif font-bold text-text-primary">AI Assistant</h2>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary focus:outline-none p-1 rounded-full hover:bg-background-light"
          aria-label="Close chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center text-text-secondary text-sm mt-4 max-w-md mx-auto">
            <p className="mb-3 text-base text-text-primary">Hello! I'm your AI Assistant.</p>
            <p className="mb-4">
              I can help you with e-commerce, brand voice, product optimization, SEO, and general business advice for your Shopify store.
            </p>
            <p className="font-semibold text-brand-primary mb-2">Here are some things you can ask:</p>
            <ul className="list-disc list-inside text-left mx-auto max-w-[250px]">
              <li>"How can I improve my product descriptions?"</li>
              <li>"What are common SEO mistakes for Shopify stores?"</li>
              <li>"Explain content marketing strategies."</li>
              <li>"Give me tips for boosting customer engagement."</li>
              <li>"Summarize best practices for brand storytelling."</li>
            </ul>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === ChatMessageRole.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                msg.role === ChatMessageRole.USER
                  ? 'bg-brand-primary text-background-dark rounded-bl-xl rounded-tr-xl rounded-tl-xl'
                  : 'bg-background-dark/70 text-text-primary rounded-br-xl rounded-tr-xl rounded-tl-xl prose prose-invert max-w-none'
              }`}
            >
              {msg.role === ChatMessageRole.MODEL ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isStreaming && (
            <div className="flex justify-start">
                 <div className="max-w-[75%] px-4 py-2 rounded-xl text-sm bg-background-dark/70 text-text-primary">
                    <LoadingIndicator message="" />
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-background-dark rounded-b-2xl border-t border-border-color flex items-center gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          rows={1}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          className="flex-1 bg-background-dark border border-border-color rounded-lg px-3 py-2 text-text-primary placeholder-text-secondary/50 focus:ring-0 focus:border-brand-primary resize-none overflow-hidden"
          disabled={isStreaming}
          aria-label="Type your message"
        />
        <button
          type="submit"
          className="bg-brand-primary text-background-dark p-2 rounded-lg hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-dark focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!input.trim() || isStreaming}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
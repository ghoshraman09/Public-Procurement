
import React from 'react';
import { ChatMessage, MessageSender } from '../types';
import LoadingSpinner from './LoadingSpinner';
import SourceLinks from './SourceLinks';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;
  const isSystem = message.sender === MessageSender.SYSTEM;

  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white self-end'
    : isSystem 
    ? 'bg-amber-100 text-amber-800 self-center italic'
    : 'bg-slate-200 text-slate-800 self-start';
  
  const alignmentClasses = isUser 
    ? 'items-end' 
    : isSystem
    ? 'items-center'
    : 'items-start';

  // Basic markdown-like link detection: [text](url)
  const formatTextWithLinks = (text: string): React.ReactNode => {
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <a
          key={match[2]}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    // Handle newlines
    return parts.map((part, index) =>
      typeof part === 'string' ? (
        part.split('\n').map((line, i) => (
          <React.Fragment key={`${index}-${i}`}>
            {line}
            {i < part.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))
      ) : (
        part
      )
    );
  };


  return (
    <div className={`flex flex-col w-full mb-3 ${alignmentClasses}`}>
      <div
        className={`max-w-[80%] md:max-w-[70%] p-3 rounded-xl shadow ${bubbleClasses}`}
      >
        {message.isLoading && (
          <div className="flex items-center justify-center py-2">
            <LoadingSpinner size="sm" color={isUser ? 'text-white' : 'text-blue-600'} />
            <span className="ml-2 text-sm">Thinking...</span>
          </div>
        )}
        {!message.isLoading && message.text && (
           <div className="whitespace-pre-wrap">{formatTextWithLinks(message.text)}</div>
        )}
        {message.error && (
           <p className="text-red-500 text-sm font-semibold">Error: {message.error}</p>
        )}
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceLinks sources={message.sources} />
        )}
      </div>
      <p className={`text-xs mt-1 ${isUser ? 'text-slate-500 self-end mr-1' : 'text-slate-500 self-start ml-1'}`}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
};

export default MessageBubble;

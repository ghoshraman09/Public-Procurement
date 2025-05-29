
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  isSending: boolean;
  disabled?: boolean;
}

const SendIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);


const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isSending, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isSending && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white border-t border-slate-300 flex items-center space-x-2 sticky bottom-0"
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={disabled ? "Initializing assistant..." : "Ask about Indian procurement..."}
        className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow disabled:bg-slate-100 disabled:cursor-not-allowed"
        disabled={isSending || disabled}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center h-[50px] w-[50px]"
        disabled={isSending || disabled || !inputValue.trim()}
      >
        {isSending ? <LoadingSpinner size="sm" color="text-white" /> : <SendIcon className="w-5 h-5"/>}
      </button>
    </form>
  );
};

export default InputBar;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage, MessageSender, GroundingSource } from '../types';
import { initChat, sendMessageStream } from '../services/geminiService';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import { API_KEY_ERROR_MESSAGE, CHAT_INIT_ERROR_MESSAGE } from '../constants';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  },[]);

  useEffect(() => {
    // Check for API Key
    if (!process.env.API_KEY) {
      setError(API_KEY_ERROR_MESSAGE);
      setMessages([{
        id: crypto.randomUUID(),
        text: API_KEY_ERROR_MESSAGE,
        sender: MessageSender.SYSTEM,
        timestamp: new Date(),
        error: API_KEY_ERROR_MESSAGE,
      }]);
      return;
    }

    const chatInstance = initChat();
    if (chatInstance) {
      setChat(chatInstance);
      setMessages([
        {
          id: crypto.randomUUID(),
          text: "Hello! I'm the Indian Public Procurement Assistant. How can I help you today?",
          sender: MessageSender.AI,
          timestamp: new Date(),
        },
      ]);
    } else {
      setError(CHAT_INIT_ERROR_MESSAGE);
       setMessages([{
        id: crypto.randomUUID(),
        text: CHAT_INIT_ERROR_MESSAGE,
        sender: MessageSender.SYSTEM,
        timestamp: new Date(),
        error: CHAT_INIT_ERROR_MESSAGE,
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (inputText: string) => {
    if (!chat || isSending || !inputText.trim()) return;

    setIsSending(true);
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: inputText,
      sender: MessageSender.USER,
      timestamp: new Date(),
    };

    const aiMessageId = crypto.randomUUID();
    const initialAiMessage: ChatMessage = {
      id: aiMessageId,
      text: '',
      sender: MessageSender.AI,
      timestamp: new Date(),
      isLoading: true,
      sources: [],
    };

    setMessages((prevMessages) => [...prevMessages, userMessage, initialAiMessage]);

    await sendMessageStream(
      chat,
      inputText,
      (textChunk, newSources) => { // onChunk
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  text: msg.text + textChunk,
                  sources: newSources.reduce((acc, current) => {
                      if (!acc.find(item => item.uri === current.uri)) {
                          acc.push(current);
                      }
                      return acc;
                  }, msg.sources ? [...msg.sources] : []),
                }
              : msg
          )
        );
      },
      () => { // onComplete
         setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === aiMessageId ? { ...msg, isLoading: false } : msg
          )
        );
        setIsSending(false);
      },
      (errorMessage) => { // onError
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, isLoading: false, error: errorMessage, text: "Sorry, I couldn't process your request." }
              : msg
          )
        );
        setIsSending(false);
      }
    );
  };

  const isChatDisabled = !chat || !!error;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50">
      <header className="bg-blue-700 text-white p-4 shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-center">Indian Public Procurement Assistant</h1>
      </header>
      
      <main ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-100">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </main>

      <InputBar onSendMessage={handleSendMessage} isSending={isSending} disabled={isChatDisabled} />
    </div>
  );
};

export default ChatInterface;

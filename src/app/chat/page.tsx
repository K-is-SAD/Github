/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useRef, useEffect } from "react";
import { Send, Trash } from "lucide-react";
import Grid from "@/components/grids/Index";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";

const ChatPage = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearChat = () => {
    window.location.reload();
  };

  return (
    <div className="relative h-screen w-full overflow-hidden px-4">
      <div className="absolute inset-0 w-full h-full">
        <Grid />
      </div>

      <div className="relative top-24 z-10 flex flex-col h-[40rem] max-w-4xl mx-auto">
        <div className="flex-1 overflow-y-auto h-96 p-4 md:p-6 border dark:border-white border-black rounded-lg">
          <div>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center dark:text-white text-black space-y-4">
                <div className="w-16 h-16 bg-transparent border-2 dark:border-white border-black rounded-full flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <h2 className="text-lg font-medium">
                  How can I help you today?
                </h2>
                <p className="text-sm max-w-md">
                  Ask me anything and I&apos;ll do my best to assist you.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`mb-6 ${
                    m.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      m.role === "user"
                        ? "bg-transparent dark:text-white text-black"
                        : "bg-transparent dark:text-white text-black"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="bg-transparent rounded-lg px-4 py-3 dark:text-white text-black">
                  <div className="flex space-x-2">
                    <span className="animate-bounce">•</span>
                    <span className="animate-bounce delay-75">•</span>
                    <span className="animate-bounce delay-150">•</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="bg-transparent p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="w-full h-20 px-4 py-3 rounded-lg border dark:border-white border-black focus:outline-none focus:ring-1 focus:border-transparent resize-none overflow-auto bg-transparent dark:text-white text-black"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!input || isLoading}
                className="absolute right-2 top-2 p-2 rounded-md dark:text-white text-black disabled:hover:text-gray-400 transition-colors"
              >
                <Send size={20} />
              </button>
            </form>
            <p className="text-xs dark:text-white text-black mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

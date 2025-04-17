/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useRef, useEffect, useState } from "react";
import { Send, Trash, Link } from "lucide-react";
import Grid from "@/components/grids/Index";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";

const ChatPage = () => {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [showRepoInput, setShowRepoInput] = useState<boolean>(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    status,
    stop,
    isLoading,
    error,
    reload,
  } = useChat({
    api: "/api/chat",
    body: {
      repoUrl: repoUrl,
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearChat = () => {
    window.location.reload();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    originalHandleSubmit(e);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden px-4">
      <div className="absolute inset-0 w-full h-full">
        <Grid />
      </div>

      <div className="relative top-24 z-10 flex flex-col h-[40rem] max-w-4xl mx-auto">
        
        <div className="mb-4 flex items-center">
          <button
            onClick={() => setShowRepoInput(!showRepoInput)}
            className="flex items-center gap-2 px-3 py-2 rounded-md border dark:border-white border-black text-sm dark:text-white text-black"
          >
            <Link size={16} />
            {showRepoInput ? "Hide Repo URL" : "Set Repository URL"}
          </button>

          {repoUrl && (
            <div className="ml-4 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm flex items-center">
              <span className="truncate max-w-[200px]">{repoUrl}</span>
              <button
                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setRepoUrl("")}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {showRepoInput && (
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="Enter GitHub repository URL"
                className="w-full px-4 py-2 rounded-lg border dark:border-white border-black focus:outline-none focus:ring-1 focus:border-transparent bg-transparent dark:text-white text-black"
              />
            </div>
            <p className="text-xs dark:text-white text-black mt-1">
              Adding a repository URL helps provide context for
              repository-specific questions
            </p>
          </div>
        )}

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
                  Ask me anything about your repository and I&apos;ll do my best
                  to assist you.
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
              {error && (
                <>
                  <div>An error occurred.</div>
                  <button type="button" onClick={() => reload()}>
                    Retry
                  </button>
                </>
              )}

              {(status === "submitted" || status === "streaming") && (
                <div>
                  {status === "submitted" && (
                    <div className="flex space-x-2">
                      <span className="animate-bounce">•</span>
                      <span className="animate-bounce delay-75">•</span>
                      <span className="animate-bounce delay-150">•</span>
                    </div>
                  )}
                  <button type="button" onClick={() => stop()}>
                    Stop
                  </button>
                </div>
              )}

              <textarea
                value={input}
                onChange={handleInputChange}
                disabled={status !== "ready"}
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
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={clearChat}
                className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Trash size={14} />
                Clear chat
              </button>
              <p className="text-xs dark:text-white text-black text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

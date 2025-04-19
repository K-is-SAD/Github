/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useRef, useEffect, useState } from "react";
import { Send, Trash,Github,ChevronDown, X } from "lucide-react";
import Grid from "@/components/grids/Index";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

const ChatPage = () => {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [showRepoInput, setShowRepoInput] = useState<boolean>(false);
  const [showRepoDropdown, setShowRepoDropdown] = useState<boolean>(false);
  const [repositories, setRepositories] = useState<Array<string>>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowRepoDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    if (showRepoDropdown) {
      fetchRepositories();
    }
  }, [showRepoDropdown]);

  const fetchRepositories = async () => {
    setIsLoadingRepos(true);
    try {
      const response = await fetch(`/api/allrepos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch repositories: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.data);

      setRepositories(data.data || []);
    } catch (err) {
      console.error("Error fetching repositories:", err);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const selectRepository = (url: string) => {
    setRepoUrl(url);
    setShowRepoDropdown(false);
    setShowRepoInput(false);
  };

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
        <div className="mb-4 flex md:flex-row flex-col items-center gap-y-4 justify-between">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setShowRepoDropdown(!showRepoDropdown);
                setShowRepoInput(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-md border dark:border-white border-black text-sm dark:text-white text-black"
            >
             <Github className="text-xl" />
              Set Repository URL
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showRepoDropdown ? "rotate-180" : ""
                }`}
              />
            </button>
            {showRepoDropdown && (
              <div className="absolute mt-1 w-72 backdrop-blur-md bg-transparent border dark:border-white border-black rounded-md shadow-lg z-20">
                <div className="border-t dark:border-white border-black"></div>
                {isLoadingRepos ? (
                  <div className="p-3 text-center text-sm dark:text-white text-black">
                    Loading repositories...
                  </div>
                ) : repositories.length > 0 ? (
                  <ul className="max-h-48 overflow-y-auto overflow-x-hidden text-wrap">
                    {repositories.map((repo, index) => (
                      <li
                        key={index}
                        className="px-3 py-2 cursor-pointer text-sm dark:text-white text-black hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => selectRepository(repo)}
                      >
                        {repo}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-center text-sm dark:text-white text-black">
                    No repositories found
                  </div>
                )}
              </div>
            )}
          </div>

          {repoUrl && (
            <div className="ml-4 px-3 py-1 bg-transparent dark:bg-transparent rounded-full text-sm flex items-center">
              <span className="truncate max-w-[200px] dark:text-white text-black">
                {repoUrl}
              </span>
              <button
                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setRepoUrl("")}
              >
                ×
              </button>
            </div>
          )}
           <Link
              href={"/readme"}
              className="rounded-md dark:bg-white bg-black mx-4"
            >
              <span
                className="block -translate-x-2 -translate-y-2 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-2 text-sm text-center  hover:-translate-y-3 
    active:translate-x-0 active:translate-y-0
    transition-all"
              >
                Continue...
              </span>
            </Link>
        </div>
          
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

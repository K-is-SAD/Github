/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Grid from "@/components/grids/Index";
import {
  ChevronDown,
  Copy,
  FilePlus,
  Folder,
  Link,
  Send,
  Trash,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const ReadmePage = () => {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [showRepoDropdown, setShowRepoDropdown] = useState<boolean>(false);
  const [showRepoInput, setShowRepoInput] = useState<boolean>(false);
  const [repositories, setRepositories] = useState<Array<string>>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<
    Array<{ id: string; role: string; content: string }>
  >([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<"ready" | "streaming" | "submitted">(
    "ready"
  );

  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [categories, setCategories] = useState<
    Array<{
      _id: string;
      posts: Array<{ _id: string; content: string; createdAt: string }>;
    }>
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] =
    useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupContent, setPopupContent] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    content: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

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

      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, popupRef]);

  useEffect(() => {
    if (showRepoDropdown) {
      fetchRepositories();
    }
  }, [showRepoDropdown]);

  useEffect(() => {
    if (repoUrl) {
      setShowSidebar(true);
      fetchCategories();
    } else {
      setShowSidebar(false);
      setCategories([]);
      setSelectedCategory(null);
    }
  }, [repoUrl]);

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

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch(
        `/api/readme-content/${encodeURIComponent(repoUrl)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();
      console.log("Categories and content:", data.data);

      if (data.success && data.data) {
        setCategories(data.data);
      } else {
        setCategories([]);
        console.error("Failed to fetch categories:", data.message);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const openContentPopup = (postId: string, content: string) => {
    setSelectedItem({ id: postId, content });
    setPopupContent(content);
    setShowPopup(true);
  };

  const copyContent = () => {
    navigator.clipboard
      .writeText(popupContent)
      .then(() => {
        alert("Content copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const deleteItem = async () => {
    if (!selectedItem || !selectedCategory) return;

    try {
      const response = await fetch(`/api/readme-content`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl, content: selectedItem.content }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.status}`);
      }

      fetchCategories();
      setShowPopup(false);
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const clearChat = () => {
    window.location.reload();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleRepoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoUrl(e.target.value);
  };

  const selectRepository = (url: string) => {
    setRepoUrl(url);
    setShowRepoDropdown(false);
    setShowRepoInput(false);
  };

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const stop = () => {
    setIsLoading(false);
    setStatus("ready");
  };

  const reload = async () => {
    setError(null);
    await handleSubmit({
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || !repoUrl) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setIsLoading(true);
    setStatus("submitted");

    try {
      const response = await fetch(
        `/api/readme-content/${encodeURIComponent(repoUrl)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ repoUrl, message: input }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.content ||
          "Sorry, I couldn't generate content for this request.",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      fetchCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setIsLoading(false);
      setStatus("ready");
    }
  };

  const getCategoryLabel = (categoryId: string) => {
    return categoryId;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="relative h-screen w-full overflow-hidden px-4">
      <div className="absolute inset-0 w-full h-full">
        <Grid />
      </div>

      <div className="relative top-24 z-10 flex flex-col md:flex-row h-[40rem] max-w-6xl mx-auto">
        {showSidebar && (
          <div className="fixed md:relative z-30 w-64 md:mr-4 dark:bg-black bg-white border dark:border-white border-black rounded-lg overflow-hidden shadow-lg md:shadow-none">
            <div className="p-3 border-b dark:border-white border-black flex justify-between items-center">
              <h3 className="font-medium text-sm dark:text-white text-black">
                Repository Content
              </h3>
              <button
                className="md:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowSidebar(false)}
              >
                <X size={16} className="dark:text-white text-black" />
              </button>
            </div>

            <div className="p-2 max-h-[calc(100vh-150px)] overflow-y-auto">
              {isLoadingCategories ? (
                <div className="p-3 text-center text-sm dark:text-white text-black">
                  Loading content...
                </div>
              ) : categories.length > 0 ? (
                <ul className="space-y-1">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center ${
                          selectedCategory === category._id
                            ? "bg-transparent font-medium"
                            : "bg-transparent"
                        }`}
                        onClick={() => selectCategory(category._id)}
                      >
                        <Folder size={16} className="mr-2" />
                        {getCategoryLabel(category._id)}
                      </button>

                      {selectedCategory === category._id &&
                        category.posts &&
                        category.posts.length > 0 && (
                          <div className="ml-6 mt-1 border-l dark:border-white border-black pl-2">
                            <ul className="space-y-1 py-1">
                              {category.posts.map((post, postIndex) => (
                                <li key={postIndex}>
                                  <button
                                    className="w-full font-bold text-left px-2 py-1 rounded-md text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                                    onClick={() =>
                                      openContentPopup(post._id, post.content)
                                    }
                                  >
                                    <FilePlus size={12} className="mr-1" />
                                    {formatDateTime(post.createdAt)}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-center text-sm dark:text-white text-black">
                  No content found for this repository
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1">
          <div className="mb-4 flex flex-col space-y-3">
            <div className="flex items-center">
              <div className="relative w-full md:w-auto" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setShowRepoDropdown(!showRepoDropdown);
                    setShowRepoInput(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border dark:border-white border-black text-sm dark:text-white text-black"
                >
                  <Link size={16} />
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
                            className="px-3 py-2 cursor-pointer text-sm dark:text-white text-black"
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
            </div>

            

            {repoUrl && !showRepoInput && (
              <div className="flex items-center">
                <div className="px-3 py-1 dark:bg-black bg-white backdrop-blur-md rounded-full text-sm flex items-center">
                  <span className="truncate max-w-[200px]">{repoUrl}</span>
                  <button
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setRepoUrl("")}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-2 overflow-y-auto h-96 p-4 md:p-6 border dark:border-white border-black rounded-lg bg-transparent">
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
                    Ask me anything about your repository and I&apos;ll do my
                    best to assist you.
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

          <div className="bg-transparent p-4 w-full">
            <div className="w-full">
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  disabled={status !== "ready" || !repoUrl}
                  placeholder={
                    repoUrl
                      ? "Generate anything from this repository(Readme, LinkedIn, Article etc)..."
                      : "Select a repository first"
                  }
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
                  disabled={!input || isLoading || !repoUrl}
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

      {showPopup && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={popupRef}
            className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            <div className="p-4 border-b dark:border-white border-black flex justify-between items-center">
              <h3 className="font-medium dark:text-white text-black">
                {selectedCategory &&
                  `${getCategoryLabel(selectedCategory)} Content`}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyContent}
                  className="p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Copy to clipboard"
                >
                  <Copy size={18} className="dark:text-white text-black" />
                </button>
                <button
                  onClick={deleteItem}
                  className="p-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Delete content"
                >
                  <Trash size={18} className="text-red-500" />
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="p-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Close"
                >
                  <X size={18} className="dark:text-white text-black" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{popupContent}</ReactMarkdown>
              </div>
            </div>
            <div className="p-2 flex justify-center items-center space-x-4 border-t dark:border-white border-black">
              <button
                onClick={async () => {
                  try {
                    if (
                      window.confirm(
                        "Are you sure you want to delete all contents for this repository? This action cannot be undone."
                      )
                    ) {
                      const response = await fetch(`/api/delete-all-contents`, {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ repoUrl }),
                      });

                      if (!response.ok) {
                        throw new Error(
                          `Failed to delete all contents: ${response.status}`
                        );
                      }

                      setShowPopup(false);
                      fetchCategories();
                      alert("All contents have been deleted successfully.");
                    }
                  } catch (err) {
                    console.error("Error deleting all contents:", err);
                    alert("Failed to delete all contents. Please try again.");
                  }
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center cursor-pointer transition-colors"
              >
                <Trash size={16} className="mr-2" />
                Delete all Contents
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadmePage;

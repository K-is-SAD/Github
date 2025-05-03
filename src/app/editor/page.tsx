/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect, useRef } from "react";
import Grid from "@/components/grids/Index";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "next/navigation";
import {
  IconRefresh,
  IconBrandGithub,
  IconEye,
  IconCode,
  IconDeviceFloppy,
  IconCheck,
  IconDownload,
} from "@tabler/icons-react";
import {
  ChevronDown,
  Copy,
  FilePlus,
  Folder,
  Send,
  Trash,
  Github,
  X,
} from "lucide-react";
import { convertToJSON } from "@/utils/jsonConverter";
import Link from "next/link";

interface Section {
  title: string;
  content: string;
  description?: string;
  order: number;
  defaultContent?: string;
}

interface TemplateData {
  _id: string;
  name: string;
  description: string;
  sections: Section[];
}

export default function EditorPage() {
 

  const [content, setContent] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [repository, setRepository] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedStatus, setSavedStatus] = useState<boolean>(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [title, setTitle] = useState<string>("Untitled Document");

  // New state for repository dropdown and sidebar
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [showRepoDropdown, setShowRepoDropdown] = useState<boolean>(false);
  const [showRepoInput, setShowRepoInput] = useState<boolean>(false);
  const [repositories, setRepositories] = useState<Array<string>>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [categories, setCategories] = useState<
    Array<{
      _id: string;
      posts: Array<{ _id: string; content: string; createdAt: string }>;
    }>
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupContent, setPopupContent] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    content: string;
  } | null>(null);

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

  useEffect(() => {
    if (repoUrl) {
      setShowSidebar(true);
      fetchCategories();
      setRepository(repoUrl); // Connect to existing state
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

  const selectRepository = (url: string) => {
    setRepoUrl(url);
    setRepository(url); // Update both states
    setShowRepoDropdown(false);
    setShowRepoInput(false);
  };

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleGenerate = async () => {
    if (!repository) return;

    setGenerating(true);
    try {

      const apiUrl = process.env.PYTHON_BACKEND_URL;

      const response = await fetch(`${apiUrl}/api/summarise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_repo_url: repository }),
      });

      const data = await response.json();
      console.log(data.repoMarkdown);

      const repoMarkdown = await convertToJSON(data.repoMarkdown);
      console.log("REPOMARKDOWN IN EDITOR \n", repoMarkdown);
      

      if (response.ok) {
        setContent(data.repoMarkdown);

        // Extract sections if possible
        const titleMatch = data.repoMarkdown.match(/^# (.*?)$/m);
        if (titleMatch) {
          setTitle(titleMatch[1]);
        }

        const sectionMatches = data.repoMarkdown.match(
          /^## (.*?)$([\s\S]*?)(?=^## |\Z)/gm
        );
        if (sectionMatches && sectionMatches.length > 0) {
          const extractedSections = sectionMatches.map(
            (section: string | undefined, index: number) => {
              const titleMatch = (section ?? "").match(/^## (.*?)$/m);
              const title = titleMatch ? titleMatch[1] : `Section ${index + 1}`;
              const content = (section ?? "").replace(/^## .*?$/m, "").trim();
              return {
                title,
                content,
                order: index,
              };
            }
          );
          setSections(extractedSections);
        }
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/editor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl, content }),
      });

      const data = await response.json();
      if(data.success){
        console.log("Saved content:", data.content);
        setSavedStatus(true);
      }

      // Show saved status
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 3000);  
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSectionChange = (index: number, sectionContent: string) => {
    const updatedSections = [...sections];
    updatedSections[index].content = sectionContent;
    setSections(updatedSections);

    // Regenerate full content
    let fullContent = `# ${title}\n\n`;
    updatedSections.forEach((section) => {
      fullContent += `## ${section.title}\n\n${section.content}\n\n`;
    });
    setContent(fullContent);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Update the content with new title
    const contentWithoutTitle = content.replace(/^# .*?(\n|$)/, "");
    setContent(`# ${newTitle}\n${contentWithoutTitle}`);
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryLabel = (categoryId: string) => {
    return categoryId;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0">
        <Grid />
      </div>
      <div className="relative top-16 z-10 container mx-auto p-4">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-full max-w-4xl">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-3xl font-bold mb-2 p-2 bg-transparent border-b border-black dark:border-white focus:outline-none"
              placeholder="Document Title"
            />
            <p className="text-black dark:text-white">
              {templateData?.description ||
                "Create and edit markdown content for your documentation"}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-4 max-w-7xl mx-auto">
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-64 md:mr-4 dark:bg-black bg-white border dark:border-white border-black rounded-lg overflow-hidden shadow-lg md:shadow-none">
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

          {/* Main Editor */}
          <div className="w-full flex flex-col space-y-8">
            {/* Repository Selector */}
            <div className="flex items-center mb-4">
              <div className="relative w-full md:w-auto" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setShowRepoDropdown(!showRepoDropdown);
                    setShowRepoInput(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border dark:border-white border-black text-sm dark:text-white text-black"
                >
                  <Github size={16} />
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
              <div className="flex items-center mb-4">
                <div className="px-3 py-1 dark:bg-black bg-white backdrop-blur-md rounded-full text-sm flex items-center">
                  <span className="truncate max-w-[200px]">{repoUrl}</span>
                  <button
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => {
                      setRepoUrl("");
                      setRepository("");
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <div className="bg-transparent mb-4 flex justify-between items-center">
              <div className="text-sm">
                {savedStatus && (
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <IconCheck size={16} className="mr-1" /> Saved
                  </span>
                )}
              </div>

              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  onClick={() => setPreviewMode(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg flex items-center ${
                    !previewMode
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-gray-200 dark:bg-black border dark:border-white border-black"
                  }`}
                >
                  <IconCode size={16} className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg flex items-center ${
                    previewMode
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-gray-200 dark:bg-black border dark:border-white border-black"
                  }`}
                >
                  <IconEye size={16} className="mr-1" /> Preview
                </button>
              </div>
            </div>

            {!previewMode ? (
              sections.length > 0 ? (
                // Section-based editing
                <div className="rounded-lg shadow p-4">
                  <h3 className="text-lg font-medium mb-2">
                    {sections[activeSection]?.title}
                  </h3>
                  {sections[activeSection]?.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {sections[activeSection].description}
                    </p>
                  )}
                  <textarea
                    value={sections[activeSection]?.content || ""}
                    onChange={(e) =>
                      handleSectionChange(activeSection, e.target.value)
                    }
                    className="w-full h-[50vh] p-4 rounded-lg border dark:border-white border-black focus:outline-none focus:ring-1 focus:border-transparent resize-none overflow-auto bg-transparent dark:text-white text-black font-mono text-sm shadow"
                    placeholder={`Write content for ${
                      sections[activeSection]?.title || "this section"
                    }...`}
                  />
                </div>
              ) : (
                // Full document editing
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-[50vh] p-4 rounded-lg border dark:border-white border-black focus:outline-none focus:ring-1 focus:border-transparent resize-none overflow-auto bg-transparent dark:text-white text-black font-mono text-sm shadow"
                  placeholder="Start writing in markdown..."
                />
              )
            ) : (
              <div className="w-full h-[50vh] p-4 rounded-lg border dark:border-white border-black focus:outline-none focus:ring-1 focus:border-transparent resize-none overflow-auto bg-transparent dark:text-white text-black font-mono text-sm shadow">
                <article className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none">
                  <ReactMarkdown>
                    {content || "Nothing to preview yet."}
                  </ReactMarkdown>
                </article>
              </div>
            )}

            <div className="flex justify-between">
              <div className="flex space-x-4">
                <button
                  className="rounded-md dark:bg-white bg-black"
                  onClick={() => setContent("")}
                >
                  <span
                    className={` -translate-x-2 -translate-y-2 flex items-center justify-between rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
                hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
               `}
                  >
                    <IconRefresh className="mr-1" size={16} /> Reset
                  </span>
                </button>
                <button
                  className="rounded-md dark:bg-white bg-black"
                  onClick={handleExport}
                >
                  <span
                    className={` -translate-x-2 -translate-y-2 flex items-center justify-between rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
                hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
               `}
                  >
                    <IconDownload className="mr-1" size={16} /> Export
                  </span>
                </button>
              </div>
              <div className="space-x-4">
              <button
                className="rounded-md dark:bg-white bg-black"
                onClick={handleSave}
                disabled={saving}
              >
                <span
                  className={` -translate-x-2 -translate-y-2 flex items-center justify-between rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
                hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
               `}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <IconDeviceFloppy className="mr-1" size={16} /> Save
                    </>
                  )}
                </span>
              </button>
              <Link href=''>
              <button
                className="rounded-md dark:bg-white bg-black"
              >
                <span
                  className={` -translate-x-2 -translate-y-2 flex items-center justify-between rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
                hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
               `}
                >
                  Publish
                </span>
              </button>
              </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Popup Modal */}
      {showPopup && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
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
                     
                    }
                  } catch (err) {
                    console.error("Error deleting all contents:", err);
                    
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
}
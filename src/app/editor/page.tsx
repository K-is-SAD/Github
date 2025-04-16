/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
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
import { convertToJSON } from "@/utils/jsonConverter";

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
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");
  const repoId = searchParams.get("repo");

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

  useEffect(() => {
    const fetchData = async () => {
      if (templateId) {
        try {
          const response = await fetch(`/api/templates/${templateId}`);
          if (response.ok) {
            const data = await response.json();
            setTemplateData(data);
            setTitle(data.name);

            // Initialize sections from template
            if (data.sections && data.sections.length > 0) {
              const initialSections = data.sections.map((section: Section) => ({
                title: section.title,
                description: section.description || "",
                content: section.defaultContent || "",
                order: section.order,
              }));

              initialSections.sort(
                (a: { order: number }, b: { order: number }) =>
                  a.order - b.order
              );
              setSections(initialSections);

              // Generate initial content from sections
              const initialContent = initialSections
                .map(
                  (section: { title: unknown; content: unknown }) =>
                    `## ${section.title}\n\n${section.content}`
                )
                .join("\n\n");

              setContent(`# ${data.name}\n\n${initialContent}`);
            }
          }
        } catch (error) {
          console.error("Error fetching template:", error);
        }
      }

      if (repoId) {
        try {
          const response = await fetch(`/api/repositories/${repoId}`);
          if (response.ok) {
            const data = await response.json();
            setRepository(data.url);
            // If we have content from this repo, load it
            if (data.readmeContent) {
              setContent(data.readmeContent);
            }
          }
        } catch (error) {
          console.error("Error fetching repository data:", error);
        }
      }
    };

    fetchData();
  }, [templateId, repoId]);

  const handleGenerate = async () => {
    if (!repository) return;

    setGenerating(true);
    try {
      const response = await fetch("http://localhost:8000/api/summarise", {
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
      // Save to database logic would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0">
        <Grid />
      </div>
      <div className="relative top-20 z-10 container mx-auto px-4">
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
          {/* Main Editor */}
          <div className="w-full flex flex-col space-y-8">
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
                <div className=" rounded-lg shadow p-4">
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
                    className="w-full h-[50vh] p-4 rounded-lg border dark:border-white border-black focus:outline-none focus:ring-1 focus:border-transparent resize-none overflow-auto bg-transparent dark:text-white text-black  font-mono text-sm shadow"
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
                  className="w-full h-[50vh] p-4 rounded-lg border dark:border-white border-black focus:outline-none focus:ring-1 focus:border-transparent resize-none overflow-auto bg-transparent dark:text-white text-black  font-mono text-sm shadow"
                  placeholder="Start writing in markdown..."
                />
              )
            ) : (
              <div className="w-full h-[50vh] p-4 rounded-lg border dark:border-white border-black focus:outline-none focus:ring-1 focus:border-transparent resize-none overflow-auto bg-transparent dark:text-white text-black  font-mono text-sm shadow">
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
                    className={` -translate-x-2 -translate-y-2 flex items-center justify-between  rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

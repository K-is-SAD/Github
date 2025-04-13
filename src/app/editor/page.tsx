"use client";
import React, { useState, useEffect } from "react";
import Grid from "@/components/grids/Index";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "next/navigation";
import { 
  IconRefresh, 
  IconBrandGithub, 
  IconEye, 
  IconCode, 
  IconDeviceFloppy,
  IconCheck,
  IconDownload
} from "@tabler/icons-react";

interface Section {
  title: string;
  content: string;
  description?: string;
  order: number;
  defaultContent?: string; // Added defaultContent property
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
                description: section.description || '',
                content: section.defaultContent || '',
                order: section.order
              }));
              
              initialSections.sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
              setSections(initialSections);
              
              // Generate initial content from sections
              const initialContent = initialSections
                .map((section: { title: unknown; content: unknown; }) => `## ${section.title}\n\n${section.content}`)
                .join('\n\n');
              
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
      const response = await fetch("/api/process-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl: repository }),
      });

      const data = await response.json();
      if (response.ok) {
        setContent(data.repoMarkdown);
        
        // Extract sections if possible
        const titleMatch = data.repoMarkdown.match(/^# (.*?)$/m);
        if (titleMatch) {
          setTitle(titleMatch[1]);
        }
        
        const sectionMatches = data.repoMarkdown.match(/^## (.*?)$([\s\S]*?)(?=^## |\Z)/gm);
        if (sectionMatches && sectionMatches.length > 0) {
          const extractedSections = sectionMatches.map((section: string | undefined, index: number) => {
            const titleMatch = (section ?? "").match(/^## (.*?)$/m);
            const title = titleMatch ? titleMatch[1] : `Section ${index + 1}`;
            const content = (section ?? "").replace(/^## .*?$/m, "").trim();
            return {
              title,
              content,
              order: index
            };
          });
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    updatedSections.forEach(section => {
      fullContent += `## ${section.title}\n\n${section.content}\n\n`;
    });
    setContent(fullContent);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Update the content with new title
    const contentWithoutTitle = content.replace(/^# .*?(\n|$)/, '');
    setContent(`# ${newTitle}\n${contentWithoutTitle}`);
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full min-h-screen">
      <div className="absolute inset-0">
        <Grid />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-full max-w-4xl">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-3xl font-bold mb-2 p-2 bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500"
              placeholder="Document Title"
            />
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {templateData?.description || "Create and edit markdown content for your documentation"}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-4 max-w-7xl mx-auto">
          {/* Sidebar - Repository Info and Sections */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
              <h2 className="text-lg font-semibold mb-3">Repository</h2>
              <div className="flex mb-3">
                <input
                  type="text"
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                  placeholder="Enter GitHub repository URL"
                  className="w-full rounded-l-md p-2 border focus:outline-none dark:bg-gray-700 dark:border-gray-600"
                />
                <button 
                  onClick={handleGenerate}
                  disabled={generating || !repository}
                  className="bg-black dark:bg-white text-white dark:text-black rounded-r-md px-3 disabled:opacity-50 flex items-center justify-center"
                >
                  {generating ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <IconBrandGithub size={20} />
                  )}
                </button>
              </div>
              {generating && (
                <p className="text-xs text-gray-500 text-center">
                  Analyzing repository...
                </p>
              )}
            </div>
            
            {/* Sections Navigation */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-3">Sections</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sections.length > 0 ? (
                  sections.map((section, index) => (
                    <div 
                      key={index}
                      onClick={() => setActiveSection(index)}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        activeSection === index 
                          ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <h3 className="font-medium text-sm">{section.title}</h3>
                      {section.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {section.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    No sections defined yet. Generate content from a repository or start editing.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="w-full lg:w-3/4 flex flex-col">
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
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg flex items-center ${!previewMode 
                    ? 'bg-black dark:bg-white text-white dark:text-black' 
                    : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <IconCode size={16} className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg flex items-center ${previewMode 
                    ? 'bg-black dark:bg-white text-white dark:text-black' 
                    : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <IconEye size={16} className="mr-1" /> Preview
                </button>
              </div>
            </div>

            {!previewMode ? (
              sections.length > 0 ? (
                // Section-based editing
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h3 className="text-lg font-medium mb-2">
                    {sections[activeSection]?.title}
                  </h3>
                  {sections[activeSection]?.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {sections[activeSection].description}
                    </p>
                  )}
                  <textarea
                    value={sections[activeSection]?.content || ''}
                    onChange={(e) => handleSectionChange(activeSection, e.target.value)}
                    className="w-full h-[60vh] p-4 rounded-lg border focus:outline-none dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
                    placeholder={`Write content for ${sections[activeSection]?.title || 'this section'}...`}
                  />
                </div>
              ) : (
                // Full document editing
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-[60vh] p-4 rounded-lg border focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-600 font-mono text-sm shadow"
                  placeholder="Start writing in markdown..."
                />
              )
            ) : (
              <div className="w-full h-[60vh] p-6 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-600 overflow-auto shadow">
                <article className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none">
                  <ReactMarkdown>
                    {content || "Nothing to preview yet."}
                  </ReactMarkdown>
                </article>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <div className="flex space-x-2">
                <Button 
                  className="rounded-md bg-transparent border border-gray-300 dark:border-gray-600"
                  onClick={() => setContent("")}
                >
                  <IconRefresh className="mr-1" size={16} /> Reset
                </Button>
                <Button 
                  className="rounded-md bg-transparent border border-gray-300 dark:border-gray-600"
                  onClick={handleExport}
                >
                  <IconDownload className="mr-1" size={16} /> Export
                </Button>
              </div>
              <Button 
                className="rounded-md dark:bg-white bg-black"
                onClick={handleSave}
                disabled={saving}
              >
                <span className="flex items-center -translate-x-1 -translate-y-1 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-2 text-sm hover:-translate-y-2 active:translate-x-0 active:translate-y-0 transition-all">
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
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
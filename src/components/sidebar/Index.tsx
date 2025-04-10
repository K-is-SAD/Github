"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
// import ReactMarkdown from "react-markdown";

const Index = () => {
  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      href: "#",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col bg-gray-100 md:flex-row dark:bg-transparent",
        "h-[80vh]"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
    </div>
  );
};

const Dashboard = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!repoUrl.trim()) return;

    setIsLoading(true);
    setResponse("Processing your request...");
    setError("");

    try {
      const apiResponse = await fetch("/api/process-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl: repoUrl }),
      });
      
      const data = await apiResponse.json();
      
      if (!apiResponse.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      if (data.success) {
        setResponse(data.repoMarkdown);
      } else {
        throw new Error(data.error || "Processing failed");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setResponse("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response || response === "Processing your request...") return;
    
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex h-[80vh] w-full pl-10">
      <div className="flex items-center justify-between w-full h-[80vh] p-4 gap-4 lg:flex-row flex-col">
        <div className="flex flex-col items-center justify-start w-full h-full rounded-lg shadow p-4 gap-y-6">
          <h2 className="text-xl text-center font-semibold">Enter GitHub Repository URL</h2>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full h-96 p-3 rounded-lg focus:border-none focus:outline-none"
            placeholder="Enter GitHub repo URL here..."
          />
          <button 
            className="rounded-md bg-white" 
            onClick={handleSubmit}
        
          >
            <span
              className={`block -translate-x-2 -translate-y-2 rounded-md border-2 border-white bg-black p-4 text-xl  
                hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
               `}
            >
              {isLoading ? "Analyzing..." : "Analyze Repo"}
            </span>
          </button>
        </div>
        <div className="border-r-1 border-white h-full" />

        <div className="flex flex-col items-center justify-start w-full h-[80vh] rounded-lg shadow p-4 gap-y-6">
          <h2 className="text-xl text-center font-semibold">Generated Markdown Output</h2>
          <div className="w-full h-96 p-3 rounded-lg overflow-auto bg-transparent">
            {error && <p className="text-red-500">Error: {error}</p>}

            {/* <ReactMarkdown>
              {response && response !== "Processing your request..."
                ? response
                : response || "Your processed content will appear here"}
            </ReactMarkdown> */}
          </div>
          <button 
            className="rounded-md bg-white" 
            onClick={handleCopy}
            
          >
            <span
              className={`flex items-center gap-2 -translate-x-2 -translate-y-2 rounded-md border-2 border-white 
                bg-black p-4 text-xl hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
                `}
            >
              {copied ? <IconCheck size={20} /> : <IconCopy size={20} />}
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;


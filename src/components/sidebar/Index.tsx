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
  IconTrash,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { convertToJSON } from "@/utils/jsonConverter";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

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
        "flex w-full flex-1 flex-col bg-transparent md:flex-row dark:bg-transparent",
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Sign in to view this page</div>;
  }

  const handleSubmit = async () => {
    if (!repoUrl.trim()) return;

    setIsLoading(true);
    setResponse("Processing your request...");
    setError("");
    setAnalysisComplete(false);

    try {
      const apiResponse = await fetch("http://localhost:8000/api/summarise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_repo_url: repoUrl }),
      });

      const data = await apiResponse.json();
      console.log(data.repoMarkdown);

      const repoMarkdown = await convertToJSON(data.repoMarkdown);
      console.log("REPOMARKDOWN IN SIDEBAR \n", repoMarkdown);

      if (!apiResponse.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      if (!data.success) {
        throw new Error(data.error || "Processing failed");
      } else {
        setResponse(data.repoMarkdown);
        setAnalysisComplete(true);

        const body = {
          userId: user?.id,
          repoUrl: repoUrl,
          files: repoMarkdown.files,
          projectIdea: repoMarkdown.project_idea,
          projectSummary: repoMarkdown.project_summary,
          techStacks: repoMarkdown.tech_stack,
          keyFeatures: repoMarkdown.key_features,
          potentialIssues: repoMarkdown.potential_issues,
          feasibility: repoMarkdown.feasibility,
        };

        const response = await fetch("/api/reposummary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const result = await response.json();
        if (result.success) {
          console.log("REPO SUMMARY CREATED SUCCESSFULLY!!");
        } else {
          throw new Error(result.message || "Error creating repo summary");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setResponse("");
      setAnalysisComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!repoUrl.trim()) {
      setError("Please enter a repository URL to delete");
      return;
    }

    setIsDeleting(true);
    setError("");
    setDeleteSuccess(false);

    try {
      const deleteResponse = await fetch("/api/reposummary", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
      });

      const result = await deleteResponse.json();

      if (!deleteResponse.ok) {
        throw new Error(result.error || "Failed to delete repository");
      }

      if (result.success) {
        setDeleteSuccess(true);
        setResponse("");
        setAnalysisComplete(false);
        console.log("Repository deleted successfully");
        // Optional: Clear the input field after successful deletion
        // setRepoUrl("");
      } else {
        throw new Error(result.message || "Failed to delete repository");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred during deletion"
      );
    } finally {
      setIsDeleting(false);
      // Hide the success message after 3 seconds
      if (deleteSuccess) {
        setTimeout(() => setDeleteSuccess(false), 3000);
      }
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
        <div className="flex flex-col items-center justify-start w-full h-full rounded-lg p-4 gap-y-6">
          <h2 className="text-xl text-center font-semibold">
            Enter GitHub Repository URL
          </h2>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full h-96 p-3 rounded-lg focus:border-none focus:outline-none"
            placeholder="Enter GitHub repo URL (only) here..."
          />
          <div className="flex md:flex-row flex-col gap-4 w-full justify-center">
            <button
              className="rounded-md dark:bg-white bg-black"
              onClick={handleSubmit}
              disabled={isLoading || isDeleting}
            >
              <span
                className={`block -translate-x-2 -translate-y-2 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
                  hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
                  ${
                    isLoading || isDeleting
                      ? "cursor-not-allowed"
                      : ""
                  }
                `}
              >
                {isLoading ? "Analyzing..." : "Analyze Repo"}
              </span>
            </button>

            <button
              className="rounded-md dark:bg-white bg-black"
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
            >
              <span
                className={`flex items-center justify-center gap-2 -translate-x-2 -translate-y-2 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
                  hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
                  ${
                    isLoading || isDeleting
                      ? "cursor-not-allowed"
                      : ""
                  }
                  ${deleteSuccess ? "bg-green-100" : ""}
                `}
              >
                <IconTrash size={20} className="dark:text-white text-black" />
                {isDeleting
                  ? "Deleting..."
                  : deleteSuccess
                  ? "Deleted!"
                  : "Delete Repo"}
              </span>
            </button>
          </div>
        </div>
        <div className="border-r-1 dark:border-white border-black h-full" />

        <div className="flex flex-col items-center justify-start w-full h-full rounded-lg p-4 gap-y-6">
          <h2 className="text-xl text-center font-semibold">
            Generated Markdown Output
          </h2>
          <div className="w-full h-96 p-3 rounded-lg bg-transparent relative">
            <div className="absolute inset-0 overflow-y-auto overflow-x-auto p-3">
              {error && <p className="text-red-500">Error: {error}</p>}
              {deleteSuccess && (
                <p className="text-green-500">
                  Repository deleted successfully!
                </p>
              )}

              {isLoading && (
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              )}

              <ReactMarkdown>
                {response && response !== "Processing your request..."
                  ? response
                  : response || "Your processed content will appear here"}
              </ReactMarkdown>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
            <button
              className="rounded-md dark:bg-white bg-black"
              onClick={handleCopy}
              disabled={!response || response === "Processing your request..."}
            >
              <span
                className={`flex items-center justify-center gap-2 -translate-x-2 -translate-y-2 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
                  hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
                ${
                  !response || response === "Processing your request..."
                    ? "cursor-not-allowed"
                    : ""
                }
              `}
              >
                {copied ? <IconCheck size={20} /> : <IconCopy size={20} />}
                {copied ? "Copied!" : "Copy"}
              </span>
            </button>
            
     
            {analysisComplete && (
              <Link
                href={"/chat"}
                className="rounded-md dark:bg-white bg-black mx-4"
              >
                <span
                  className="block -translate-x-2 -translate-y-2 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl text-center hover:-translate-y-3 
                  active:translate-x-0 active:translate-y-0 transition-all"
                >
                  Continue..
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
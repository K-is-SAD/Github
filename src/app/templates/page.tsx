"use client";
import React, { useState, useEffect } from "react";
import Grid from "@/components/grids/Index";
import { Button } from "@/components/ui/button";
import { IconCopy, IconCheck, IconBrandGithub } from "@tabler/icons-react";
import { motion } from "motion/react";
import Link from "next/link";

interface Template {
  _id: string;
  name: string;
  description: string;
  usageCount: number;
  tags: string[];
  isDefault: boolean;
  previewImage?: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Check if data is an array
        if (!Array.isArray(data)) {
          // Fix the TypeScript error by ensuring proper type handling
          console.error("Expected array but received:", typeof data, data);
          setError("Invalid data format received from API");
          setTemplates([]);
        } else {
          setTemplates(data);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Failed to fetch templates:", errorMessage);
        setError("Failed to load templates");
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);

  const handleCopy = (id: string) => {
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Make sure templates is an array before filtering
  const filteredTemplates = templates.filter(template => {
    if (filter === "all") return true;
    if (filter === "default") return template.isDefault;
    if (filter === "popular") return template.usageCount > 5;
    return template.tags.includes(filter);
  });

  // Calculate available tags
  const availableTags = [...new Set(templates.flatMap(t => t.tags))];

  return (
    <div className="relative w-full min-h-screen">
      <div className="absolute inset-0">
        <Grid />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-12 pt-24">
        <div className="flex flex-col items-center justify-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Template Gallery</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl">
            Choose from our curated collection of README templates to generate professional documentation for your projects
          </p>
        </div>
        
        {/* Filter options */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button 
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-md text-sm ${filter === "all" ? 
              "bg-black dark:bg-white text-white dark:text-black" : 
              "bg-gray-100 dark:bg-gray-800"}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter("default")}
            className={`px-3 py-1 rounded-md text-sm ${filter === "default" ? 
              "bg-black dark:bg-white text-white dark:text-black" : 
              "bg-gray-100 dark:bg-gray-800"}`}
          >
            Default
          </button>
          <button 
            onClick={() => setFilter("popular")}
            className={`px-3 py-1 rounded-md text-sm ${filter === "popular" ? 
              "bg-black dark:bg-white text-white dark:text-black" : 
              "bg-gray-100 dark:bg-gray-800"}`}
          >
            Popular
          </button>
          {availableTags.map(tag => (
            <button 
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-3 py-1 rounded-md text-sm ${filter === tag ? 
                "bg-black dark:bg-white text-white dark:text-black" : 
                "bg-gray-100 dark:bg-gray-800"}`}
            >
              {tag}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-xl text-red-500">{error}</p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Please try again later or contact support</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl">No templates found</p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try changing your filter or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                onClick={() => setSelectedTemplate(template._id === selectedTemplate ? null : template._id)}
              >
                {template.previewImage ? (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={template.previewImage} 
                      alt={template.name} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <IconBrandGithub className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold">{template.name}</h3>
                    {template.isDefault && (
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Used {template.usageCount} times
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(template._id);
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {copied === template._id ? <IconCheck size={18} /> : <IconCopy size={18} />}
                      </button>
                      <Link
                        href={`/editor?template=${template._id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button className="rounded-md dark:bg-white bg-black">
                          <span className="block -translate-x-1 -translate-y-1 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-1 text-xs hover:-translate-y-2 active:translate-x-0 active:translate-y-0 transition-all">
                            Use Template
                          </span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                
                {selectedTemplate === template._id && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    className="border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-6">
                      <h4 className="font-medium mb-2">Template Structure</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Introduction &amp; Project Overview
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Features &amp; Installation Guide
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Usage Examples &amp; API Documentation
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          Contributing Guidelines &amp; License
                        </li>
                      </ul>
                      <div className="mt-4">
                        <Link
                          href={`/editor?template=${template._id}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View full template
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
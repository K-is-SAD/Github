"""
Prompt templates for repository analysis using LLMs.
"""

# Base prompt for repository analysis
GEMINI_BASE_PROMPT = (
    "You are analyzing a GitHub repository in parts. "
    "First, understand the repository structure and key files.\n\n"
    "Repository Summary: {repo_summary}\n\n"
    "Repository Files: {repo_tree}\n\n"
)

# Prompt for analyzing individual chunks of repository content
GEMINI_CHUNK_PROMPT = (
    "{base_prompt}"
    "Files Content (Part {chunk_num}/{total_chunks}):\n{chunk}\n\n"
    "Based on this chunk of the repository, identify any important files, functions, "
    "classes, or components you find. Focus on understanding what this code does."
)

# Prompt for integrating the analysis of all chunks
GEMINI_INTEGRATION_PROMPT = (
    "Now that you've analyzed all parts of the repository, provide a consolidated analysis. "
    "Identify the key files, functions, classes, components, frontend, backend, and database files. "
    "Your response must be under 4000 tokens. Format as follows:\n\n"
    "RELEVANT FILES:\n- file1.py\n- file2.js\n\n"
    "KEY CODE ELEMENTS:\n```filename: file1.py\ndef important_function():\n    # code\n```\n\n"
    "Based on your analysis of all chunks, here are your findings:\n\n"
    "{responses}"
)

# Prompt for generating comprehensive summary with Groq
GROQ_SUMMARY_PROMPT = (
    "Based on the following key code elements extracted from a repository, "
    "provide a comprehensive technical analysis with the following structure:\n\n"
    "# Technical Analysis: [Repository Name]\n\n"
    "## 1. Executive Summary\n"
    "< Brief overview of the repository purpose and architecture >\n\n"
    "## 2. File-by-File Analysis\n\n"
    "< For each important file >\n"
    "### `filename.ext`\n"
    "**Purpose**: < What this file does >\n"
    "**Key Components**:\n"
    "- < Component 1 >: Description and purpose\n"
    "- < Component 2 >: Description and purpose\n"
    "**Code Highlights**:\n"
    "```language\n// Notable code with explanation\n```\n"
    "**Integration Points**: < How this file connects with others >\n\n"
    "## 3. System Architecture\n"
    "< Overall system design, patterns, and data flow >\n\n"
    "## 4. Dependencies and External Services\n"
    "< Key libraries, APIs, and services used >\n\n"
    "## 5. Potential Improvements\n"
    "< Suggestions for code quality, performance, security >\n\n"
    "{gemini_output}"
)
import os
import sys
import json
import asyncio
from gitingest import ingest_async
from google import genai
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
TOKEN_LIMIT = 4000
CHUNK_SIZE = 8000  

def split_into_chunks(content, chunk_size):
    """Split content into chunks of specified token size."""
    tokens = content.split()
    chunks = []
    
    for i in range(0, len(tokens), chunk_size):
        chunk = " ".join(tokens[i:i + chunk_size])
        chunks.append(chunk)
    
    return chunks

def truncate_content(content, limit):
    """Reduces content size to fit within the token limit."""
    tokens = content.split()
    if len(tokens) > limit:
        return " ".join(tokens[:limit])
    return content

def analyze_with_gemini(repo_summary, repo_tree, repo_content):
    """Use Gemini to identify relevant files and extract important code within token limit."""
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        content_chunks = split_into_chunks(repo_content, CHUNK_SIZE)
        
        base_prompt = (
            "You are analyzing a GitHub repository in parts. "
            "First, understand the repository structure and key files.\n\n"
            f"Repository Summary: {repo_summary}\n\n"
            f"Repository Files: {repo_tree}\n\n"
        )
        
        responses = []

        for i, chunk in enumerate(content_chunks):
            chunk_prompt = (
                f"{base_prompt}"
                f"Files Content (Part {i+1}/{len(content_chunks)}):\n{chunk}\n\n"
                "Based on this chunk of the repository, identify any important files, functions, "
                "classes, or components you find. Focus on understanding what this code does."
            )
            
            chunk_response = client.models.generate_content(
                model="gemini-2.0-flash", contents=chunk_prompt
            )
            
            responses.append(chunk_response.text)

        integration_prompt = (
            "Now that you've analyzed all parts of the repository, provide a consolidated analysis. "
            "Identify the key files, functions, classes, components, frontend, backend, and database files. "
            "Your response must be under 4000 tokens. Format as follows:\n\n"
            "RELEVANT FILES:\n- file1.py\n- file2.js\n\n"
            "KEY CODE ELEMENTS:\n```filename: file1.py\ndef important_function():\n    # code\n```\n\n"
            f"Based on your analysis of all chunks, here are your findings:\n\n"
            f"{' '.join(responses)}"
        )
        
        final_response = client.models.generate_content(
            model="gemini-2.0-flash", contents=integration_prompt
        )
        
        return final_response.text
    except Exception as e:
        print(f"Error analyzing with Gemini: {e}", file=sys.stderr)
        return None

def generate_with_groq(gemini_output):
    """Use Groq to generate a comprehensive summary based on Gemini's analysis."""
    try:
        client = Groq(api_key=GROQ_API_KEY)
        
        truncated_output = truncate_content(gemini_output, TOKEN_LIMIT)
        
        prompt = (
            "Based on the following key code elements extracted from a repository, "
            "provide a detailed summary of each and every extracted file.\n\n"
            f"{truncated_output}"
        )
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )
        
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Error generating response with Groq: {e}", file=sys.stderr)
        return None

async def run_pipeline(github_url):
    try:
        summary, tree, content = await ingest_async(github_url)
        if not summary or not tree or not content:
            raise ValueError("Failed to fetch repository details.")
        
        gemini_response = analyze_with_gemini(summary, tree, content)
        if not gemini_response:
            raise ValueError("Failed to analyze repository with Gemini.")
        
        groq_summary = generate_with_groq(gemini_response)
        if not groq_summary:
            raise ValueError("Failed to generate summary with Groq.")
        
        result = {
            "repoMarkdown": gemini_response,
            "repoSummary": groq_summary,
            "success": True
        }
        
        return result
    except Exception as e:
        return {
            "error": str(e),
            "success": False
        }

async def main():
    if len(sys.argv) < 2:
        result = {
            "error": "No GitHub URL provided.",
            "success": False
        }
    else:
        github_repo_url = sys.argv[1]
        result = await run_pipeline(github_repo_url)
    
    print(json.dumps(result))

if __name__ == "__main__":
    asyncio.run(main())
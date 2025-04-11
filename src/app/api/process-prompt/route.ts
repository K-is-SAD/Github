import { NextResponse, NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubUrl } = body;
    
    if (!githubUrl || typeof githubUrl !== 'string') {
      return NextResponse.json(
        { error: 'A valid GitHub repository URL is required', success: false },
        { status: 400 }
      );
    }
    
    const scriptPath = path.resolve(process.cwd(), 'src/LLM/agent.py');
    
    // Set encoding options for the child process
    const pythonProcess = spawn('python', [scriptPath, githubUrl], {
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8'  // Ensure Python uses UTF-8 for I/O
      }
    });
    
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      // Handle potential encoding issues
      try {
        output += data.toString('utf-8');
      } catch (e) {
        console.error("Error processing stdout data:", e);
      }
    });
    
    let error = '';
    pythonProcess.stderr.on('data', (data) => {
      try {
        const errorText = data.toString('utf-8');
        error += errorText;
        console.error("Python error:", errorText);
      } catch (e) {
        console.error("Error processing stderr data:", e);
      }
    });
    
    return new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        // If process completed with error or no output
        if (code !== 0 || !output) {
          return resolve(NextResponse.json(
            { error: `Python script failed: ${error || 'No output received'}`, success: false },
            { status: 500 }
          ));
        }
        
        try {
          // Parse the JSON output from the Python script
          const parsedOutput = JSON.parse(output);
          
          // Simply pass through the parsed output as it should already have the
          // correct structure from agent.py: {repoMarkdown, repoSummary, success}
          resolve(NextResponse.json(parsedOutput));
        } catch (parseError) {
          console.error("Error parsing JSON from Python:", parseError);
          console.error("Raw output:", output);
          resolve(NextResponse.json(
            { error: 'Invalid JSON output from Python script', success: false },
            { status: 500 }
          ));
        }
      });
    });
  } catch (error) {
    console.error('Error processing repository analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze GitHub repository', success: false },
      { status: 500 }
    );
  }
}
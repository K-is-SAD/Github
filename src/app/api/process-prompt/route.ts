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
 
    const scriptPath = path.resolve(process.cwd(), 'C:/Users/sayan/OneDrive/Desktop/Github/src/LLM/agent.py');
    const pythonProcess = spawn('python', [scriptPath, githubUrl]);
    
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    let error = '';
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error("Python error:", data.toString());
    });
    
    return new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
  
        
        if (code !== 0 || !output) {
          return resolve(NextResponse.json(
            { error: `Python script failed: ${error || 'No output received'}`, success: false },
            { status: 500 }
          ));
        }
        
        try {
          const parsedOutput = JSON.parse(output);
          resolve(NextResponse.json(parsedOutput));
        } catch (parseError) {
          console.error("Error parsing JSON from Python:", parseError);
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
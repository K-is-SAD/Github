import { NextResponse, NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { githubUrl } = body;

//     if (!githubUrl || typeof githubUrl !== 'string') {
//       return NextResponse.json(
//         { error: 'A valid GitHub repository URL is required', success: false },
//         { status: 400 }
//       );
//     }

//     const scriptPath = path.resolve(process.cwd(), 'src/LLM/agent.py');
//     console.log('Script path:', scriptPath);
    
//     // Use -u flag for unbuffered output
//     const pythonProcess: import('child_process').ChildProcess = spawn('python', ['-u', scriptPath, githubUrl], {
//       // Add shell option for Windows compatibility
//       shell: process.platform === 'win32',
//       // Removed maxBuffer as it is not valid for spawn
//     });
    
//     console.log('Python process started with PID:', pythonProcess.pid);

//     // Buffer to collect JSON from stdout
//     let stdoutBuffer = '';
    
//     const stream = new ReadableStream({
//       start(controller) {
//         pythonProcess.stdout?.on('data', (data) => {
//           const output = data.toString();
//           console.log('Python stdout chunk:', output.substring(0, 50) + '...');
//           stdoutBuffer += output;
//           controller.enqueue(new TextEncoder().encode(output));
//         });

//         pythonProcess.stderr?.on('data', (data) => {
//           const errorMessage = data.toString();
//           // Just log to console but don't send to client
//           console.warn('Python stderr message:', errorMessage);
//           // Don't enqueue stderr output to avoid confusing client
//         });

//         pythonProcess.on('close', (code) => {
//           console.log('Python process closed with code:', code);
//           if (code !== 0) {
//             controller.enqueue(new TextEncoder().encode(`Python script failed with code ${code}.`));
//           } else {
//             // If we have valid JSON in the stdout buffer and the process finished successfully,
//             // we can choose to send only that instead of mixing with stderr messages
//             try {
//               // Attempt to parse the buffer to ensure it's valid JSON
//               JSON.parse(stdoutBuffer);
//               // If we get here, it's valid JSON, so we're good
//             } catch (e) {
//               // If we couldn't parse the JSON, log that but don't interrupt the stream
//               console.error('Failed to parse Python output as JSON:', e);
//             }
//           }
//           controller.close();
//         });

//         pythonProcess.on('error', (error) => {
//           console.error('Failed to start Python process (spawn error):', error);
//           controller.enqueue(new TextEncoder().encode(`Failed to start Python process: ${error.message}`));
//           controller.close();
//         });
//       },
//       cancel() {
//         console.log('Stream canceled by the client.');
//         if (!pythonProcess.killed) {
//           pythonProcess.kill();
//         }
//       },
//     });

//     return new Response(stream, {
//       headers: { 'Content-Type': 'text/plain' },
//     });
//   } catch (error) {
//     console.error('Error processing repository analysis:', error);
//     return NextResponse.json(
//       { error: 'Failed to analyze GitHub repository', success: false },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { githubUrl } = body;

//     if (!githubUrl || typeof githubUrl !== 'string') {
//       return NextResponse.json(
//         { error: 'A valid GitHub repository URL is required', success: false },
//         { status: 400 }
//       );
//     }

//   } catch (error) {
//     console.error('Error processing repository analysis:', error);
//     return NextResponse.json(
//       { error: error , success: false },
//       { status: 500 }
//     );
//   }
// }
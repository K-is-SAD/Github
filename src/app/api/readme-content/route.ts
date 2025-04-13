import { NextRequest, NextResponse } from 'next/server';
import { readmeContentService } from '@/lib/db';

/**
 * POST endpoint to save readme content for a repository
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repositoryId, content, rawContent, templateUsed, sections, isPublished, aiAssisted } = body;
    
    if (!repositoryId || !content || !sections) {
      return NextResponse.json({ 
        error: 'Repository ID, content and sections are required' 
      }, { status: 400 });
    }
    
    const readmeContent = await readmeContentService.saveReadmeContent(
      request,
      repositoryId,
      {
        content,
        rawContent,
        templateUsed,
        sections,
        isPublished,
        aiAssisted
      }
    );
    
    return NextResponse.json({ readmeContent }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in POST /api/readme-content:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { readmeContentService } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET endpoint to retrieve readme content for a repository
 * Query parameter 'history=true' to get all versions
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: repositoryId } = params;
    const searchParams = request.nextUrl.searchParams;
    const history = searchParams.get('history') === 'true';
    
    if (history) {
      // Get all versions of readme content for this repository
      const readmeContentHistory = await readmeContentService.getReadmeContentHistory(request, repositoryId);
      return NextResponse.json({ readmeContentHistory }, { status: 200 });
    }
    
    // Get latest readme content for this repository
    const readmeContent = await readmeContentService.getLatestReadmeContent(request, repositoryId);
    return NextResponse.json({ readmeContent }, { status: 200 });
  }catch (error: unknown) {
    console.error(`Error in POST /api/readme-content/repository/${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } 
}
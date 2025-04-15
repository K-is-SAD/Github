import { NextRequest, NextResponse } from 'next/server';
import { repositoryService } from '@/lib/db';

/**
 * GET endpoint to get user's repositories
 * Optional query parameters: limit, skip
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const search = searchParams.get('search') || '';
    
    // If search parameter is provided, search repositories
    if (search) {
      const repositories = await repositoryService.searchRepositories(request, search, limit, skip);
      return NextResponse.json({ repositories }, { status: 200 });
    }
    
    // Otherwise get all user repositories
    const repositories = await repositoryService.getUserRepositories(request, limit, skip);
    return NextResponse.json({ repositories }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error in GET /api/repositories:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * POST endpoint to save a new repository
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repository } = body;
    
    if (!repository || !repository.fullName || !repository.owner || !repository.name) {
      return NextResponse.json({ error: 'Repository data is required' }, { status: 400 });
    }
    
    await repositoryService.saveRepository(request, repository);
  } catch (error: unknown) {
    console.error('Error in POST /api/repositories:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
  }

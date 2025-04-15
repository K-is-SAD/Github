import { NextRequest, NextResponse } from 'next/server';
import { repositoryService } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET endpoint to retrieve a specific repository by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const repository = await repositoryService.getRepositoryById(request, id);
    return NextResponse.json({ repository }, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error in GET /api/repositories/${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE endpoint to remove a repository
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const result = await repositoryService.deleteRepository(request, id);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error in DELETE /api/repositories/${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
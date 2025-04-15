import { NextRequest, NextResponse } from 'next/server';
import { readmeContentService } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET endpoint to retrieve a specific readme content version
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const readmeContent = await readmeContentService.getReadmeContentVersion(request, id);
    return NextResponse.json({ readmeContent }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

/**
 * DELETE endpoint to remove a specific readme content version
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const result = await readmeContentService.deleteReadmeContent(request, id);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in DELETE /api/readme-content/${params.id}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error(`Error in DELETE /api/readme-content/${params.id}:`, error);
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
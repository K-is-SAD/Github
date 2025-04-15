import { NextRequest, NextResponse } from 'next/server';
import { templateService } from '@/lib/db';

/**
 * GET endpoint to retrieve templates
 * Query parameter: type=all|user|public
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    
    switch (type) {
      case 'public':
        const publicTemplates = await templateService.getPublicTemplates(limit, skip);
        return NextResponse.json({ templates: publicTemplates }, { status: 200 });
        
      case 'user':
        const userTemplates = await templateService.getUserTemplates(request, limit, skip);
        return NextResponse.json({ templates: userTemplates }, { status: 200 });
        
      case 'all':
      default:
        const allTemplates = await templateService.getAllTemplates(request);
        return NextResponse.json({ templates: allTemplates }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error in GET /api/templates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST endpoint to create a new custom template
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, content, sections } = body;
    
    if (!name || !content || !sections) {
      return NextResponse.json({ 
        error: 'Template name, content, and sections are required' 
      }, { status: 400 });
    }
    
    const newTemplate = await templateService.createTemplate(
      request,
      {
        name,
        description,
        content,
        sections
      }
    );
    
    return NextResponse.json({ template: newTemplate }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/templates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
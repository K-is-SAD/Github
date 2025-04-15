import { NextRequest, NextResponse } from 'next/server';
import { templateService } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET endpoint to retrieve a specific template by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const template = await templateService.getTemplateById(request, id);
    
    if (template) {
      // Increment the usage count when template is viewed
      await templateService.incrementTemplateUsage(id);
    }
    
    return NextResponse.json({ template }, { status: 200 });
  } catch (error: any) {
    console.error(`Error in GET /api/templates/${params.id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT endpoint to update a template
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, content, sections } = body;
    
    // Only update the fields that were provided
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (content) updateData.content = content;
    if (sections) updateData.sections = sections;
    
    const updatedTemplate = await templateService.updateTemplate(request, id, updateData);
    return NextResponse.json({ template: updatedTemplate }, { status: 200 });
  } catch (error: any) {
    console.error(`Error in PUT /api/templates/${params.id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE endpoint to remove a template
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const result = await templateService.deleteTemplate(request, id);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error(`Error in DELETE /api/templates/${params.id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
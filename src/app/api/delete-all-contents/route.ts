/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import dbconnect from '@/lib/connectDatabase';
import { deleteAllReadmeContent } from '@/lib/db/readmeContentService';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE endpoint to remove a specific readme content version
 */
export async function DELETE(request: NextRequest, response : NextResponse) {
  await dbconnect();

  try {
    const { repoUrl } = await request.json();
    
    console.log("Received repoUrl : ", repoUrl);

    const {userId} : {userId : string | null | undefined} = await auth();
    
    if (!userId) {
    throw new Error('Not authenticated');
    }
    console.log(userId);

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
        throw new Error('User not found in database');
    }

    const result = await deleteAllReadmeContent(repoUrl, userId);
    if(!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 200 });
    }
    console.log("Deleted content : ", result.data);

    return NextResponse.json({success : true, message : result.message, content : result.data}, { status: 200 });

  } catch (error: any) {
    if (error instanceof Error) {
      console.error(`Error in DELETE /api/readme-content:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error(`Error in DELETE /api/readme-content:`, error);
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
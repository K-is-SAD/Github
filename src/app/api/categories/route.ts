/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import dbconnect from '@/lib/connectDatabase';
import { auth } from '@clerk/nextjs/server';
import RepoSummaryModel from '@/models/reposummary';
import User from '@/models/User';
import { getLatestReadmeContent, getReadmeContentHistory} from '@/lib/db/readmeContentService';

export async function GET(
    request: NextRequest,
  ) {
    await dbconnect();
  
    try {
      const {repoUrl} = await request.json();
  
      // Authenticate user
      const { userId } = await auth();
      if (!userId) throw new Error('Not authenticated');
  
      // Find user in DB
      const user = await User.findOne({ clerkId: userId });
      if (!user) throw new Error('User not found in database');
  
      // Check if repo summary exists for user
      const existingRepoSummary = await RepoSummaryModel.findOne({
        userId: user.clerkId,
        repoUrl,
      });
  
      if (!existingRepoSummary) {
        return NextResponse.json(
          { success: false, message: "Repo summary does not exist in your search history" },
          { status: 200 }
        );
      }
  
      // Fetch readme content history
      const result = await getReadmeContentHistory(repoUrl, userId);
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.message }, { status: 200 });
      }
  
      // Fetch latest readme content
      const latestcontent = await getLatestReadmeContent(repoUrl, userId);
      if (!latestcontent.success) {
        return NextResponse.json({ success: false, message: latestcontent.message }, { status: 200 });
      }
  
      return NextResponse.json(
        { success: true, message: "Latest contents fetched successfully", data: result.data },
        { status: 200 }
      );
  
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
    }
  }
  
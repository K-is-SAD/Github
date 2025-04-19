/* eslint-disable @typescript-eslint/no-explicit-any */
import dbconnect from "@/lib/connectDatabase";
import RepoSummaryModel from "@/models/reposummary";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: Record<string, string | string[]> }> }
) {
  await dbconnect();

  try {
    // Resolve route parameters (required in Next.js 15)
    await params;

    const { userId }: { userId: string | null | undefined } = await auth();
    
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error('User not found in database');
    }
    
    const allrepos = await RepoSummaryModel.find({
      userId: user.clerkId,
    }).select('repoUrl');

    if (!allrepos?.length) {
      return NextResponse.json(
        { success: false, message: "No repos found in search history" },
        { status: 200 }
      );
    }

    const allreposUrls = allrepos.map((repo) => repo.repoUrl);
    
    return NextResponse.json(
      { success: true, data: allreposUrls },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error in GET /api/allrepos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

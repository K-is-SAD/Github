/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import dbconnect from "@/lib/connectDatabase";
import RepoSummaryModel from "@/models/reposummary";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, response : NextResponse) {
  await dbconnect();

  try {
    const {userId} : {userId : string | null | undefined} = await auth();
    
    if (!userId) {
    throw new Error('Not authenticated');
    }
    console.log(userId);

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
        throw new Error('User not found in database');
    }
    
    //checking if the repo summary already exists
    const allrepos = await RepoSummaryModel.find({
        userId : user.clerkId,
    }).select('repoUrl');

    if(!allrepos || allrepos.length === 0) {
        return NextResponse.json({success : false, message : "Repo summary does not exist in your search history"}, {status : 200})
    }

    const allreposUrls = allrepos.map((repo) => repo.repoUrl);
    console.log("All repos : ", allreposUrls);

    return NextResponse.json({success : true, message : "Latest contents fetched successfully", data : allreposUrls}, {status : 200});

  } catch (error: any) {
    console.error('Error in POST /api/readme-content:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success : false, error: errorMessage }, { status: 500 });
  }
}

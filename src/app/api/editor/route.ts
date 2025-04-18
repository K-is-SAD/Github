import { NextRequest, NextResponse } from 'next/server';
import dbconnect from '@/lib/connectDatabase';
import { auth } from '@clerk/nextjs/server';
import User from '@/models/User';
import RepoSummaryModel from '@/models/reposummary';
import { saveReadmeContent } from '@/lib/db/readmeContentService';

export async function POST(request: NextRequest, response : NextResponse) {
    await dbconnect();
    
    try {
        const { repoUrl, content, category } = await request.json();
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

        //checking if the repo summary already exists
        const existingRepoSummary = await RepoSummaryModel.findOne({
            userId : user.clerkId,
            repoUrl : repoUrl
        }).select('-userId')
    
        if(!existingRepoSummary) {
            return NextResponse.json({success : false, message : "Repo summary does not exist in your search history"}, {status : 200})
        }

        const result = await saveReadmeContent(repoUrl, userId, content, category, true); 
        if(!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 200 });
        }
        console.log("Saved content : ", result);
        
        return NextResponse.json({success : true, message : result.message, content : result.data}, { status: 200 });
    
    } catch (error: any) {
        if (error instanceof Error) {
        console.error(`Error in POST /api/editor:`, error);
        return NextResponse.json({ success : false, error: error.message }, { status: 500 });
        }
        console.error(`Error in POST /api/editor:`, error);
        return NextResponse.json({success: false, error: error.message }, { status: 500 });
    }
}
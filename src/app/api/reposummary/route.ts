import dbconnect from "@/lib/connectDatabase";
import { User } from "@/models";
import RepoSummaryModel from "@/models/reposummary";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest, res : NextResponse) {
    await dbconnect();
    const body = await req.json();
    
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

        const existingRepoSummary = await RepoSummaryModel.findOne({
            userId : user.clerkId,
            repoUrl : body.repoUrl
        })
        if(existingRepoSummary) {
            return NextResponse.json({success : false, message : "Repo summary already exists"}, {status : 200})
        }

        const repoSummary = new RepoSummaryModel(body);

        await repoSummary.save();

        return NextResponse.json({success : true, message : "Repo summary saved successfully", repoSummary : repoSummary}, {status : 200});

    } catch (error) {
        console.log("Error occurred in /api/reposummary creation", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success:false, error: errorMessage }, { status: 500 });
    }
}
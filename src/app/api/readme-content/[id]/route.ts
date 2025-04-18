import { NextRequest, NextResponse } from 'next/server';
import { readmeContentService } from '@/lib/db';
import dbconnect from '@/lib/connectDatabase';
import { auth } from '@clerk/nextjs/server';
import { User } from '@/models';
import RepoSummaryModel from '@/models/reposummary';
import { generatePosts } from '@/utils/generateReadme';
import { getCategory } from '@/utils/getCategory';

interface RouteParams {
  params : {
    id : string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams, response : NextResponse) {
  await dbconnect();

  try {
    const { id } = await params; //id -> repoUrl
    const { repoUrl, messages } = await request.json();
    const prompt = messages[messages.length - 1].content;
    console.log("Received prompt for generating readme : ", prompt);
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

    const fullContext = JSON.stringify(existingRepoSummary);

    const content = await generatePosts(fullContext, prompt);
    const category = await getCategory(prompt);

    const result = await readmeContentService.saveReadmeContent(repoUrl,userId, content, category, false); 

    return NextResponse.json(result, { status: 200 });

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
    const { repoUrl, content } = await request.json();

    const {userId} : {userId : string | null | undefined} = await auth();
    
    if (!userId) {
    throw new Error('Not authenticated');
    }
    console.log(userId);

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
        throw new Error('User not found in database');
    }

    const result = await readmeContentService.deleteReadmeContent(repoUrl, userId, content);
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


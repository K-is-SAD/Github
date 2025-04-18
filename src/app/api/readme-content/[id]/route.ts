import { NextRequest, NextResponse } from 'next/server';
import dbconnect from '@/lib/connectDatabase';
import { auth } from '@clerk/nextjs/server';
import RepoSummaryModel from '@/models/reposummary';
import { generateReadme } from '@/utils/generateReadme';
import { getCategory } from '@/utils/getCategory';
import User from '@/models/User';
import { deleteReadmeContent, saveReadmeContent } from '@/lib/db/readmeContentService';
import { generateArticle } from '@/utils/generateArticle';
import { generateTweet } from '@/utils/generateTweet';

interface RouteParams {
  params : {
    id : string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams, response : NextResponse) {
  await dbconnect();

  try {
    const { id } = await params; //id -> repoUrl
    const { repoUrl, message } = await request.json();
    const prompt = message;
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

    let content = "";

    const category = await getCategory(prompt);
    if(category === "Readme"){
      content = await generateReadme(fullContext, prompt);
    }else if(category === "Article"){
      content = await generateArticle(fullContext, prompt);
    }else if(category === "Tweet"){
      content = await generateTweet(fullContext, prompt);
    }else if(category === "LinkedIn"){
      content = await generateTweet(fullContext, prompt);
    }else{
      content = await generateReadme(fullContext, prompt);
    }

    console.log("Category of generation : ", category);

    const result = await saveReadmeContent(repoUrl, userId, content, category, false); 

    return NextResponse.json({content : content}, { status: 200 });

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

    const result = await deleteReadmeContent(repoUrl, userId, content);
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


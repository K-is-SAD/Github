import { NextRequest, NextResponse } from 'next/server';
import dbconnect from '@/lib/connectDatabase';
import { auth } from '@clerk/nextjs/server';
import RepoSummaryModel from '@/models/reposummary';
import { generateReadme } from '@/utils/generateReadme';
import { getCategory } from '@/utils/getCategory';
import User from '@/models/User';
import { getLatestReadmeContent, getReadmeContentHistory, saveReadmeContent } from '@/lib/db/readmeContentService';
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

export async function GET(request: NextRequest, { params }: RouteParams, response : NextResponse) {
  await dbconnect();

  try {
    const { id } = await params; //id -> repoUrl
    const repoUrl = decodeURIComponent(id);
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
    });

    if(!existingRepoSummary) {
        return NextResponse.json({success : false, message : "Repo summary does not exist in your search history"}, {status : 200})
    }
    
    const result = await getReadmeContentHistory(repoUrl, userId);
    if(result.success === false){
      console.log("Error in fetching readme content : ", result.message);
      return NextResponse.json({success : false, message : result.message}, {status : 200});
    }
    console.log("All contents : ", result.data);

    result.data?.forEach((posts : any) => {
      console.log("Category : ", posts._id);
      posts.posts.forEach((post : any) => {
        console.log(post.content)
      });
    })

    const latestcontent = await getLatestReadmeContent(repoUrl, userId);
    if(latestcontent.success === false){
      console.log("Error in fetching latest readme content : ", latestcontent.message);
      return NextResponse.json({success : false, message : latestcontent.message}, {status : 200});
    }
    console.log("Latest content : ", latestcontent.data);

    return NextResponse.json({success : true, message : "Latest contents fetched successfully", data : latestcontent.data}, {status : 200});

  } catch (error: any) {
    console.error('Error in POST /api/readme-content:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success : false, error: errorMessage }, { status: 500 });
  }
}



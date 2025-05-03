/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import dbconnect from '@/lib/connectDatabase';
import { auth } from '@clerk/nextjs/server';
import RepoSummaryModel from '@/models/reposummary';
import User from '@/models/User';
import { generateReadme } from '@/utils/generateReadme';
import { getCategory } from '@/utils/getCategory';
import { getLatestReadmeContent, getReadmeContentHistory, saveReadmeContent } from '@/lib/db/readmeContentService';
import { generateArticle } from '@/utils/generateArticle';
import { generateTweet } from '@/utils/generateTweet';

interface RouteParams {
  id: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  await dbconnect();

  try {
    // Await the params Promise to get route params
    const params = await context.params;
    const id = params.id; // repo id from route (if needed)

    if (Array.isArray(id)) {
      throw new Error('ID must be a single string');
    }
    // const repoUrl = decodeURIComponent(id);

    // Parse JSON body
    const { repoUrl, message } = await request.json();
    const prompt = message;

    console.log(repoUrl);

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
    }).select('-userId');

    if (!existingRepoSummary) {
      return NextResponse.json(
        { success: false, message: "Repo summary does not exist in your search history" },
        { status: 200 }
      );
    }

    const fullContext = JSON.stringify(existingRepoSummary);

    // Determine category of generation
    const category = await getCategory(prompt);

    let content = "";
    switch (category) {
      case "Readme":
        content = await generateReadme(fullContext, prompt);
        break;
      case "Article":
        content = await generateArticle(fullContext, prompt);
        break;
      case "Tweet":
      case "LinkedIn":
        content = await generateTweet(fullContext, prompt);
        break;
      default:
        content = await generateReadme(fullContext, prompt);
    }

    // Save generated content
    await saveReadmeContent(repoUrl, userId, content, category, false);

    return NextResponse.json({ content }, { status: 200 });

  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  await dbconnect();

  try {
    // Await the params Promise to get route params
    const params = await context.params;
    const id = params.id;
    if (Array.isArray(id)) {
      throw new Error('ID must be a single string');
    }
    const repoUrl = decodeURIComponent(id);

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

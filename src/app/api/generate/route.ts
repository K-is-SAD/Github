/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import dbconnect from '@/lib/connectDatabase';
import { deleteReadmeContent } from '@/lib/db/readmeContentService';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import RepoSummaryModel from '@/models/reposummary';
import { generateReadme } from '@/utils/generateReadme';
import { getCategory } from '@/utils/getCategory';
import { saveReadmeContent } from '@/lib/db/readmeContentService';
import { generateArticle } from '@/utils/generateArticle';
import { generateTweet } from '@/utils/generateTweet';
import { generateLinkedin } from '@/utils/generateLinkedin';
import { generatePitch } from '@/utils/generatePitch';
import { generatePPTContent } from '@/utils/generatePPTContent';
interface RouteParams {
  id: string;
}

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
) {
  await dbconnect();

  try {
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
        content = await generateTweet(fullContext, prompt);
        break;
      case "LinkedIn":
        content = await generateLinkedin(fullContext, prompt);
        break;
        case "Pitch":
        content = await generatePitch(fullContext, prompt);
        break;
      case "ppt":
        content = await generatePPTContent(fullContext, prompt);
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

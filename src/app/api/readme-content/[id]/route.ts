import { NextRequest, NextResponse } from 'next/server';
import { readmeContentService } from '@/lib/db';
import dbconnect from '@/lib/connectDatabase';
import { auth } from '@clerk/nextjs/server';
import { User } from '@/models';
import RepoSummaryModel from '@/models/reposummary';
import { generateReadme } from '@/utils/generateReadme';
import { streamText } from 'ai';
// import { groq } from '@ai-sdk/groq';
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

    // const result = streamText({
    //   model: groq('llama-3.3-70b-versatile'),
    //   messages : [
    //       {
    //       role : 'system',
    //       content : `You are an efficient LLM that can answer questions about the codebase. You are also a helpful assistant that can help with any other questions regarding codes and codebases or related to codebases. You have to generate a Readme or provide a linkedIn post content for the repository provided by the user. The readme must be in markdown format, the readme must be of the format of an actual readme. The linkedIn post must also be genuine like an actual LinkedIn post. Dont provide unnecessary information.`,
    //       },
    //       {
    //       role: "user",
    //       content: `Generate a readme or a linkedIn post for the repo based on the context provided and the user prompt. You are given a prompt and the full context to the repository summary."
    //       Context :${fullContext}, Question : ${prompt}`,
    //       },
    //   ],
    // });

    // console.log("Result : ", result.toDataStreamResponse())

    // return result.toDataStreamResponse({
    // getErrorMessage: error => {
    //     if (error == null) {
    //     return 'unknown error';
    //     }

    //     if (typeof error === 'string') {
    //     return error;
    //     }

    //     if (error instanceof Error) {
    //     return error.message;
    //     }

    //     return JSON.stringify(error);
    // }
    // });

    const getRreadmeStream = async()=>{
      return groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages : [
          {
          role : 'system',
          content : `You are an efficient LLM that can answer questions about the codebase. You are also a helpful assistant that can help with any other questions regarding codes and codebases or related to codebases. You have to generate a Readme or provide a linkedIn post content for the repository provided by the user. The readme must be in markdown format, the readme must be of the format of an actual readme. The linkedIn post must also be genuine like an actual LinkedIn post. Dont provide unnecessary information.`,
          },
          {
          role: "user",
          content: `Generate a readme or a linkedIn post for the repo based on the context provided and the user prompt. You are given a prompt and the full context to the repository summary."
          Context :${fullContext}, Question : ${prompt}`,
          },
      ],
      stream : true
      });
    }
    
    const readmeStream = await getRreadmeStream();
    console.log("Readme stream : ", readmeStream)

    for await (const chunk of readmeStream){
      console.log()
      return new NextResponse(chunk.choices[0]?.delta?.content || "")
    }

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
    const { id } = params;
    const result = await readmeContentService.deleteReadmeContent(request, id);
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


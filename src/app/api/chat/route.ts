/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import dbconnect from '@/lib/connectDatabase';
import { getQueryResults } from '@/lib/db/vectorSearch';
import { initialiseVectorIndex } from '@/lib/dbutils/vector-index';
import User from "@/models/User";
import RepoSummaryModel from '@/models/reposummary';
import { getKeywords } from '@/utils/findkeywords';
import { groq } from '@ai-sdk/groq';
import { auth } from '@clerk/nextjs/server';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest, res: NextResponse) {
  await dbconnect();

  try {
    const { messages, repoUrl } = await req.json();
    console.log(messages[messages.length-1].content);

    const keywords = await getKeywords(messages[messages.length-1].content);
    console.log(keywords);

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
    })
    if(!existingRepoSummary) {
        return NextResponse.json({success : false, message : "Repo summary does not exist in your search history"}, {status : 200})
    }
    
    //activating the vector index
    await initialiseVectorIndex();
    
    //getting the query results from the vector search index
    const documents = await getQueryResults(user.clerkId, repoUrl, keywords);
    console.log(documents);

    console.log(`Search results for "${keywords}":`);
    if(!documents || documents.length === 0) {
        console.log("No documents found for the query");
    }
    documents?.forEach((doc) => {
        console.log(doc);
    });

    let context = "";
    documents?.forEach(doc => {
        context += doc.pageContent;
    });

    const fullContext = JSON.stringify(existingRepoSummary);

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages : [
        {
          role : 'system',
          content : `You are an efficient LLM that can answer questions about the codebase. You are also a helpful assistant that can help with any other questions regarding codes and codebases or related to codebases. You will be given a question, a context (specialised based on the vector search) and the full context in the prompt. You need to answer the question based on the context. If the user's question does not match that much with the context, you may use your own knowledge to answer the question. You may be also asked a question based on the previous context or previous question, so be careful about that. You are not allowed to use the context to answer the question if the question does not match that much with the context. But give a good impactful response. At the end of the response, you need to say "I am here to help you with anything else."`,
        },
        {
          role: "user",
          content: `You are given a question and a context. You need to answer the question based on the context. If the user's question does not match that much with the context, you may use your own knowledge to answer the question. You are not allowed to use the context to answer the question if the question does not match that much with the context. But give a good impactful response. At the end of the response, you need to say "I am here to help you with anything else." 
          Context : ${context}, Full Context : ${fullContext}, Question : ${messages[messages.length-1].content}`,
        },
      ]
    });

    console.log("Result : ", result);

    return result.toDataStreamResponse({
      getErrorMessage: error => {
        if (error == null) {
          return 'unknown error';
        }

        if (typeof error === 'string') {
          return error;
        }

        if (error instanceof Error) {
          return error.message;
        }

        return JSON.stringify(error);
      }
    });

  } catch (error : any) {
    console.error('Error in POST request to /api/chat:', error);
    return NextResponse.json({success: false, message : error.message}, { status: 500 });
  }

}

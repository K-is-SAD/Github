/* eslint-disable @typescript-eslint/no-unused-vars */
import dbconnect from "@/lib/connectDatabase";
import User from "@/models/User";
import RepoSummaryModel from "@/models/reposummary";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { generateEmbeddings } from "@/lib/db/generateEmbeddings";
import { initialiseVectorIndex } from "@/lib/dbutils/vector-index";
import { getQueryResults } from "@/lib/db/vectorSearch";
import RepoEmbeddingModel from "@/models/repoEmbeddings";

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

        //checking if the repo summary already exists
        const existingRepoSummary = await RepoSummaryModel.findOne({
            userId : user.clerkId,
            repoUrl : body.repoUrl
        })
        if(existingRepoSummary) {
            return NextResponse.json({success : false, message : "Repo summary already exists"}, {status : 200})
        }

        //checking if the repo summary embeddings already exists
        const existingRepoEmbedding = await RepoEmbeddingModel.findOne({
            repoUrl : body.repoUrl,
            userId : user.clerkId
        })
        if(existingRepoEmbedding){
            return NextResponse.json({success : false, message : "Repo summary embeddings already exists"}, {status : 200})
        }

        const repoSummary = new RepoSummaryModel(body);

        await repoSummary.save();

        //generating embeddings for the repo summary
        const result = await generateEmbeddings(repoSummary.userId, repoSummary.repoUrl, JSON.stringify(body));

        if(!result) {
            console.log("Error occurred while generating embeddings", result);
            return NextResponse.json({success : false, message : "Error occurred while generating embeddings"}, {status : 500})
        }

        console.log("Embeddings generated successfully");

        //initialising the vector search index
        await initialiseVectorIndex();

        //sample query(will be changed later)
        const query = "Calculator addition function"; 

        //getting the query results from the vector search index
        const documents = await getQueryResults(repoSummary.userId, repoSummary.repoUrl, query);

        console.log(`Search results for "${query}":`);
        if(!documents || documents.length === 0) {
            console.log("No documents found for the query");
        }
        documents?.forEach((doc) => {
            console.log(doc);
        }); 

        return NextResponse.json({success : true, message : "Repo summary saved successfully", repoSummary : repoSummary}, {status : 200});

    } catch (error) {
        console.log("Error occurred in /api/reposummary creation", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success:false, error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(req : NextRequest, res : NextResponse){
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

        //checking if the repo summary exists
        const existingRepoSummary = await RepoSummaryModel.findOne({
            userId : user.clerkId,
            repoUrl : body.repoUrl
        })
        if(!existingRepoSummary) {
            return NextResponse.json({success : false, message : "Repo summary does not exists"}, {status : 200})
        }

        //deleting the reposummary 
        const deletedRepoSummary = await RepoSummaryModel.findOneAndDelete({
            userId : user.clerkId,
            repoUrl : body.repoUrl
        })
        console.log("Repo Summary deleted successfully : ", deletedRepoSummary)

        return NextResponse.json({success : true, message : "Repo summary deleted successfully", deletedRepoSummary : deletedRepoSummary}, {status : 200});

    } catch (error) {
        console.log("Error occurred in /api/reposummary deletion", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success:false, error: errorMessage }, { status: 500 });
    }
}
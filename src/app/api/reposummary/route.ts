import dbconnect from "@/lib/connectDatabase";
import User from "@/models/User";
import RepoSummaryModel from "@/models/reposummary";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from 'next/server';
import { generateEmbeddings } from "@/lib/db/generateEmbeddings";
import { initialiseVectorIndex } from "@/lib/dbutils/vector-index";
import { getQueryResults } from "@/lib/db/vectorSearch";
import RepoEmbeddingModel from "@/models/repoEmbeddings";

type RepoSummaryBody = Record<string, unknown>;

const normalizeRepoSummaryBody = (body: RepoSummaryBody) => {
  const repoUrlValue = body.repoUrl;
  const filesValue = body.files;
  const techStacksValue = body.techStacks;
  const projectIdeaValue = body.projectIdea;
  const projectSummaryValue = body.projectSummary;
  const keyFeaturesValue = body.keyFeatures;
  const potentialIssuesValue = body.potentialIssues;
  const feasibilityValue = body.feasibility;

  const repoUrl = typeof repoUrlValue === "string" && repoUrlValue.trim()
    ? repoUrlValue.trim()
    : "";

  const files = Array.isArray(filesValue) ? filesValue : [];
  const techStacks = techStacksValue && typeof techStacksValue === "object" && !Array.isArray(techStacksValue)
    ? techStacksValue
    : {};

  const projectIdea = typeof projectIdeaValue === "string" && projectIdeaValue.trim()
    ? projectIdeaValue.trim()
    : typeof projectSummaryValue === "string" && projectSummaryValue.trim()
      ? projectSummaryValue.trim().slice(0, 200)
      : "Generated repository summary";

  const projectSummary = typeof projectSummaryValue === "string" && projectSummaryValue.trim()
    ? projectSummaryValue.trim()
    : typeof projectIdeaValue === "string" && projectIdeaValue.trim()
      ? projectIdeaValue.trim()
      : "Generated repository summary";

  const keyFeatures = Array.isArray(keyFeaturesValue) && keyFeaturesValue.length > 0
    ? keyFeaturesValue.filter((feature: unknown) => typeof feature === "string" && feature.trim())
    : ["Repository summary generated from available analysis output"];

  const potentialIssues = Array.isArray(potentialIssuesValue) && potentialIssuesValue.length > 0
    ? potentialIssuesValue.filter((issue: unknown) => typeof issue === "string" && issue.trim())
    : ["No structured issues were provided by the analysis"];

  const feasibility = typeof feasibilityValue === "string" && feasibilityValue.trim()
    ? feasibilityValue.trim()
    : "Unknown";

  return {
    ...body,
    repoUrl,
    files,
    techStacks,
    projectIdea,
    projectSummary,
    keyFeatures,
    potentialIssues,
    feasibility,
  };
};

export async function POST(
  request: NextRequest,
) {
    try {
        await dbconnect();

        const body = normalizeRepoSummaryBody(await request.json());

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
            return NextResponse.json({success : true, message : "Repo summary saved successfully", repoSummary : JSON.stringify(existingRepoSummary)}, {status : 200})
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

        return NextResponse.json({success : true, message : "Repo summary saved successfully", repoSummary : JSON.stringify(body)}, {status : 200});

    } catch (error) {
        console.log("Error occurred in /api/reposummary creation", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success:false, error: errorMessage }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest) {
    try {
  await dbconnect();

  const body = await request.json();

      const { userId } : { userId: string | null | undefined } = await auth();
  
      if (!userId) {
        throw new Error('Not authenticated');
      }
      console.log(userId);
  
      const user = await User.findOne({ clerkId: userId });
      if (!user) {
        throw new Error('User not found in database');
      }
  
      // Check if repo summary exists
      const existingRepoSummary = await RepoSummaryModel.findOne({
        userId: user.clerkId,
        repoUrl: body.repoUrl,
      });
  
      if (!existingRepoSummary) {
        return NextResponse.json(
          { success: false, message: "Repo summary does not exist" },
          { status: 200 }
        );
      }
  
      // Delete the repo summary
      const deletedRepoSummary = await RepoSummaryModel.findOneAndDelete({
        userId: user.clerkId,
        repoUrl: body.repoUrl,
      });
  
      console.log("Repo Summary deleted successfully:", deletedRepoSummary);
  
      return NextResponse.json(
        { success: true, message: "Repo summary deleted successfully", deletedRepoSummary },
        { status: 200 }
      );
  
    } catch (error) {
      console.log("Error occurred in /api/reposummary deletion", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
  }
  
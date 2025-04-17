import mongoose, {Schema, Document} from 'mongoose';
import RepoEmbeddingModel from './repoEmbeddings';

export interface IRepoFile{
    file_name : string,
    content : string,
    summary : string
}

interface ITechStackData {
    [key: string]: string[]
}

export interface RepoSummary extends Document{
    userId : string,  //references to the user who searched for the repo summary (clerkId is stored here)
    repoUrl : string,
    files : IRepoFile[],
    projectIdea : string,
    projectSummary : string,
    techStacks : ITechStackData,
    keyFeatures : string[],
    potentialIssues : string[],
    feasibility : string,
}

const RepoSummarySchema : Schema<RepoSummary> = new Schema({
    userId : {type : String, required : true}, //references to the user who searched for the repo summary
    repoUrl : {type : String, required : true},
    files : [
        {
            file_name : {type : String, required : true},
            content : {type : String, required : true},
            summary : {type : String, required : true}
        }
    ],
    projectIdea : {type : String, required : true},
    projectSummary : {type : String, required : true},
    techStacks : {type : Object, required : true},
    keyFeatures : [{type : String , required : true}],
    potentialIssues : [{type : String, required : true}],
    feasibility : {type : String, required : true},
},  {
    timestamps : true
})

RepoSummarySchema.post('findOneAndDelete', async(result, next)=>{
    console.log("RepoSummary deleted successfully", result);

    // const existingRepoEmbedding = await RepoEmbeddingModel.findOne({
    //     repoUrl : result.repoUrl,
    //     userId : result.userId
    // })
    // if(existingRepoEmbedding){
    //     const deletedRepoEmbedding = await RepoEmbeddingModel.findOneAndDelete({
    //         repoUrl : result.repoUrl,  
    //         userId : result.userId
    //     })
    //     console.log("RepoEmbedding deleted successfully", deletedRepoEmbedding);
    // }

    next();
})

const RepoSummaryModel = mongoose.models.RepoSummaryModel as mongoose.Model<RepoSummary> || mongoose.model<RepoSummary>('RepoSummaryModel', RepoSummarySchema);

export default RepoSummaryModel;
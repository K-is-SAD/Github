import mongoose, {Schema, Document} from 'mongoose';

export interface RepoEmbedding extends Document{
    userId : string,  //references to the user who searched for the repo summary (clerkId is stored here)
    repoUrl : string,
    pageContent : string,
    embeddings : number[]
}

const RepoEmbeddingSchema : Schema<RepoEmbedding> = new Schema({
    userId : {type : String, required : true}, //references to the user who searched for the repo summary
    repoUrl : {type : String, required : true},
    pageContent : {type : String},
    embeddings : {type : [Number]}
},  {
    timestamps : true
})

RepoEmbeddingSchema.post('deleteMany', async(result, next)=>{
    console.log("RepoEmbedding deleted successfully", result);
    next();
});

const RepoEmbeddingModel = mongoose.models.RepoSummaryModel as mongoose.Model<RepoEmbedding> || mongoose.model<RepoEmbedding>('RepoEmbeddingModel', RepoEmbeddingSchema);

export default RepoEmbeddingModel;
import mongoose, { Schema, Document } from 'mongoose';

interface Post{
  content : string,
  category : string,
  edited : boolean
  createdAt : Date
}

export interface IReadmeContent extends Document {
  repoUrl : string,
  userId : string,
  posts : Post[]
}

const ReadmeContentSchema: Schema<IReadmeContent> = new Schema({
  repoUrl : {type : String, required : true},
  userId : {type : String, required : true},
  posts : [{
    content : {type : String, required : true},
    category : {type : String, required : true},
    edited : {type : Boolean, required : true, default : false},
    createdAt : {type : Date, default : Date.now},
  }]
}, {
  timestamps: true
});

ReadmeContentSchema.post('deleteMany', async(result, next)=>{
    console.log("RepoEmbedding deleted successfully", result);
    next();
});

const ReadmeContent = mongoose.models.ReadmeContent as mongoose.Model<IReadmeContent> || mongoose.model<IReadmeContent>('ReadmeContent', ReadmeContentSchema);

export default ReadmeContent;
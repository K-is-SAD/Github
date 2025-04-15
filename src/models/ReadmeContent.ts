import mongoose, { Schema, Document } from 'mongoose';

export interface IReadmeContent extends Document {
  repositoryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  rawContent?: string;
  version: number;
  isPublished: boolean;
  templateUsed?: string;
  sections: {
    title: string;
    content: string;
    order: number;
  }[];
  metadata: {
    generatedAt: Date;
    aiAssisted: boolean;
    wordCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReadmeContentSchema: Schema = new Schema({
  repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  rawContent: { type: String },
  version: { type: Number, default: 1 },
  isPublished: { type: Boolean, default: false },
  templateUsed: { type: String },
  sections: [{
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, required: true }
  }],
  metadata: {
    generatedAt: { type: Date, default: Date.now },
    aiAssisted: { type: Boolean, default: false },
    wordCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
ReadmeContentSchema.index({ repositoryId: 1, version: 1 });
ReadmeContentSchema.index({ userId: 1 });

export default mongoose.models.ReadmeContent || mongoose.model<IReadmeContent>('ReadmeContent', ReadmeContentSchema);
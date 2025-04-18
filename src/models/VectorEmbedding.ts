import mongoose, { Schema, Document } from 'mongoose';
// Type definition for the MongoDB model
export interface IVectorEmbedding extends Document {
  objectId: mongoose.Types.ObjectId;
  objectType: 'repository' | 'readme' | 'section';
  content: string;
  embedding: number[];
  metadata: {
    source: string;
    dimension: number;
    model: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const VectorEmbeddingSchema: Schema = new Schema({
  objectId: { type: mongoose.Schema.Types.ObjectId, refPath: 'objectType', required: true },
  objectType: { 
    type: String, 
    required: true,
    enum: ['Repository', 'ReadmeContent']
  },
  content: { type: String, required: true },
  embedding: [{ type: Number, required: true }],
  metadata: {
    source: { type: String, default: 'text' },
    dimension: { type: Number, default: 1536 },
    model: { type: String, default: 'text-embedding' }
  }
}, {
  timestamps: true
});

// Create indexes for faster vector search
VectorEmbeddingSchema.index({ objectId: 1, objectType: 1 }, { unique: true });
// Note: For production, you would use a vector database or MongoDB Atlas's
// vector search capabilities instead of this basic schema

export default mongoose.models.VectorEmbedding || 
  mongoose.model<IVectorEmbedding>('VectorEmbedding', VectorEmbeddingSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface IRepository extends Document {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description?: string;
  stars: number;
  forks: number;
  language?: string;
  topics: string[];
  lastUpdated: Date;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RepositorySchema: Schema = new Schema({
  owner: { type: String, required: true },
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  language: { type: String },
  topics: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Create compound indexes for faster queries
RepositorySchema.index({ fullName: 1 }, { unique: true });
RepositorySchema.index({ userId: 1, owner: 1, name: 1 });

export default mongoose.models.Repository || mongoose.model<IRepository>('Repository', RepositorySchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name?: string;
  avatar?: string;
  githubUsername?: string;
  preferences: {
    defaultTemplate?: string;
    darkMode: boolean;
    useAI: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  avatar: { type: String },
  githubUsername: { type: String },
  preferences: {
    defaultTemplate: { type: String, default: 'standard' },
    darkMode: { type: Boolean, default: false },
    useAI: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Create a compound index for faster queries
UserSchema.index({ clerkId: 1, email: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  description: string;
  structure: {
    sectionName: string;
    sectionDescription: string;
    order: number;
    isRequired: boolean;
    defaultContent?: string;
  }[];
  previewImage?: string;
  isDefault: boolean;
  isPublic: boolean;
  createdBy?: mongoose.Types.ObjectId;
  usageCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  structure: [{
    sectionName: { type: String, required: true },
    sectionDescription: { type: String, required: true },
    order: { type: Number, required: true },
    isRequired: { type: Boolean, default: false },
    defaultContent: { type: String }
  }],
  previewImage: { type: String },
  isDefault: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usageCount: { type: Number, default: 0 },
  tags: [{ type: String }]
}, {
  timestamps: true
});

// Create indexes for faster queries
TemplateSchema.index({ name: 1 }, { unique: true });
TemplateSchema.index({ isPublic: 1, isDefault: 1 });
TemplateSchema.index({ tags: 1 });

export default mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);
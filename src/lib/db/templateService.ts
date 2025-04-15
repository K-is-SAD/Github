import dbconnect from '../connectDatabase';
import { Template, User } from '@/models';
import mongoose from 'mongoose';
import { getAuth } from '@clerk/nextjs/server';
import { NextApiRequest } from 'next';

/**
 * Gets all public and default templates
 */
export async function getPublicTemplates(limit = 20, skip = 0) {
  await dbconnect();
  
  return Template.find({
    isPublic: true
  })
    .sort({ usageCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

/**
 * Gets all templates created by the current user
 */
export async function getUserTemplates(req: Request, limit = 20, skip = 0) {
  await dbconnect();
  
  // Get current user
  const { userId } = getAuth(req as unknown as NextApiRequest);
  if (!userId) {
    throw new Error('Not authenticated');
  }
  
  // Find the user document
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error('User not found in database');
  }
  
  // Get templates created by this user
  return Template.find({
    createdBy: user._id
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

/**
 * Gets all available templates
 * Includes both system templates and user's custom templates
 */
export async function getAllTemplates(req: Request) {
  await dbconnect();
  
  // Get current user
  const { userId } = getAuth(req as unknown as NextApiRequest);
  if (!userId) {
    throw new Error('Not authenticated');
  }
  
  // Find the user document
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error('User not found in database');
  }
  
  // Get all templates that are either system templates or belong to this user
  return Template.find({
    $or: [
      { isSystemTemplate: true },
      { userId: user._id }
    ]
  }).sort({ name: 1 });
}

/**
 * Gets a template by ID
 */
export async function getTemplateById(req: Request, templateId: string) {
  await dbconnect();
  
  // Get current user
  const { userId } = getAuth(req as unknown as NextApiRequest);
  if (!userId) {
    throw new Error('Not authenticated');
  }
  
  // Find the user document
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error('User not found in database');
  }
  
  if (!mongoose.Types.ObjectId.isValid(templateId)) {
    throw new Error('Invalid template ID');
  }
  
  // Get template with permissions check (only system templates or user's own templates)
  const template = await Template.findOne({
    _id: templateId,
    $or: [
      { isSystemTemplate: true },
      { userId: user._id }
    ]
  });
  
  if (!template) {
    throw new Error('Template not found or access denied');
  }
  
  return template;
}

/**
 * Creates a new custom template
 */
export async function createTemplate(
  req: Request,
  templateData: {
    name: string;
    description?: string;
    content: string;
    sections: {
      title: string;
      description?: string;
      placeholder?: string;
      order: number;
    }[];
  }
) {
  await dbconnect();
  
  // Get current user
  const { userId } = getAuth(req as unknown as NextApiRequest);
  if (!userId) {
    throw new Error('Not authenticated');
  }
  
  // Find the user document
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error('User not found in database');
  }
  
  // Check if template with same name already exists for this user
  const existingTemplate = await Template.findOne({
    name: templateData.name,
    userId: user._id
  });
  
  if (existingTemplate) {
    throw new Error(`Template with name '${templateData.name}' already exists`);
  }
  
  // Create the new template
  const newTemplate = new Template({
    ...templateData,
    userId: user._id,
    isSystemTemplate: false
  });
  
  return newTemplate.save();
}

/**
 * Updates an existing custom template
 */
export async function updateTemplate(
  req: Request,
  templateId: string,
  templateData: {
    name?: string;
    description?: string;
    content?: string;
    sections?: {
      title: string;
      description?: string;
      placeholder?: string;
      order: number;
    }[];
  }
) {
  await dbconnect();
  
  // Get current user
  const { userId } = getAuth(req as unknown as NextApiRequest);
  if (!userId) {
    throw new Error('Not authenticated');
  }
  
  // Find the user document
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error('User not found in database');
  }
  
  if (!mongoose.Types.ObjectId.isValid(templateId)) {
    throw new Error('Invalid template ID');
  }
  
  // Get template with permissions check
  const template = await Template.findOne({
    _id: templateId,
    userId: user._id
  });
  
  if (!template) {
    throw new Error('Template not found or access denied');
  }
  
  // Cannot update system templates
  if (template.isSystemTemplate) {
    throw new Error('Cannot update system templates');
  }
  
  // If changing the name, check for duplicate names
  if (templateData.name && templateData.name !== template.name) {
    const existingTemplate = await Template.findOne({
      name: templateData.name,
      userId: user._id,
      _id: { $ne: templateId }
    });
    
    if (existingTemplate) {
      throw new Error(`Template with name '${templateData.name}' already exists`);
    }
  }
  
  // Update the template
  return Template.findByIdAndUpdate(
    templateId,
    { $set: templateData },
    { new: true }
  );
}

/**
 * Deletes a custom template
 */
export async function deleteTemplate(req: Request, templateId: string) {
  await dbconnect();
  
  // Get current user
  const { userId } = getAuth(req as unknown as NextApiRequest);
  if (!userId) {
    throw new Error('Not authenticated');
  }
  
  // Find the user document
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error('User not found in database');
  }
  
  if (!mongoose.Types.ObjectId.isValid(templateId)) {
    throw new Error('Invalid template ID');
  }
  
  // Get template with permissions check
  const template = await Template.findOne({
    _id: templateId,
    userId: user._id
  });
  
  if (!template) {
    throw new Error('Template not found or access denied');
  }
  
  // Cannot delete system templates
  if (template.isSystemTemplate) {
    throw new Error('Cannot delete system templates');
  }
  
  // Delete the template
  const result = await Template.deleteOne({
    _id: templateId,
    userId: user._id
  });
  
  if (result.deletedCount === 0) {
    throw new Error('Template not found or access denied');
  }
  
  return { success: true, message: 'Template deleted successfully' };
}

/**
 * Increment usage count for a template
 */
export async function incrementTemplateUsage(templateId: string) {
  await dbconnect();
  
  if (!mongoose.Types.ObjectId.isValid(templateId)) {
    throw new Error('Invalid template ID');
  }
  
  return Template.findByIdAndUpdate(
    templateId,
    { $inc: { usageCount: 1 } },
    { new: true }
  );
}
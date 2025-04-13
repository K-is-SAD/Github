import dbconnect from '../connectDatabase';
import { ReadmeContent, Repository, User } from '@/models';
import mongoose from 'mongoose';
import { getAuth } from '@clerk/nextjs/server';
import { NextApiRequest } from 'next';

//Creates or updates readme content for a repository

export async function saveReadmeContent(
  req: Request,
  repositoryId: string,
  contentData: {
    content: string;
    rawContent?: string;
    templateUsed?: string;
    sections: {
      title: string;
      content: string;
      order: number;
    }[];
    isPublished?: boolean;
    aiAssisted?: boolean;
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
  
  // Verify repository exists and belongs to user
  if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
    throw new Error('Invalid repository ID');
  }
  
  const repository = await Repository.findOne({
    _id: repositoryId,
    userId: user._id
  });
  
  if (!repository) {
    throw new Error('Repository not found or access denied');
  }
  
  // Check if readme content already exists for this repository
  const existingContent = await ReadmeContent.findOne({
    repositoryId: repository._id,
    userId: user._id,
    isPublished: true
  }).sort({ version: -1 });
  
  // Calculate word count for metadata
  const wordCount = contentData.content.trim().split(/\s+/).length;
  
  if (existingContent) {
    // Create new version of readme content
    const newVersion = new ReadmeContent({
      repositoryId: repository._id,
      userId: user._id,
      content: contentData.content,
      rawContent: contentData.rawContent,
      version: existingContent.version + 1,
      isPublished: contentData.isPublished ?? true,
      templateUsed: contentData.templateUsed,
      sections: contentData.sections,
      metadata: {
        generatedAt: new Date(),
        aiAssisted: contentData.aiAssisted ?? false,
        wordCount
      }
    });
    
    return newVersion.save();
  }
  
  // Create first version of readme content
  const newContent = new ReadmeContent({
    repositoryId: repository._id,
    userId: user._id,
    content: contentData.content,
    rawContent: contentData.rawContent,
    version: 1,
    isPublished: contentData.isPublished ?? true,
    templateUsed: contentData.templateUsed,
    sections: contentData.sections,
    metadata: {
      generatedAt: new Date(),
      aiAssisted: contentData.aiAssisted ?? false,
      wordCount
    }
  });
  
  return newContent.save();
}

/**
 * Gets the latest readme content for a repository
 */
export async function getLatestReadmeContent(req: Request, repositoryId: string) {
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
  
  // Verify repository exists and belongs to user
  if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
    throw new Error('Invalid repository ID');
  }
  
  const repository = await Repository.findOne({
    _id: repositoryId,
    userId: user._id
  });
  
  if (!repository) {
    throw new Error('Repository not found or access denied');
  }
  
  // Get latest readme content
  return ReadmeContent.findOne({
    repositoryId: repository._id,
    userId: user._id
  }).sort({ version: -1 });
}

/**
 * Gets all readme content versions for a repository
 */
export async function getReadmeContentHistory(req: Request, repositoryId: string) {
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
  
  // Verify repository exists and belongs to user
  if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
    throw new Error('Invalid repository ID');
  }
  
  const repository = await Repository.findOne({
    _id: repositoryId,
    userId: user._id
  });
  
  if (!repository) {
    throw new Error('Repository not found or access denied');
  }
  
  // Get all readme content versions
  return ReadmeContent.find({
    repositoryId: repository._id,
    userId: user._id
  }).sort({ version: -1 });
}

/**
 * Gets a specific readme content version
 */
export async function getReadmeContentVersion(req: Request, readmeContentId: string) {
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
  
  // Verify readme content exists and belongs to user
  if (!mongoose.Types.ObjectId.isValid(readmeContentId)) {
    throw new Error('Invalid readme content ID');
  }
  
  const readmeContent = await ReadmeContent.findOne({
    _id: readmeContentId,
    userId: user._id
  });
  
  if (!readmeContent) {
    throw new Error('Readme content not found or access denied');
  }
  
  return readmeContent;
}

/**
 * Deletes a specific readme content version
 */
export async function deleteReadmeContent(req: Request, readmeContentId: string) {
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
  
  // Verify readme content exists and belongs to user
  if (!mongoose.Types.ObjectId.isValid(readmeContentId)) {
    throw new Error('Invalid readme content ID');
  }
  
  // Delete readme content with permissions check
  const result = await ReadmeContent.deleteOne({
    _id: readmeContentId,
    userId: user._id
  });
  
  if (result.deletedCount === 0) {
    throw new Error('Readme content not found or access denied');
  }
  
  return { success: true, message: 'Readme content deleted successfully' };
}
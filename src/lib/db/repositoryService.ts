import dbconnect from '../connectDatabase';
import { Repository, User } from '@/models';
import mongoose from 'mongoose';
import { getAuth } from '@clerk/nextjs/server';
import { NextApiRequest } from 'next';

//Saves a GitHub repository to the database
export async function saveRepository(
  req: Request,
  repositoryData: {
    owner: string;
    name: string;
    fullName: string;
    url: string;
    description?: string;
    stars?: number;
    forks?: number;
    language?: string;
    topics?: string[];
    lastUpdated?: Date;
  }
) {
  await dbconnect();
  
  // Get current user
  const { userId } = getAuth(req as unknown as NextApiRequest);
  if (!userId) {
    throw new Error('Not authenticated');
  }
  
  // Find the user document to link the repository
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error('User not found in database');
  }
  
  // Check if repository already exists for this user
  const existingRepo = await Repository.findOne({
    fullName: repositoryData.fullName,
    userId: user._id
  });
  
  if (existingRepo) {
    // Update existing repository
    return Repository.findByIdAndUpdate(
      existingRepo._id,
      {
        ...repositoryData,
        lastUpdated: repositoryData.lastUpdated || new Date()
      },
      { new: true }
    );
  }
  
  // Create new repository
  const newRepository = new Repository({
    ...repositoryData,
    userId: user._id,
    lastUpdated: repositoryData.lastUpdated || new Date()
  });
  
  return newRepository.save();
}

/**
 * Gets repositories for the current authenticated user
 */
export async function getUserRepositories(req: Request, limit = 10, skip = 0) {
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
  
  // Get repositories for this user
  return Repository.find({ userId: user._id })
    .sort({ lastUpdated: -1 })
    .skip(skip)
    .limit(limit);
}

//Gets a single repository by ID 
export async function getRepositoryById(req: Request, repositoryId: string) {
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
  
  if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
    throw new Error('Invalid repository ID');
  }
  
  // Get repository with permissions check
  const repository = await Repository.findOne({
    _id: repositoryId,
    userId: user._id
  });
  
  if (!repository) {
    throw new Error('Repository not found or access denied');
  }
  
  return repository;
}

/**
 * Delete a repository by ID
 */
export async function deleteRepository(req: Request, repositoryId: string) {
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
  
  if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
    throw new Error('Invalid repository ID');
  }
  
  // Delete repository with permissions check
  const result = await Repository.deleteOne({
    _id: repositoryId,
    userId: user._id
  });
  
  if (result.deletedCount === 0) {
    throw new Error('Repository not found or access denied');
  }
  
  return { success: true, message: 'Repository deleted successfully' };
}

/**
 * Search repositories by name or description
 */
export async function searchRepositories(req: Request, query: string, limit = 10, skip = 0) {
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
  
  // Search repositories for this user
  return Repository.find({
    userId: user._id,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { fullName: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  })
    .sort({ lastUpdated: -1 })
    .skip(skip)
    .limit(limit);
}
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import dbconnect from '../connectDatabase';
import  User from '@/models/User';

//returns The user document from the database
import { NextRequest } from 'next/server';

export async function syncUserWithClerk(req: NextRequest) {
  await dbconnect();

  // Get the current authenticated user from Clerk
  const { userId } = getAuth(req);

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Get user data from Clerk
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  if (!clerkUser) {
    throw new Error('User not found in Clerk');
  }

  // Extract primary email
  const primaryEmail = clerkUser.emailAddresses.find(
    email => email.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;

  if (!primaryEmail) {
    throw new Error('User has no primary email address');
  }

  // Prepare user data
  const userData = {
    clerkId: userId,
    email: primaryEmail,
    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || undefined,
    avatar: clerkUser.imageUrl,
    // Extract GitHub username if available from OAuth accounts
    githubUsername: clerkUser.externalAccounts.find(
      account => account.provider === 'github'
    )?.username || undefined
  };

  // Find existing user or create a new one
  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    userData,
    { new: true, upsert: true }
  );

  return user;
}
//Gets current authenticated user from Clerk and syncs with the database
export async function getCurrentUser(req: NextRequest) {
  await dbconnect();
  
  // Get user ID from Clerk auth
  const { userId } = getAuth(req);
  
  if (!userId) {
    throw new Error('Not authenticated');
  }
  
  // Get user details from Clerk
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  
  // Get user from database
  const dbUser = await User.findOne({ clerkId: userId });
  
  // If user exists in Clerk but not in database, create them
  if (clerkUser && !dbUser) {
    return syncUserWithClerk(req);
  }
  
  // Return combined data
  return {
    clerkUser,
    dbUser
  };
}


export async function getUserByClerkId(clerkId: string) {
  await dbconnect();
  return User.findOne({ clerkId });
}



//Gets all users (admin function)
export async function getAllUsers(limit = 100, skip = 0) {
  await dbconnect();
  return User.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
}

//i dont know if clerk has something like this, but this is a function to update user preferences in the database
// This function is not implemented yet, but it should update user preferences in the database
export function updateUserPreferences(request: NextRequest, preferences: Record<string, unknown>) {
    console.log('updateUserPreferences', preferences);
    throw new Error('Function not implemented.');
}


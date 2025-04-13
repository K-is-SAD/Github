
import { NextRequest, NextResponse } from 'next/server';
import * as userService from '@/lib/db/userService';


/**
 * GET endpoint to retrieve the current user's information
 */
 async function getUser(req: NextRequest) {
  try {
    // Get the current user from Clerk and sync with our database
    const user = await userService.syncUserWithClerk(req as NextRequest);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error in GET /api/user:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// export { PATCH };

/**
async function PATCH(request: NextRequest) {
 */
 async function PATCH(request: NextRequest) {
    try {
        // Get the request body
        const body = await request.json();
        const { preferences } = body;

        if (!preferences) {
            return NextResponse.json({ error: 'Preferences are required' }, { status: 400 });
        }

        // Update user preferences using the userService
        const updatedUser = await userService.updateUserPreferences(request, preferences);
        
        return NextResponse.json({ user: updatedUser }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error in PATCH /api/user:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export { getUser as GET, PATCH };

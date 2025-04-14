'use client'

import { SignIn, useUser } from '@clerk/nextjs';
import Index from "@/components/grids/Index";

export default function Page() {
  const { user, isSignedIn } = useUser();

  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0">
        <Index />
      </div>
      {!isSignedIn ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <SignIn />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <h1>Welcome, {user?.fullName || 'User'}!</h1>
        </div>
      )}
    </div>
  );
}
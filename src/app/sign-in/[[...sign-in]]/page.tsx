import { useUser } from '@clerk/nextjs';

export default function Page() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  if (!isSignedIn) return <div>Please sign in</div>;

  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0">
        <h1>Welcome, {user?.fullName || 'User'}!</h1>
      </div>
    </div>
  );
}
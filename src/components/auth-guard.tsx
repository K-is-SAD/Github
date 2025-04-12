"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConnectWallet } from "./ConnectWallet";
import { useActiveAccount } from "thirdweb/react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const account = useActiveAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Short timeout to prevent flickering during authentication check
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!account) {
        // Only redirect after we're sure there's no account
        router.push("/");
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [account, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-4">Please connect your wallet to access this page</p>
          <div className="inline-block">
            <ConnectWallet />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
"use client";

import { SignIn } from "@clerk/nextjs";
import Index from "@/components/grids/Index";

export default function Page() {
  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0">
        <Index />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <SignIn />
      </div>
    </div>
  );
}

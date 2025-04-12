"use client";

import { ReactNode } from "react";

export function ThirdwebAuthProvider({ children }: { children: ReactNode }) {
  // We're using the ConnectWallet component directly with the new Thirdweb SDK
  // This provider is kept for compatibility with any existing code
  return (
    <>
      {children}
    </>
  );
}
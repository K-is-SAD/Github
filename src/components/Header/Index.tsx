/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useRef } from "react";
import Toggle from "@/components/toggle/Index";
import Link from "next/link";
import Image from "next/image";
import { ConnectWallet } from "../ConnectWallet";

const Index = () => {
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full">
      <div className="hidden md:flex items-center justify-between fixed top-0 z-50 p-4 w-full shadow-lg backdrop-blur-md">
        <Link href={"/"}>
          <Image src={"/logo.png"} alt="logo" width={50} height={50} />
        </Link>
        <div className="flex items-center gap-x-4" ref={menuRef}>
          <Toggle />
          <ConnectWallet />
        </div>
      </div>

      <div className="md:hidden fixed top-0 w-full z-50 flex items-center justify-between p-4 bg-transparent shadow-lg backdrop-blur-md ">
        <div>
          <Link href={"/"}>
            <Image src={"/logo.png"} alt="logo" width={50} height={50} />
          </Link>
        </div>
        <div className="flex items-center justify-between gap-x-4">
          <Toggle />
          <ConnectWallet />
        </div>
      </div>
    </div>
  );
};

export default Index;

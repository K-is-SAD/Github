/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import Toggle from "@/components/toggle/Index";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

const navlinks: any[] = [
  {
    name: "Chat",
    href: "/chat",
  },
  {
    name: "Query",
    href: "/codebase",
  },
  {
    name: "Pricing",
    href: "/pricing",
  },
];

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      
      const isLargeScreen = window.innerWidth >= 768; 
      
      if (!isLargeScreen) return;
      
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="w-full">
      <div className="fixed top-0 z-50 w-full shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between p-4">
          <Link href={"/"}>
            <Image src={"/logo.png"} alt="logo" width={50} height={50} />
          </Link>
          
          <div className="flex items-center gap-x-4">
            <Toggle />
            
            <div className="flex items-center gap-x-2">
            <SignedOut>
              <SignInButton>
                <button className="dark:bg-white bg-black dark:text-black text-white py-2 px-4 rounded-md font-semibold dark:hover:bg-black dark:hover:text-white hover:bg-white hover:text-black">Login</button>
              </SignInButton>
              <SignUpButton>
              <button className="dark:bg-white bg-black dark:text-black text-white py-2 px-4 rounded-md font-semibold dark:hover:bg-black dark:hover:text-white hover:bg-white hover:text-black">Signin</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            </div>
            
            <button 
              ref={hamburgerRef}
              onClick={toggleMenu} 
              className="z-50 focus:outline-none h-full w-full flex items-center font-extrabold justify-center cursor-pointer"
            >
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div
            className="fixed top-16 left-0 w-full h-screen md:hidden bg-transparent shadow-lg backdrop-blur-md
            transition-all duration-300 ease-in-out
            transform origin-top
            animate-dropdown-enter z-40"
          >
            <div className="flex flex-col space-y-4 p-4 pt-8">
              {navlinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="py-3 text-center text-lg rounded-lg hover:font-semibold transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <div
            ref={menuRef}
            className="hidden md:block fixed top-20 right-4 w-48 bg-transparent shadow-sm dark:shadow-white shadow-black backdrop-blur-md
            rounded-lg overflow-hidden
            transition-all duration-300 ease-in-out
            transform origin-top
            animate-dropdown-enter z-40"
          >
            <div className="flex flex-col p-2">
              {navlinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="dark:text-white text-black py-2 px-4 rounded-md hover:font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
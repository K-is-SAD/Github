/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import Toggle from "@/components/toggle/Index";

import Link from "next/link";

const navlinks: any[] = [
  {
    name: "Chat",
    href: "/chat",
  },
];

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="w-full">
      <div className="hidden md:flex items-center justify-between fixed top-0 z-50 p-4 w-full shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-x-10">
          {navlinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="dark:bg-white bg-black dark:text-black text-white py-2 px-4 rounded-md font-semibold dark:hover:bg-black dark:hover:text-white hover:bg-white hover:text-black"
              >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-x-4" ref={menuRef}>
        <Toggle />
     
            <Link
              href={"/sign-in"}
              className="dark:bg-white bg-black dark:text-black text-white py-2 px-4 rounded-md font-semibold dark:hover:bg-black dark:hover:text-white hover:bg-white hover:text-black"
            >
              Login
            </Link>
            <Link
              href={"/sign-up"}
              className="dark:bg-white bg-black dark:text-black text-white py-2 px-4 rounded-md font-semibold dark:hover:bg-black dark:hover:text-white hover:bg-white hover:text-black"
              >
              SignUp
            </Link>
  
        </div>
      </div>
      <div className="md:hidden fixed top-0 left-0 w-full  z-50">
        <div className="flex items-center justify-between p-4 bg-transparent  shadow-lg backdrop-blur-md ">
          <div className="flex items-center gap-x-4">
            <Toggle />
       
              <Link
                href={"/sign-in"}
                className="bg-white text-black py-2 px-4 rounded-md font-semibold hover:bg-transparent hover:text-white"
              >
                Login
              </Link>
              <Link
                href={"/sign-up"}
                className="bg-white text-black py-2 px-4 rounded-md font-semibold hover:bg-transparent hover:text-white"
              >
                SignUp
              </Link>
           
          </div>
          <button onClick={toggleMenu} className="z-50 focus:outline-none">
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {isMenuOpen && (
          <div
            className="absolute top-full left-0 w-full h-screen bg-transparent shadow-lg backdrop-blur-md
            transition-all duration-300 ease-in-out 
            transform origin-top 
            animate-dropdown-enter"
          >
            <div className="flex flex-col space-y-4 p-4">
              {navlinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="py-2 text-center rounded-lg hover:font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

import Index from "@/components/grids/Index";
import React from "react";
import Code from "@/components/codeBlock/Index";
import Link from "next/link";

const Products = () => {
  return (
    <div className="relative h-screen w-full space-y-8">
      <div className="absolute inset-0">
        <Index />
      </div>
      <div className="relative gap-y-16 z-10 flex lg:flex-row flex-col items-center justify-between md:px-10 px-4 lg:top-24 top-32">
        <div className="flex flex-col gap-y-12">
          <p className="lg:text-5xl text-4xl">
            Exploring,
            <br />
            Nebula
          </p>
          <Link href={"/chat"} className="rounded-md dark:bg-white bg-black mx-4">
            <span
              className="block -translate-x-2 -translate-y-2 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl text-center  hover:-translate-y-3 
    active:translate-x-0 active:translate-y-0
    transition-all"
            >
              Get started
            </span>
          </Link>
        </div>
        <div className="lg:w-1/2 w-full">
          <Code />
        </div>
      </div>
      <div className="relative z-10 flex flex-col md:flex-row items-center mt-40 lg:mt-0 justify-between px-4 md:px-10 space-y-4 md:space-y-0">
        <p className="text-4xl lg:text-5xl text-center md:text-left">
          Turn any codebase,
          <br />
          into LLM
        </p>
      </div>
    </div>
  );
};

export default Products;

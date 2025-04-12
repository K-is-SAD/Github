import React from "react";
import { features } from "@/assets/data";
import Grid from "@/components/grids/Index";

const page = () => {
  return (
    <div className="w-full relative">
      <div>
        <Grid />
      </div>
      <div className="absolute h-screen w-full space-y-8 items-center sm:top-24 top-28">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="md:text-5xl text-2xl text-center">
            Equip your buisness with world class software
          </h1>

          <h4 className="md:text-xl text-sm text-center">
            We believe Untitled should be accesible to all companies,no matter
            the size
          </h4>
        </div>
        <div className="flex items-center justify-center space-x-6">
          <button className="rounded-md dark:bg-white bg-black">
            <span
              className={`block -translate-x-2 -translate-y-2 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
                hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
               `}
            >
              Watch video
            </span>
          </button>
          <button className="rounded-md dark:bg-white bg-black">
            <span
              className={`block -translate-x-2 -translate-y-2 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
                hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
               `}
            >
              Get Started
            </span>
          </button>
        </div>
        <div className="flex md:flex-row flex-col items-center justify-center gap-8 max-w-7xl mx-auto md:px-10 px-4">
          <div className="bg-transparent md:w-1/2 w-full rounded-xl p-8 flex flex-col items-center justify-between space-y-6">
            <div className="flex flex-col items-center justify-center gap-y-4">
              <div className="flex flex-col items-center justify-center">
                <h1 className="font-semibold text-xl">Basic</h1>
                <p className="dark:text-gray-400 text-gray-950 text-center">
                  Our Most Popular Plan for small teams
                </p>
              </div>

              <div>
                <span className="text-2xl dark:text-gray-400 text-gray-950">
                  {" "}
                  $
                </span>
                <span className="font-bold text-4xl">39</span>
                <span className="dark:text-gray-400 text-gray-950 text-sm">
                  /per month
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-center">
                <h1 className="font-semibold text-xl">Features</h1>
                <p className="dark:text-gray-400 text-gray-950">
                  Everything in our free plan plus...
                </p>
              </div>
              <div className="flex px-2 py-2 ">
                <div className="space-y-2">
                  {features.map((feature) => (
                    <ul key={feature.id} className="flex items-center gap-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-blue-500"
                      >
                        <circle
                          cx="8"
                          cy="8"
                          r="7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M5.5 8L7 9.5L10.5 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span
                        className={feature.highlighted ? "font-medium" : ""}
                      >
                        {feature.text}
                      </span>
                    </ul>
                  ))}
                </div>
              </div>
            </div>
            <button className="w-40 rounded-md dark:bg-white bg-black">
              <span
                className={`block -translate-x-2 -translate-y-2 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
                hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
               `}
              >
                Get Started
              </span>
            </button>
          </div>
          <div className="bg-transparent md:w-1/2 w-full rounded-xl p-8 space-y-6 flex flex-col items-center justify-between">
            <div className="flex flex-col justify-center items-center gap-y-4">
              <div className="text-center">
                <h1 className="font-semibold text-xl">Advanced</h1>
                <p className="dark:text-gray-400 text-black">
                  Advanced features and reporting
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl dark:text-gray-400 text-black">
                  {" "}
                  $
                </span>
                <span className="font-bold text-4xl">69</span>
                <span className="dark:text-gray-400 text-black text-sm">
                  /per month
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-center">
                <h1 className="font-semibold text-xl">Features</h1>
                <p className="text-gray-400">
                  Everything in our basic plan plus...
                </p>
              </div>
              <div className="flex items-center justify-between px-2 py-2 ">
                <div className="space-y-2">
                  {features.map((feature) => (
                    <ul key={feature.id} className="flex items-center gap-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-blue-500"
                      >
                        <circle
                          cx="8"
                          cy="8"
                          r="7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M5.5 8L7 9.5L10.5 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span
                        className={feature.highlighted ? "font-medium" : ""}
                      >
                        {feature.text}
                      </span>
                    </ul>
                  ))}
                </div>
              </div>
            </div>
            <button className="w-40 rounded-md dark:bg-white bg-black">
              <span
                className={`block -translate-x-2 -translate-y-2 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
                hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
               `}
              >
                Get Started
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;

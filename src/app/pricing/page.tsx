'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { basicFeatures, proFeatures } from "@/assets/data";
import Grid from "@/components/grids/Index";

export default function PaymentsPage() {
  const [loadingStates, setLoadingStates] = useState({
    basic: false,
    advanced: false
  });
  const [error, setError] = useState<string | null>(null)
  
  const buy = async (productId: string, plan: 'basic' | 'advanced') => {
    try {
      setLoadingStates(prev => ({...prev, [plan]: true}));
      setError(null)
      
      const response = await axios.post('/api/purchaseProduct', {
        productId: productId, 
        customData: {
          userId: '123', // Replace with actual user ID
        }});
      const data = await response.data  
      
      if (response.status < 200 || response.status >= 300) {
        throw new Error(data.error || 'Failed to initiate payment')
      }
      
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank')
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoadingStates(prev => ({...prev, [plan]: false}));
    }
  }

  return (
    <div className="w-full relative">
      <div>
        <Grid />
      </div>
      <div className="absolute h-screen w-full space-y-8 items-center sm:top-24 top-28">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="md:text-5xl text-2xl text-center">
            Welcome to Nebula
          </h1>

          <h4 className="md:text-xl text-sm text-center">
            Nebula transforms complicated repositories into elegant documentation with AI-powered analysis.
          </h4>
        </div>
        
        {error && (
          <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md border border-red-200 max-w-md mx-auto">
            {error}
          </div>
        )}
        
        <div className="flex md:flex-row flex-col items-center justify-center gap-8 max-w-7xl mx-auto md:px-10 px-4">
          {/* Basic Plan */}
          <div className="bg-transparent md:w-1/2 w-full rounded-xl p-8 flex flex-col items-center justify-between space-y-6 border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col items-center justify-center gap-y-4">
              <div className="flex flex-col items-center justify-center">
                <h1 className="font-semibold text-xl">Basic</h1>
                <p className="dark:text-gray-400 text-gray-950 text-center">
                  Our Most Popular Plan for small teams
                </p>
              </div>

              <div>
                <span className="text-2xl dark:text-gray-400 text-gray-950">$</span>
                <span className="font-bold text-4xl">0</span>
                <span className="dark:text-gray-400 text-gray-950 text-sm">/per month</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center w-full">
              <div className="text-center mb-4">
                <h1 className="font-semibold text-xl">Features</h1>
                <p className="dark:text-gray-400 text-gray-950">
                  Everything you need to get started
                </p>
              </div>
              <div className="w-full px-2 py-2">
                <div className="space-y-3">
                  {basicFeatures.map((feature) => (
                    <div key={feature.id} className="flex items-start gap-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-blue-500 flex-shrink-0 mt-0.5"
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
                      <span className={feature.highlighted ? "font-medium" : "text-gray-600 dark:text-gray-400"}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => buy('795918', 'basic')}
              disabled={loadingStates.basic}
              className="w-40 rounded-md dark:bg-white bg-black"
            >
              <span
                className={`block -translate-x-2 -translate-y-2 rounded-md border-2 dark:border-white border-black dark:bg-black bg-white p-4 text-xl  
                  hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
                  ${loadingStates.basic ? 'opacity-75 cursor-not-allowed' : ''}
                `}
              >
                {loadingStates.basic ? 'Processing...' : 'Get Started'}
              </span>
            </button>
          </div>
          
          {/* Advanced Plan */}
          <div className="bg-transparent md:w-1/2 w-full rounded-xl p-8 space-y-6 flex flex-col items-center justify-between border-2 border-purple-500 dark:border-purple-400 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <div className="flex flex-col justify-center items-center gap-y-4">
              <div className="text-center">
                <h1 className="font-semibold text-xl">Advanced</h1>
                <p className="dark:text-gray-400 text-black">
                  For teams needing premium features
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl dark:text-gray-400 text-black">$</span>
                <span className="font-bold text-4xl">69</span>
                <span className="dark:text-gray-400 text-black text-sm">/per month</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center w-full">
              <div className="text-center mb-4">
                <h1 className="font-semibold text-xl">Features</h1>
                <p className="text-gray-400">
                  Everything in Basic plus...
                </p>
              </div>
              <div className="w-full px-2 py-2">
                <div className="space-y-3">
                  {proFeatures.map((feature) => (
                    <div key={feature.id} className="flex items-start gap-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-purple-500 flex-shrink-0 mt-0.5"
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
                      <span className={feature.highlighted ? "font-medium" : "text-gray-600 dark:text-gray-400"}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => buy('795919', 'advanced')}
              disabled={loadingStates.advanced}
              className="w-40 rounded-md dark:bg-purple-500 bg-purple-600"
            >
              <span
                className={`block -translate-x-2 -translate-y-2 rounded-md border-2 border-purple-600 dark:border-purple-400 bg-white dark:bg-black p-4 text-xl  
                  hover:-translate-y-3 active:translate-x-0 active:translate-y-0 transition-all
                  ${loadingStates.advanced ? 'opacity-75 cursor-not-allowed' : ''}
                `}
              >
                {loadingStates.advanced ? 'Processing...' : 'Upgrade Now'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
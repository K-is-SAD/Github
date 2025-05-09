'use client'

import { useState } from 'react'
import axios from 'axios'


export default function PaymentsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  

  const buy = async () => {
    try {
      // Reset states
      setIsLoading(true)
      setError(null)
      
      // Making  API call to purchase endpoint
      const response = await axios.post('/api/purchaseProduct', {
        productId: '795918', 
        customData: {
          userId: '123', // Replace with actual user ID
        }});
      const data = await response.data  
      console.log('Response from purchase API:', data)
      // Check if the response is successful  
      if (response.status < 200 || response.status >= 300) {
        throw new Error(data.error || 'Failed to initiate payment')
      }
      
      // Redirectig  to checkout URL provided by LemonSqueezy
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank')
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Purchase Product</h1>
      
      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <button
        onClick={buy}
        disabled={isLoading}
        className={`
          px-6 py-3 rounded-lg text-white font-medium
          ${isLoading 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}
          transition-colors duration-200
        `}
      >
        {isLoading ? 'Processing...' : 'Buy Now'}
      </button>
    </div>
  )
}
"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"

export default function PaymentRedirection() {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)
    // TODO: Implement Stripe Checkout redirection
    // This is where you'd typically call your backend to create a Stripe Checkout session
    // and then redirect to the Stripe Checkout page
    console.log("Redirecting to Stripe Checkout...")
    // Simulating a delay for demonstration purposes
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 transform transition-all duration-500 ease-in-out hover:scale-105">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Contract Signed Successfully!</h2>
          <p className="text-gray-600 mt-2">
            You're just one step away from getting into our world of Climate tech Evolution.
          </p>
        </div>

        <div className="mt-8 bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Plan:</h3>
          <p className="text-gray-800 text-xl">
            Marketplace Listing: <strong>$150 (One-off)</strong>
          </p>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className={`
            mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg
            transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${isLoading ? "opacity-75 cursor-not-allowed" : ""}
          `}
        >
          {isLoading ? "Processing..." : "Proceed to Payment"}
        </button>
      </div>
    </div>
  )
}


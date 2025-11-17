'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  isAuthenticated?: boolean;
  userEmail?: string | null;
  CustomButton?: React.ReactNode;
}

export default function Navbar({ isAuthenticated, userEmail, CustomButton }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed w-full bg-white backdrop-blur-md z-50 border-b font-arcon">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/images/logos/new-logo-blue.png" 
                alt="NoHarm Logo" 
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
            
            {isAuthenticated && (
              <Button asChild variant="default" className="bg-black hover:bg-black/90 text-white">
                <Link href="/dashboard">
                  Dashboard
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}

            {CustomButton ? (
              <div className="px-3 py-2">
                {CustomButton}
              </div>
            ) : (
              isAuthenticated ? (
                <Link
                  href="/onboarding/dashboard"
                  className="block px-3 py-2 rounded-md bg-primary text-primary-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{userEmail}</span>
                  </div>
                  <span className="text-sm opacity-80 mt-1 block">
                    Continue Setup →
                  </span>
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-md bg-primary text-primary-foreground text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  )
}


/**
 * Request Access page - form for requesting platform access
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, MessageSquare, User, Mail, CheckCircle } from 'lucide-react';

export const RequestAccess: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Access request submitted:', formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0b0c0f] flex flex-col">
        {/* Logo Header */}
        <div className="py-6 px-4">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-serif font-bold text-white hover:text-blue-400 transition-colors">
              General Exchange
            </span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-3 sm:px-4 lg:px-8 py-8">
          <div className="max-w-md w-full text-center">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 sm:p-12">
              <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Request Received!
              </h2>
              <p className="text-gray-400 mb-8">
                Thank you for your interest in General Exchange. Our team will review your request and contact you within 24-48 hours.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="border-t border-[#2a2a2a] bg-[#0b0c0f] py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} General Exchange. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0f] flex flex-col">
      {/* Logo Header */}
      <div className="py-6 px-4">
        <Link href="/" className="inline-block">
          <span className="text-2xl font-serif font-bold text-white hover:text-blue-400 transition-colors">
            Bridge Observer
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 lg:px-8 py-8">
        <div className="max-w-2xl w-full">
          {/* Card Container */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-[#2a2a2a]">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Request Platform Access
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Join thousands of professional traders using General Exchange
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-lg bg-[#0f0f0f] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-lg bg-[#0f0f0f] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-300 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-lg bg-[#0f0f0f] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  We&apos;ll use this to contact you about your request
                </p>
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">
                  Tell Us About Your Trading Experience *
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MessageSquare className="h-5 w-5 text-gray-500" />
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-[#2a2a2a] rounded-lg bg-[#0f0f0f] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about your trading style, experience level, and what you're looking for in a trading platform..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Request...
                  </span>
                ) : (
                  'Request Access'
                )}
              </button>

              {/* Additional Info */}
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Sign in here
                </Link>
              </p>
            </form>
          </div>

          {/* Benefits List */}
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-blue-400 font-bold text-2xl mb-1">24-48h</div>
              <div className="text-gray-400 text-sm">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold text-2xl mb-1">14 Days</div>
              <div className="text-gray-400 text-sm">Free Trial</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold text-2xl mb-1">No Card</div>
              <div className="text-gray-400 text-sm">Required</div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="border-t border-[#2a2a2a] bg-[#0b0c0f] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Bridge Observer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};


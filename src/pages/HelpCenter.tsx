/**
 * Help Center page - support and FAQs
 */

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Search, MessageCircle, Mail, Phone, ChevronDown } from 'lucide-react';

export const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I get started with General Exchange?',
      answer: 'Getting started is easy! Sign up for an account, connect your trading accounts or manually add positions, and our AI will immediately start analyzing your portfolio for risks and opportunities.'
    },
    {
      question: 'What brokerages do you integrate with?',
      answer: 'We integrate with major brokerages including TD Ameritrade, Interactive Brokers, E*TRADE, Charles Schwab, and Robinhood. More integrations are added regularly.'
    },
    {
      question: 'How does the risk scoring system work?',
      answer: 'Our AI analyzes multiple factors including volatility, correlation, market conditions, news sentiment, and technical indicators to provide a comprehensive risk score for each position and your overall portfolio.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption (256-bit SSL), store data in SOC 2 compliant data centers, and never share your information with third parties. Your trading data is yours alone.'
    },
    {
      question: 'What is near-term trade optimization?',
      answer: 'Our algorithms are specifically designed for short-term trading strategies (days to weeks), optimizing entry and exit points based on technical analysis, fundamental data, and market conditions.'
    },
    {
      question: 'Can I customize alert thresholds?',
      answer: 'Yes! You can set custom risk thresholds, price alerts, and notification preferences for each position or your entire portfolio. Receive alerts via email, SMS, or push notifications.'
    },
    {
      question: 'What data sources do you use?',
      answer: 'We aggregate data from Thomson Reuters, Bloomberg, NYSE, NASDAQ, and other premium financial data providers to give you the most comprehensive market intelligence.'
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.'
    }
  ];

  const supportChannels = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: 'Start Chat',
      available: 'Available 24/7'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@generalexchange.com',
      action: 'Send Email',
      available: 'Response within 2 hours'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '1-800-BRIDGE-OBS',
      action: 'Call Now',
      available: 'Mon-Fri 9am-6pm EST'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0c0f]">
      <Navbar showSearch={false} />
      
      <div className="pt-14 sm:pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-[#0b0c0f]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">How can we help?</h1>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Support Channels */}
        <section className="py-12 bg-[#0b0c0f] border-t border-[#2a2a2a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Get in Touch</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {supportChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <div
                    key={channel.title}
                    className="p-6 bg-[#1a1a1a] border border-white/10 rounded-xl hover:border-blue-500/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{channel.title}</h3>
                    <p className="text-gray-400 text-sm mb-1">{channel.description}</p>
                    <p className="text-gray-500 text-xs mb-4">{channel.available}</p>
                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                      {channel.action}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-[#0b0c0f]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#2a2a2a] transition-colors"
                  >
                    <span className="text-lg font-semibold text-white">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedFaq === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#2a2a2a] bg-[#0b0c0f] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} General Exchange. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};


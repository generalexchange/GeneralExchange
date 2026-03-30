/**
 * Homepage component - Professional landing page
 * Positioning General Exchange as a Bloomberg/Reuters-level platform
 * with AI-powered risk management for near-term trading
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Shield, 
  Brain, 
  ArrowRight,
  Activity,
  MapPin
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { SEO } from '../components/SEO';

export const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <SEO 
        title="General Exchange - Algorithmic Trade Engine"
        description="Professional algorithmic risk management platform for options trading professionals. Educational use; real-time analysis, risk context, and trade workflow tools."
        keywords="options trading platform, algorithmic trading, risk management software, AI trading tools, options analysis, trading algorithms, professional trading platform, options strategy, trading risk management"
        canonical="https://generalexchange.com/"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'General Exchange',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web, iOS, Android',
          offers: {
            '@type': 'Offer',
            price: '49.00',
            priceCurrency: 'USD'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1247'
          }
        }}
      />
      <Navbar showSearch={false} />
      
      {/* Add padding for fixed navbar */}
      <div className="pt-14 sm:pt-16">
        {/* Hero Section - Bloomberg Terminal Inspired */}
        <section className="relative overflow-hidden bg-[#0a0a0a]">
          {/* Animated background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Main Message */}
              <div className="space-y-4 sm:space-y-8">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="text-blue-400 text-sm font-medium">Connect With Interactive Brokers</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Algorithmic Risk Management for
                  <span className="text-blue-400"> Options Trading Professionals</span>
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                  General Exchange combines the depth of <span className="text-blue-400 font-semibold">Thomson Reuters</span>, 
                  the insight of <span className="text-blue-400 font-semibold">Bloomberg</span>, and 
                  the clarity of <span className="text-blue-400 font-semibold">The New York Times</span> with 
                  advanced AI algorithms that help traders manage risk and make informed decisions in real-time.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/request-access"
                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 group"
                  >
                    Start Trading Smarter
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/backtesting"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg border border-white/10 transition-all duration-200"
                  >
                    Explore Platform
                  </Link>
                </div>
                
              </div>
              
              {/* Right Column - Dashboard Preview */}
              <div className="relative">
                {/* Floating Terminal Window */}
                <div className="bg-[#1a1a1a] border border-blue-500/20 rounded-xl shadow-2xl overflow-hidden">
                  {/* Terminal Header */}
                  <div className="bg-[#0f0f0f] border-b border-blue-500/20 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">GENERAL_EXCHANGE</span>
                  </div>
                  
                  {/* Terminal Content */}
                  <div className="p-6 space-y-4">
                    {/* Live Market Data */}
                    <div className="space-y-3">
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Live Market Analysis</div>
                      
                      {['AAPL', 'TSLA', 'NVDA'].map((ticker, i) => (
                        <div key={ticker} className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                            <span className="text-white font-mono font-semibold">{ticker}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`text-sm font-semibold ${i % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {i % 2 === 0 ? '+' : '-'}{(Math.random() * 5 + 1).toFixed(2)}%
                            </span>
                            <Activity className={`w-4 h-4 ${i % 2 === 0 ? 'text-green-500' : 'text-red-500'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Bridge Observer add-on */}
                    <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-white mb-1">Bridge Observer · Breaking News</div>
                          <div className="text-xs text-gray-400">
                            Headlines and market context from Bridge Observer, piped in-platform—no extra windows.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Stats Cards */}
                <div className="absolute -right-4 top-20 w-48 p-4 bg-[#1a1a1a] border border-green-500/30 rounded-lg shadow-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-400">Long call leg</span>
                  </div>
                  <div className="text-sm font-mono text-white leading-snug">NVDA $142.50C</div>
                  <div className="text-xs text-gray-500 mt-1">Apr 18 · entry $4.10</div>
                  <div className="text-lg font-bold text-green-400 mt-2">+Return 31.2%</div>
                </div>
                
                <div className="absolute -left-4 bottom-20 w-48 p-4 bg-[#1a1a1a] border border-purple-500/30 rounded-lg shadow-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-gray-400">Win Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">72%</div>
                  <div className="text-xs text-gray-500">Trailing 90 days</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#2a2a2a] bg-[#0a0a0a] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-2xl font-serif font-bold text-white mb-3">General Exchange</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  Professional trading intelligence with AI-powered risk management
                </p>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500">Fort Worth, Texas</span>
                </div>
              </div>

              {/* Platform */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
                <ul className="space-y-2">
                  <li><Link to="/backtesting" className="text-gray-500 hover:text-blue-500 transition-colors text-sm">BackTesting</Link></li>
                  <li><Link to="/strategy" className="text-gray-500 hover:text-blue-500 transition-colors text-sm">Strategy</Link></li>
                  <li><Link to="/risk-management" className="text-gray-500 hover:text-blue-500 transition-colors text-sm">Risk Management</Link></li>
                  <li><Link to="/execution" className="text-gray-500 hover:text-blue-500 transition-colors text-sm">Execution</Link></li>
                  <li><Link to="/automation" className="text-gray-500 hover:text-blue-500 transition-colors text-sm">Automation</Link></li>
                  <li><Link to="/performance" className="text-gray-500 hover:text-blue-500 transition-colors text-sm">Performance</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
                <ul className="space-y-2">
                  <li><Link to="/investor-relations" className="text-gray-500 hover:text-blue-500 transition-colors text-sm">Investor Relations</Link></li>
                  <li><Link to="/documents" className="text-gray-500 hover:text-blue-500 transition-colors text-sm">Documents</Link></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
                <ul className="space-y-2">
                  <li><Link to="/university" className="text-gray-500 hover:text-blue-500 transition-colors text-sm">University</Link></li>
                  <li><Link to="/help-center" className="text-gray-500 hover:text-blue-500 transition-colors text-sm">Help Center</Link></li>
                </ul>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
                <ul className="space-y-2">
                  <li><Link to="/newsletter" className="text-gray-500 hover:text-blue-500 transition-colors text-sm">Newsletter</Link></li>
                  <li><Link to="/dashboard" className="text-gray-500 hover:text-blue-500 transition-colors text-sm">Wallet</Link></li>
                  <li><Link to="/community" className="text-gray-500 hover:text-blue-500 transition-colors text-sm">Community</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[#2a2a2a] pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} General Exchange. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-gray-500">
                <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-blue-500 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};


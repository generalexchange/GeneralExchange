/**
 * Wikipedia-inspired company details page
 * Shows company bio, recent news, and options chain
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Users, MapPin, Globe, ExternalLink, Activity, Zap } from 'lucide-react';

interface CompanyDetails {
  symbol: string;
  name: string;
  fullName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  description: string;
  founded: string;
  headquarters: string;
  website: string;
  employees: string;
  sector: string;
  industry: string;
  ceo: string;
}

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  source: string;
  date: string;
  category: string;
}

interface OptionContract {
  id: number;
  symbol: string;
  type: 'CALL' | 'PUT';
  strike: number;
  expiration: string;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
}

export const CompanyDetails: React.FC = () => {
  const navigate = useNavigate();
  const { symbol } = useParams<{ symbol: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'options'>('overview');
  const [activeGreek, setActiveGreek] = useState<'theta' | 'gamma' | 'delta'>('theta');

  // Greeks calculation functions
  const calculateGreeks = (option: OptionContract, currentPrice: number) => {
    const timeToExp = (new Date(option.expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365);
    const moneyness = option.strike / currentPrice;
    
    if (timeToExp <= 0) {
      return { theta: 0, gamma: 0, delta: option.type === 'CALL' ? 1 : -1 };
    }

    // Simplified Greeks calculation
    const theta = -Math.exp(-timeToExp * 2) * (1 - Math.abs(moneyness - 1)) * 0.1;
    const gamma = Math.random() * 0.05 + 0.01;
    const delta = option.type === 'CALL' ? Math.random() * 0.8 + 0.1 : Math.random() * 0.8 - 0.9;
    
    return { theta, gamma, delta };
  };

  const getGreekValue = (option: OptionContract, currentPrice: number) => {
    const greeks = calculateGreeks(option, currentPrice);
    return activeGreek === 'theta' ? greeks.theta : 
           activeGreek === 'gamma' ? greeks.gamma : 
           greeks.delta;
  };

  const getDotProperties = (option: OptionContract, currentPrice: number) => {
    const greekValue = getGreekValue(option, currentPrice);
    const moneyness = option.strike / currentPrice;
    const isATM = Math.abs(moneyness - 1) < 0.05;
    const intensity = Math.abs(greekValue);
    
    let dotSize, dotColor;
    
    if (activeGreek === 'theta') {
      dotSize = Math.max(4, Math.min(20, intensity * 200));
      dotColor = isATM ? '#ef4444' : intensity > 0.05 ? '#f59e0b' : '#10b981';
    } else if (activeGreek === 'gamma') {
      dotSize = Math.max(4, Math.min(20, intensity * 1000));
      dotColor = intensity > 0.03 ? '#f59e0b' : intensity > 0.01 ? '#eab308' : '#10b981';
    } else { // delta
      dotSize = Math.max(4, Math.min(20, intensity * 25));
      dotColor = intensity > 0.7 ? '#3b82f6' : intensity > 0.3 ? '#60a5fa' : '#93c5fd';
    }
    
    return { dotSize, dotColor, greekValue };
  };

  // Comprehensive company database
  const companyDatabase: Record<string, CompanyDetails> = {
    // Tech Giants
    'AAPL': {
      symbol: 'AAPL', name: 'Apple', fullName: 'Apple Inc.',
      price: 178.45, change: -1.23, changePercent: -0.68, volume: '58.3M', marketCap: '$2.8T',
      description: `Apple Inc. is an American multinational technology company that specializes in consumer electronics, computer software, and online services. Apple is the world's largest technology company by revenue and, since January 2021, the world's most valuable company. The company's hardware products include the iPhone smartphone, the iPad tablet computer, the Mac personal computer, the iPod portable media player, the Apple Watch smartwatch, the Apple TV digital media player, the AirPods wireless earbuds and the HomePod smart speaker.`,
      founded: 'April 1, 1976', headquarters: 'Cupertino, California, United States',
      website: 'https://www.apple.com', employees: '164,000 (2023)', sector: 'Technology', industry: 'Consumer Electronics', ceo: 'Tim Cook'
    },
    'MSFT': {
      symbol: 'MSFT', name: 'Microsoft', fullName: 'Microsoft Corporation',
      price: 372.15, change: 5.89, changePercent: 1.61, volume: '32.1M', marketCap: '$2.8T',
      description: `Microsoft Corporation is an American multinational technology corporation which produces computer software, consumer electronics, personal computers, and related services. Microsoft's best known software products are the Microsoft Windows line of operating systems, the Microsoft Office suite, and the Internet Explorer and Edge web browsers.`,
      founded: 'April 4, 1975', headquarters: 'Redmond, Washington, United States',
      website: 'https://www.microsoft.com', employees: '221,000 (2023)', sector: 'Technology', industry: 'Software', ceo: 'Satya Nadella'
    },
    'NVDA': {
      symbol: 'NVDA', name: 'NVIDIA', fullName: 'NVIDIA Corporation',
      price: 456.23, change: 12.45, changePercent: 2.81, volume: '45.2M', marketCap: '$1.1T',
      description: `NVIDIA Corporation is an American multinational technology company incorporated in Delaware and based in Santa Clara, California. It is a software and fabless company which designs graphics processing units (GPUs) for the gaming and professional markets, as well as system on a chip units (SoCs) for the mobile computing and automotive market.`,
      founded: 'April 5, 1993', headquarters: 'Santa Clara, California, United States',
      website: 'https://www.nvidia.com', employees: '29,600 (2023)', sector: 'Technology', industry: 'Semiconductors', ceo: 'Jensen Huang'
    },
    'AMZN': {
      symbol: 'AMZN', name: 'Amazon', fullName: 'Amazon.com Inc.',
      price: 142.38, change: -1.24, changePercent: -0.86, volume: '28.7M', marketCap: '$1.5T',
      description: `Amazon.com Inc. is an American multinational technology company which focuses on e-commerce, cloud computing, digital streaming, and artificial intelligence. It is one of the Big Five companies in the U.S. information technology industry, along with Alphabet, Apple, Meta, and Microsoft.`,
      founded: 'July 5, 1994', headquarters: 'Seattle, Washington, United States',
      website: 'https://www.amazon.com', employees: '1,541,000 (2023)', sector: 'Consumer Discretionary', industry: 'Internet Retail', ceo: 'Andy Jassy'
    },
    'META': {
      symbol: 'META', name: 'Meta', fullName: 'Meta Platforms Inc.',
      price: 312.45, change: 8.92, changePercent: 2.94, volume: '18.3M', marketCap: '$800B',
      description: `Meta Platforms Inc., formerly Facebook Inc., is an American multinational technology conglomerate based in Menlo Park, California. The company owns Facebook, Instagram, WhatsApp, and other products and services.`,
      founded: 'February 4, 2004', headquarters: 'Menlo Park, California, United States',
      website: 'https://www.meta.com', employees: '77,114 (2023)', sector: 'Technology', industry: 'Social Media', ceo: 'Mark Zuckerberg'
    },
    'GOOGL': {
      symbol: 'GOOGL', name: 'Alphabet', fullName: 'Alphabet Inc. Class A',
      price: 139.15, change: 1.52, changePercent: 1.10, volume: '22.8M', marketCap: '$1.7T',
      description: `Alphabet Inc. is an American multinational conglomerate holding company headquartered in Mountain View, California. It was created through a restructuring of Google on October 2, 2015, and became the parent company of Google and several former Google subsidiaries.`,
      founded: 'October 2, 2015', headquarters: 'Mountain View, California, United States',
      website: 'https://www.alphabet.com', employees: '190,234 (2023)', sector: 'Technology', industry: 'Internet Services', ceo: 'Sundar Pichai'
    },
    'TSLA': {
      symbol: 'TSLA', name: 'Tesla', fullName: 'Tesla, Inc.',
      price: 258.67, change: 8.92, changePercent: 3.57, volume: '102.5M', marketCap: '$822.1B',
      description: `Tesla, Inc. is an American electric vehicle and clean energy company based in Austin, Texas. Tesla's current products include electric cars, battery energy storage from home to grid-scale, solar panels and solar roof tiles, and related products and services.`,
      founded: 'July 1, 2003', headquarters: 'Austin, Texas, United States',
      website: 'https://www.tesla.com', employees: '140,473 (2023)', sector: 'Consumer Discretionary', industry: 'Electric Vehicles', ceo: 'Elon Musk'
    },
    
    // Financial & Banking
    'GS': {
      symbol: 'GS', name: 'Goldman Sachs', fullName: 'Goldman Sachs Group Inc.',
      price: 378.45, change: 5.67, changePercent: 1.52, volume: '2.8M', marketCap: '$120B',
      description: `The Goldman Sachs Group, Inc. is an American multinational investment bank and financial services company. Founded in 1869, Goldman Sachs is headquartered at 200 West Street in Lower Manhattan, with additional offices in other international financial centers.`,
      founded: '1869', headquarters: 'New York, New York, United States',
      website: 'https://www.goldmansachs.com', employees: '45,000 (2023)', sector: 'Financial Services', industry: 'Investment Banking', ceo: 'David Solomon'
    },
    'JPM': {
      symbol: 'JPM', name: 'JPMorgan', fullName: 'JPMorgan Chase & Co.',
      price: 145.23, change: 1.89, changePercent: 1.32, volume: '12.4M', marketCap: '$450B',
      description: `JPMorgan Chase & Co. is an American multinational investment bank and financial services holding company headquartered in New York City. JPMorgan Chase is the largest bank in the United States and the world's largest bank by market capitalization.`,
      founded: 'December 1, 2000', headquarters: 'New York, New York, United States',
      website: 'https://www.jpmorganchase.com', employees: '293,000 (2023)', sector: 'Financial Services', industry: 'Banking', ceo: 'Jamie Dimon'
    },
    
    // Crypto & Blockchain
    'COIN': {
      symbol: 'COIN', name: 'Coinbase', fullName: 'Coinbase Global Inc.',
      price: 245.67, change: 12.34, changePercent: 5.28, volume: '8.9M', marketCap: '$58B',
      description: `Coinbase Global, Inc. is an American publicly traded company that operates a cryptocurrency exchange platform. The company was founded in 2012 by Brian Armstrong and Fred Ehrsam. Coinbase is a digital currency exchange headquartered in San Francisco, California.`,
      founded: 'June 2012', headquarters: 'San Francisco, California, United States',
      website: 'https://www.coinbase.com', employees: '4,700 (2023)', sector: 'Financial Services', industry: 'Cryptocurrency Exchange', ceo: 'Brian Armstrong'
    },
    'MSTR': {
      symbol: 'MSTR', name: 'MicroStrategy', fullName: 'MicroStrategy Incorporated',
      price: 1234.56, change: 45.67, changePercent: 3.84, volume: '1.2M', marketCap: '$21B',
      description: `MicroStrategy Incorporated is an American company that provides business intelligence, mobile software, and cloud-based services. Founded in 1989, MicroStrategy is a public company traded on the NASDAQ stock exchange under the symbol MSTR.`,
      founded: '1989', headquarters: 'Tysons Corner, Virginia, United States',
      website: 'https://www.microstrategy.com', employees: '2,200 (2023)', sector: 'Technology', industry: 'Business Intelligence', ceo: 'Michael Saylor'
    },
    
    // Healthcare & Pharma
    'UNH': {
      symbol: 'UNH', name: 'UnitedHealth', fullName: 'UnitedHealth Group Incorporated',
      price: 523.45, change: 8.92, changePercent: 1.73, volume: '3.2M', marketCap: '$490B',
      description: `UnitedHealth Group Incorporated is an American multinational managed healthcare and insurance company based in Minnetonka, Minnesota. It is the largest healthcare company in the world by revenue, with 2020 revenue of $257.1 billion.`,
      founded: '1977', headquarters: 'Minnetonka, Minnesota, United States',
      website: 'https://www.unitedhealthgroup.com', employees: '400,000 (2023)', sector: 'Healthcare', industry: 'Managed Healthcare', ceo: 'Andrew Witty'
    },
    
    // Legacy IBM entry
    'IBM': {
      symbol: 'IBM', name: 'IBM', fullName: 'International Business Machines Corporation',
      price: 142.35, change: 2.47, changePercent: 1.77, volume: '4.2M', marketCap: '$131.2B',
      description: `International Business Machines Corporation (IBM) is an American multinational technology corporation headquartered in Armonk, New York. Founded in 1911, IBM is one of the world's oldest and largest technology companies. The company operates in over 175 countries and employs approximately 282,000 people worldwide.`,
      founded: 'June 16, 1911', headquarters: 'Armonk, New York, United States',
      website: 'https://www.ibm.com', employees: '282,000 (2023)', sector: 'Technology', industry: 'Information Technology Services', ceo: 'Arvind Krishna'
    }
  };

  // Get company data based on symbol, fallback to IBM if not found
  const companyData = companyDatabase[symbol?.toUpperCase() || ''] || companyDatabase['IBM'];

  // Dynamic news based on company
  const getCompanyNews = (symbol: string): NewsArticle[] => {
    const newsDatabase: Record<string, NewsArticle[]> = {
      'AAPL': [
        { id: 1, title: 'Apple Reports Record Q4 Revenue Driven by iPhone 15 Sales', summary: 'Apple Inc. reported record fourth quarter revenue with strong iPhone 15 sales and services growth.', source: 'Reuters', date: '2024-01-24', category: 'Earnings' },
        { id: 2, title: 'Apple Vision Pro Pre-Orders Exceed Expectations', summary: 'Apple\'s mixed reality headset sees strong pre-order demand with extended shipping times.', source: 'TechCrunch', date: '2024-01-22', category: 'Product' },
        { id: 3, title: 'Apple Expands AI Capabilities with New Machine Learning Framework', summary: 'Apple introduces new AI development tools for iOS and macOS applications.', source: 'Apple News', date: '2024-01-20', category: 'Technology' }
      ],
      'MSFT': [
        { id: 1, title: 'Microsoft Azure Revenue Grows 30% in Latest Quarter', summary: 'Microsoft reports strong cloud growth with Azure leading the charge in enterprise adoption.', source: 'Reuters', date: '2024-01-24', category: 'Earnings' },
        { id: 2, title: 'Microsoft Copilot Integration Expands Across Office Suite', summary: 'Microsoft announces broader AI integration across its productivity applications.', source: 'TechCrunch', date: '2024-01-22', category: 'Product' },
        { id: 3, title: 'Microsoft Teams Reaches 300 Million Monthly Active Users', summary: 'Microsoft Teams continues to grow as the leading enterprise communication platform.', source: 'Microsoft News', date: '2024-01-20', category: 'Business' }
      ],
      'NVDA': [
        { id: 1, title: 'NVIDIA Reports Record Data Center Revenue on AI Demand', summary: 'NVIDIA sees unprecedented demand for AI chips driving record quarterly revenue.', source: 'Reuters', date: '2024-01-24', category: 'Earnings' },
        { id: 2, title: 'NVIDIA Announces Next-Generation AI Supercomputer', summary: 'NVIDIA unveils new AI supercomputing platform for enterprise and research applications.', source: 'TechCrunch', date: '2024-01-22', category: 'Product' },
        { id: 3, title: 'NVIDIA Partners with Major Cloud Providers for AI Infrastructure', summary: 'NVIDIA expands partnerships with AWS, Azure, and GCP for AI computing solutions.', source: 'NVIDIA News', date: '2024-01-20', category: 'Partnerships' }
      ],
      'AMZN': [
        { id: 1, title: 'Amazon Web Services Revenue Surges on Enterprise Adoption', summary: 'AWS continues to lead cloud computing market with strong enterprise customer growth.', source: 'Reuters', date: '2024-01-24', category: 'Earnings' },
        { id: 2, title: 'Amazon Prime Video Expands Original Content Library', summary: 'Amazon announces new original series and movies for Prime Video streaming service.', source: 'Variety', date: '2024-01-22', category: 'Entertainment' },
        { id: 3, title: 'Amazon Logistics Achieves Carbon Neutral Delivery Milestone', summary: 'Amazon reaches carbon neutral delivery goals ahead of schedule in major markets.', source: 'Amazon News', date: '2024-01-20', category: 'Sustainability' }
      ],
      'META': [
        { id: 1, title: 'Meta Reality Labs Revenue Grows Despite VR Market Challenges', summary: 'Meta reports strong growth in Reality Labs division despite broader VR market headwinds.', source: 'Reuters', date: '2024-01-24', category: 'Earnings' },
        { id: 2, title: 'Meta Announces New AI Assistant for WhatsApp and Messenger', summary: 'Meta introduces AI-powered assistant across its messaging platforms.', source: 'TechCrunch', date: '2024-01-22', category: 'Product' },
        { id: 3, title: 'Meta Horizon Worlds Expands to New Markets', summary: 'Meta\'s virtual reality platform expands availability to additional countries.', source: 'Meta News', date: '2024-01-20', category: 'VR' }
      ],
      'TSLA': [
        { id: 1, title: 'Tesla Reports Record Vehicle Deliveries in Q4', summary: 'Tesla achieves record quarterly deliveries with strong Model Y and Model 3 sales.', source: 'Reuters', date: '2024-01-24', category: 'Earnings' },
        { id: 2, title: 'Tesla Cybertruck Production Ramps Up at Giga Texas', summary: 'Tesla increases Cybertruck production capacity at its Austin manufacturing facility.', source: 'Tesla News', date: '2024-01-22', category: 'Production' },
        { id: 3, title: 'Tesla Supercharger Network Expands to 50,000 Stations Globally', summary: 'Tesla reaches milestone of 50,000 Supercharger stations worldwide.', source: 'Tesla News', date: '2024-01-20', category: 'Infrastructure' }
      ],
      'GS': [
        { id: 1, title: 'Goldman Sachs Reports Strong Investment Banking Revenue', summary: 'Goldman Sachs sees robust growth in investment banking and trading divisions.', source: 'Reuters', date: '2024-01-24', category: 'Earnings' },
        { id: 2, title: 'Goldman Sachs Expands Digital Banking Platform', summary: 'Goldman Sachs announces expansion of Marcus digital banking services.', source: 'Financial Times', date: '2024-01-22', category: 'Digital Banking' },
        { id: 3, title: 'Goldman Sachs Leads $2B Green Bond Issuance', summary: 'Goldman Sachs underwrites major green bond for renewable energy projects.', source: 'Bloomberg', date: '2024-01-20', category: 'ESG' }
      ],
      'COIN': [
        { id: 1, title: 'Coinbase Reports Record Trading Volume on Bitcoin ETF Approval', summary: 'Coinbase sees unprecedented trading activity following Bitcoin ETF approvals.', source: 'Reuters', date: '2024-01-24', category: 'Earnings' },
        { id: 2, title: 'Coinbase Expands International Operations to New Markets', summary: 'Coinbase announces expansion into additional international cryptocurrency markets.', source: 'CoinDesk', date: '2024-01-22', category: 'Expansion' },
        { id: 3, title: 'Coinbase Launches New Institutional Trading Platform', summary: 'Coinbase introduces advanced trading tools for institutional cryptocurrency investors.', source: 'Coinbase News', date: '2024-01-20', category: 'Product' }
      ],
      'MSTR': [
        { id: 1, title: 'MicroStrategy Reports Strong Q4 Revenue on Bitcoin Holdings', summary: 'MicroStrategy sees significant gains from its Bitcoin treasury strategy.', source: 'Reuters', date: '2024-01-24', category: 'Earnings' },
        { id: 2, title: 'MicroStrategy Announces Additional Bitcoin Purchase', summary: 'MicroStrategy adds more Bitcoin to its corporate treasury holdings.', source: 'Bitcoin Magazine', date: '2024-01-22', category: 'Bitcoin' },
        { id: 3, title: 'MicroStrategy Business Intelligence Platform Sees Growth', summary: 'MicroStrategy\'s core BI business continues to expand despite Bitcoin focus.', source: 'MicroStrategy News', date: '2024-01-20', category: 'Business' }
      ],
      'IBM': [
        { id: 1, title: 'IBM Reports Strong Q4 2023 Earnings, AI Revenue Grows 20%', summary: 'International Business Machines Corporation reported better-than-expected fourth quarter earnings, with AI and cloud revenue showing significant growth.', source: 'Reuters', date: '2024-01-24', category: 'Earnings' },
        { id: 2, title: 'IBM Partners with Major Cloud Providers for Hybrid AI Solutions', summary: 'IBM announces strategic partnerships with leading cloud providers to enhance hybrid AI capabilities for enterprise customers.', source: 'TechCrunch', date: '2024-01-22', category: 'Partnerships' },
        { id: 3, title: 'IBM Watson AI Platform Sees Record Adoption in Healthcare Sector', summary: 'Healthcare organizations are increasingly adopting IBM Watson AI solutions for diagnostic and treatment planning applications.', source: 'Healthcare IT News', date: '2024-01-20', category: 'Healthcare' }
      ]
    };
    
    return newsDatabase[symbol] || newsDatabase['IBM'];
  };

  const recentNews = getCompanyNews(companyData.symbol);

  // Dynamic options chain based on company
  const getCompanyOptions = (symbol: string, currentPrice: number): OptionContract[] => {
    const baseStrikes = [
      currentPrice * 0.9, currentPrice * 0.95, currentPrice, currentPrice * 1.05, currentPrice * 1.1
    ].map(price => Math.round(price));
    
    const expirations = ['2024-01-19', '2024-02-16', '2024-03-15', '2024-04-19'];
    const options: OptionContract[] = [];
    let id = 1;
    
    expirations.forEach(exp => {
      baseStrikes.forEach(strike => {
        // Call options
        options.push({
          id: id++,
          symbol,
          type: 'CALL',
          strike,
          expiration: exp,
          bid: Math.max(0.1, (strike - currentPrice) * 0.1 + Math.random() * 2),
          ask: Math.max(0.1, (strike - currentPrice) * 0.1 + Math.random() * 2 + 0.3),
          volume: Math.floor(Math.random() * 2000) + 100,
          openInterest: Math.floor(Math.random() * 10000) + 1000,
          impliedVolatility: 0.2 + Math.random() * 0.3
        });
        
        // Put options
        options.push({
          id: id++,
          symbol,
          type: 'PUT',
          strike,
          expiration: exp,
          bid: Math.max(0.1, (currentPrice - strike) * 0.1 + Math.random() * 2),
          ask: Math.max(0.1, (currentPrice - strike) * 0.1 + Math.random() * 2 + 0.3),
          volume: Math.floor(Math.random() * 2000) + 100,
          openInterest: Math.floor(Math.random() * 10000) + 1000,
          impliedVolatility: 0.2 + Math.random() * 0.3
        });
      });
    });
    
    return options;
  };

  const optionsChain = getCompanyOptions(companyData.symbol, companyData.price);

  const isPositive = companyData.change >= 0;

  return (
    <div className="min-h-screen bg-[#0b0c0f] pt-14 sm:pt-16">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{companyData.symbol}</h1>
              <div className="flex items-center space-x-2">
                {isPositive ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm sm:text-lg font-bold break-words ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  ${companyData.price.toFixed(2)} ({isPositive ? '+' : ''}{companyData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* Company Info Card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{companyData.fullName}</h2>
              <p className="text-gray-300 leading-relaxed mb-4">{companyData.description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Market Cap</p>
                  <p className="text-lg font-bold text-white">{companyData.marketCap}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Volume</p>
                  <p className="text-lg font-bold text-white">{companyData.volume}</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-[#2a2a2a]">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Founded: {companyData.founded}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{companyData.headquarters}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{companyData.employees} employees</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300">
                    <span>Official Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#2a2a2a]'
            }`}
          >
            Overview & News
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'options'
                ? 'bg-blue-600 text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#2a2a2a]'
            }`}
          >
            Options Chain
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent News */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent News</h3>
              <div className="space-y-4">
                {recentNews.map((article) => (
                  <div key={article.id} className="border-b border-[#2a2a2a] pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-white hover:text-blue-400 cursor-pointer transition-colors">
                        {article.title}
                      </h4>
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                        {article.category}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{article.summary}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{article.source}</span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Sector</p>
                  <p className="text-white">{companyData.sector}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Industry</p>
                  <p className="text-white">{companyData.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">CEO</p>
                  <p className="text-white">{companyData.ceo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Headquarters</p>
                  <p className="text-white">{companyData.headquarters}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'options' && (
          <div className="space-y-6">
            {/* Greeks Analysis Header */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Greeks Analysis</h3>
                    <p className="text-sm text-gray-400">Options risk visualization for {companyData.symbol} at ${companyData.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Current Price</div>
                  <div className="text-lg font-bold text-white">${companyData.price.toFixed(2)}</div>
                </div>
              </div>
              
              {/* Greek Toggle Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveGreek('theta')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeGreek === 'theta'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#3a3a3a]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Theta (Time Decay)
                  </div>
                </button>
                <button
                  onClick={() => setActiveGreek('gamma')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeGreek === 'gamma'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#3a3a3a]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Gamma (Acceleration)
                  </div>
                </button>
                <button
                  onClick={() => setActiveGreek('delta')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeGreek === 'delta'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#3a3a3a]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Delta (Price Sensitivity)
                  </div>
                </button>
              </div>
            </div>

            {/* Greeks Dot Plot Visualization */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {['2024-01-19', '2024-02-16', '2024-03-15', '2024-04-19'].map(exp => {
                  const expOptions = optionsChain.filter(opt => opt.expiration === exp);
                  const daysToExp = Math.ceil((new Date(exp).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={exp} className="space-y-3">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white">
                          {new Date(exp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-400">{daysToExp} days</div>
                      </div>
                      
                      {/* Dot Plot */}
                      <div className="space-y-2">
                        {expOptions
                          .sort((a, b) => a.strike - b.strike)
                          .map(option => {
                            const { dotSize, dotColor, greekValue } = getDotProperties(option, companyData.price);
                            
                            return (
                              <div key={`${option.strike}-${exp}`} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="rounded-full"
                                    style={{
                                      width: `${dotSize}px`,
                                      height: `${dotSize}px`,
                                      backgroundColor: dotColor
                                    }}
                                  ></div>
                                  <div className="text-xs text-gray-300">
                                    ${option.strike}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {greekValue.toFixed(3)}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Legend and Formula */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                <h5 className="text-sm font-semibold text-white mb-3">
                  {activeGreek === 'theta' ? 'Time Decay Intensity' : 
                   activeGreek === 'gamma' ? 'Price Acceleration' : 
                   'Price Sensitivity'}
                </h5>
                <div className="space-y-2">
                  {activeGreek === 'theta' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-gray-300">ATM Options (Fastest Decay)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs text-gray-300">High Decay</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-300">Low Decay</span>
                      </div>
                    </>
                  ) : activeGreek === 'gamma' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs text-gray-300">High Acceleration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
                        <span className="text-xs text-gray-300">Medium Acceleration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-300">Low Acceleration</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-300">High Sensitivity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-xs text-gray-300">Medium Sensitivity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                        <span className="text-xs text-gray-300">Low Sensitivity</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                <h5 className="text-sm font-semibold text-white mb-3">
                  {activeGreek === 'theta' ? 'Theta Formula' : 
                   activeGreek === 'gamma' ? 'Gamma Formula' : 
                   'Delta Formula'}
                </h5>
                <div className="text-xs text-gray-300 space-y-1">
                  {activeGreek === 'theta' ? (
                    <>
                      <div><span className="text-blue-400">θ</span> = -e^(-2t) × (1 - |K/S - 1|) × 0.1</div>
                      <div><span className="text-blue-400">t</span> = Time to expiration</div>
                      <div><span className="text-blue-400">K</span> = Strike price</div>
                      <div><span className="text-blue-400">S</span> = Current price (${companyData.price.toFixed(2)})</div>
                      <div className="text-yellow-400 mt-2">Larger dots = Faster decay</div>
                    </>
                  ) : activeGreek === 'gamma' ? (
                    <>
                      <div><span className="text-blue-400">γ</span> = N'(d1) / (S × σ × √T)</div>
                      <div><span className="text-blue-400">S</span> = Current price (${companyData.price.toFixed(2)})</div>
                      <div><span className="text-blue-400">σ</span> = Implied volatility</div>
                      <div><span className="text-blue-400">T</span> = Time to expiration</div>
                      <div className="text-yellow-400 mt-2">Larger dots = Higher acceleration</div>
                    </>
                  ) : (
                    <>
                      <div><span className="text-blue-400">Δ</span> = N(d1) for calls, N(d1) - 1 for puts</div>
                      <div><span className="text-blue-400">d1</span> = (ln(S/K) + (r + σ²/2)T) / (σ√T)</div>
                      <div><span className="text-blue-400">S</span> = Current price (${companyData.price.toFixed(2)})</div>
                      <div><span className="text-blue-400">K</span> = Strike price</div>
                      <div className="text-yellow-400 mt-2">Larger dots = Higher sensitivity</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

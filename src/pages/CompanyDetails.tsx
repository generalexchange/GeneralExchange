/**
 * Wikipedia-inspired company details page
 * Shows company bio, recent news, and options chain
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Users, MapPin, Globe, ExternalLink } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
  const priceSeries = Array.from({ length: 12 }, (_, i) => {
    const drift = (i - 6) * (companyData.change / 18);
    const wave = Math.sin(i * 0.65) * Math.max(0.18, Math.abs(companyData.change) * 0.08);
    const close = Number((companyData.price + drift + wave).toFixed(2));
    return { t: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`, p: close };
  });

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

        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Current Price</h3>
                <span className="text-sm font-mono text-gray-300">${companyData.price.toFixed(2)}</span>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceSeries}>
                    <XAxis dataKey="t" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} width={44} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip
                      contentStyle={{ background: '#0b0b0b', border: '1px solid #27272a', borderRadius: '8px' }}
                      labelStyle={{ color: '#a1a1aa' }}
                    />
                    <Line dataKey="p" type="monotone" stroke="#e4e4e7" strokeWidth={2.2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Options Chain</h3>
              <p className="text-xs text-gray-500 mb-3">Placed in the main overview area. Premiums are synthetic mock values.</p>
              <div className="overflow-auto max-h-[430px] border border-[#2a2a2a] rounded-lg">
                <table className="w-full min-w-[620px] text-xs border-collapse">
                  <thead className="sticky top-0 bg-[#151515] border-b border-[#2a2a2a]">
                    <tr className="text-gray-400">
                      <th className="p-2 text-left font-medium">Type</th>
                      <th className="p-2 text-left font-medium">Strike</th>
                      <th className="p-2 text-left font-medium">Expiry</th>
                      <th className="p-2 text-right font-medium">Bid</th>
                      <th className="p-2 text-right font-medium">Ask</th>
                      <th className="p-2 text-right font-medium">Vol</th>
                      <th className="p-2 text-right font-medium">OI</th>
                      <th className="p-2 text-right font-medium">IV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optionsChain.slice(0, 28).map((opt) => (
                      <tr key={opt.id} className="border-b border-[#232323] last:border-0">
                        <td className="p-2 text-gray-200">{opt.type}</td>
                        <td className="p-2 text-white font-mono">${opt.strike.toFixed(0)}</td>
                        <td className="p-2 text-gray-300">{opt.expiration}</td>
                        <td className="p-2 text-right text-gray-300 font-mono">{opt.bid.toFixed(2)}</td>
                        <td className="p-2 text-right text-gray-300 font-mono">{opt.ask.toFixed(2)}</td>
                        <td className="p-2 text-right text-gray-400 font-mono">{opt.volume.toLocaleString()}</td>
                        <td className="p-2 text-right text-gray-400 font-mono">{opt.openInterest.toLocaleString()}</td>
                        <td className="p-2 text-right text-gray-300 font-mono">{(opt.impliedVolatility * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent News</h3>
            <div className="space-y-4">
              {recentNews.map((article) => (
                <div key={article.id} className="border-b border-[#2a2a2a] pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <h4 className="text-base font-semibold text-white">{article.title}</h4>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded whitespace-nowrap">{article.category}</span>
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

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent News Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentNews.map((article) => (
                <div key={`detail-${article.id}`} className="border border-[#2a2a2a] rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">{article.source} · {article.date}</p>
                  <p className="text-sm text-white font-medium mb-2">{article.title}</p>
                  <p className="text-sm text-gray-300">{article.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

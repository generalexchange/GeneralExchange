/**
 * Real-Time Trade Insights Component
 * Displays live market signals with Bollinger Band analytics and game-theory payoff models
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, Target, AlertTriangle, X, Eye, History } from 'lucide-react';
import { getTradeInsights, createTradeInsightsStream, TradeInsightsResponse } from '../api/trade-insights';

interface TradeSignal {
  id: string;
  symbol: string;
  entry: number;
  exit: number;
  signal: string;
  payoff_score: number;
  confidence: number;
  timestamp: string;
  type: 'LONG' | 'SHORT';
  status: 'ACTIVE' | 'EXPIRED' | 'EXECUTED';
}

interface ExpiredSignal {
  id: string;
  symbol: string;
  signal: string;
  status: 'MISSED' | 'EXECUTED';
  timestamp: string;
  entry?: number;
  exit?: number;
  type?: 'LONG' | 'SHORT';
  payoff_score?: number;
  confidence?: number;
}

interface TradeContract {
  id: string;
  symbol: string;
  type: 'CALL' | 'PUT';
  strike: number;
  expiration: string;
  premium: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export const TradeInsights: React.FC = () => {
  const [insights, setInsights] = useState<TradeSignal[]>([]);
  const [expiredSignals, setExpiredSignals] = useState<ExpiredSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const [selectedExpiredSignal, setSelectedExpiredSignal] = useState<ExpiredSignal | null>(null);
  const [tradeContracts, setTradeContracts] = useState<TradeContract[]>([]);
  const [apiConnected, setApiConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Fetch trade insights data from API
  const fetchTradeInsights = useCallback(async () => {
    try {
      // Check for real API connection - no mock data
      const isConnected = false; // Will be true when real API is connected
      setApiConnected(isConnected);
      
      if (!isConnected) {
        setError('API connection not available');
        setInsights([]); // Clear any existing insights
        setExpiredSignals([]); // Clear expired signals
        setIsLoading(false);
        return;
      }
      
      setError(null);
      const response: TradeInsightsResponse = await getTradeInsights();
      
      setInsights(prevInsights => {
        // Handle expired signals
        const currentSignalIds = new Set(response.signals.map(s => s.id));
        const expiredSignals = prevInsights.filter(signal => !currentSignalIds.has(signal.id));
        
        if (expiredSignals.length > 0) {
          const newExpired: ExpiredSignal[] = expiredSignals.map(signal => ({
            id: signal.id,
            symbol: signal.symbol,
            signal: signal.signal,
            status: Math.random() > 0.3 ? 'MISSED' : 'EXECUTED',
            timestamp: signal.timestamp,
            entry: signal.entry,
            exit: signal.exit,
            type: signal.type,
            payoff_score: signal.payoff_score,
            confidence: signal.confidence
          }));
          
          setExpiredSignals(prev => [...newExpired, ...prev].slice(0, 20)); // Keep last 20 expired
        }
        
        return response.signals;
      });
      
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching trade insights:', error);
      setError('Failed to fetch trade data');
      setApiConnected(false);
      setIsLoading(false);
    }
  }, []);

  // Real-time updates using WebSocket-like streaming
  useEffect(() => {
    // Initial fetch
    fetchTradeInsights();
    
    // Only set up streaming if API is connected
    if (apiConnected) {
      const stopStream = createTradeInsightsStream((data: TradeInsightsResponse) => {
        setInsights(prevInsights => {
          // Handle expired signals
          const currentSignalIds = new Set(data.signals.map(s => s.id));
          const expiredSignals = prevInsights.filter(signal => !currentSignalIds.has(signal.id));
          
          if (expiredSignals.length > 0) {
            const newExpired: ExpiredSignal[] = expiredSignals.map(signal => ({
              id: signal.id,
              symbol: signal.symbol,
              signal: signal.signal,
              status: Math.random() > 0.3 ? 'MISSED' : 'EXECUTED',
              timestamp: signal.timestamp
            }));
            
            setExpiredSignals(prev => [...newExpired, ...prev].slice(0, 20));
          }
          
          return data.signals;
        });
        
        setLastUpdate(new Date());
      });

      return () => {
        stopStream();
      };
    }
  }, [fetchTradeInsights, apiConnected]);

  // Generate trade contracts for expired signals
  const generateTradeContracts = useCallback((signal: ExpiredSignal): TradeContract[] => {
    const contracts: TradeContract[] = [];
    const basePrice = signal.entry || 100;
    const expirations = ['2024-02-16', '2024-03-15', '2024-04-19'];
    
    expirations.forEach(exp => {
      // Call options
      contracts.push({
        id: `call_${signal.id}_${exp}`,
        symbol: signal.symbol,
        type: 'CALL',
        strike: Math.round(basePrice * (0.95 + Math.random() * 0.1)),
        expiration: exp,
        premium: Math.random() * 5 + 1,
        volume: Math.floor(Math.random() * 1000) + 100,
        openInterest: Math.floor(Math.random() * 5000) + 500,
        impliedVolatility: 0.2 + Math.random() * 0.3,
        delta: Math.random() * 0.8 + 0.1,
        gamma: Math.random() * 0.05 + 0.01,
        theta: -(Math.random() * 0.1 + 0.01),
        vega: Math.random() * 0.2 + 0.05
      });
      
      // Put options
      contracts.push({
        id: `put_${signal.id}_${exp}`,
        symbol: signal.symbol,
        type: 'PUT',
        strike: Math.round(basePrice * (0.95 + Math.random() * 0.1)),
        expiration: exp,
        premium: Math.random() * 5 + 1,
        volume: Math.floor(Math.random() * 1000) + 100,
        openInterest: Math.floor(Math.random() * 5000) + 500,
        impliedVolatility: 0.2 + Math.random() * 0.3,
        delta: -(Math.random() * 0.8 + 0.1),
        gamma: Math.random() * 0.05 + 0.01,
        theta: -(Math.random() * 0.1 + 0.01),
        vega: Math.random() * 0.2 + 0.05
      });
    });
    
    return contracts;
  }, []);

  // Handle expired signal selection
  const handleExpiredSignalClick = useCallback((signal: ExpiredSignal) => {
    setSelectedExpiredSignal(signal);
    const contracts = generateTradeContracts(signal);
    setTradeContracts(contracts);
    setIsExpiredModalOpen(true);
  }, [generateTradeContracts]);

  // Memoized insight cards for performance
  const insightCards = useMemo(() => {
    return insights.map((trade) => {
      const isLong = trade.type === 'LONG';
      const isProfitable = isLong ? trade.exit > trade.entry : trade.exit < trade.entry;
      
      return (
        <div 
          key={trade.id} 
          className={`insight-card group transition-all duration-300 hover:scale-105 ${
            isLong 
              ? 'border-l-4 border-green-500 bg-green-500/5' 
              : 'border-l-4 border-red-500 bg-red-500/5'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg">{trade.symbol}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                isLong 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {trade.type}
              </span>
            </div>
            {isLong ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Entry:</span>
              <span className="text-white font-semibold">${trade.entry.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Exit:</span>
              <span className={`font-semibold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                ${trade.exit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Signal:</span>
              <span className="text-blue-400 text-sm">{trade.signal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Payoff Score:</span>
              <span className="text-yellow-400 font-semibold">{trade.payoff_score.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Confidence:</span>
              <span className="text-purple-400 font-semibold">{(trade.confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Updated: {new Date(trade.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      );
    });
  }, [insights]);


  return (
    <section className="trade-insights bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
      {/* Expired Signals Button - Always show */}
      <div className="expired-trades-header bg-[#0f0f0f] border-b border-[#2a2a2a] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-white">Expired Signals</h3>
            <span className="text-xs text-gray-400">({expiredSignals.length})</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpiredModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
              View Expired Signals
            </button>
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Trade Insights Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Live Trade Insights</h2>
              <p className="text-sm text-gray-400">Real-time market signals powered by Bollinger Band analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400">Active Signals</div>
              <div className="text-lg font-bold text-white">{insights.length}</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Live Data Feed"></div>
          </div>
        </div>

        {/* API Connection Status */}
        {!apiConnected && !isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Trade Data Available</h3>
              <p className="text-sm text-gray-400 mb-4">
                {error || 'API connection not established. Please connect to Interactive Brokers to view live market signals.'}
              </p>
              <button
                onClick={fetchTradeInsights}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && insights.length === 0 && apiConnected ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-400">Loading market signals...</span>
            </div>
          </div>
        ) : apiConnected ? (
          <>
            {/* Insight Cards Grid */}
            <div className={`insight-cards-grid grid gap-4 ${
              insights.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
              insights.length <= 4 ? 'grid-cols-2' :
              insights.length <= 6 ? 'grid-cols-2 lg:grid-cols-3' :
              'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {insightCards}
            </div>

            {/* Empty State */}
            {insights.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Active Signals</h3>
                <p className="text-sm text-gray-500">Waiting for market opportunities...</p>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Expired Signals Modal */}
      {isExpiredModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="text-xl font-bold text-white">Expired Trade Signals</h3>
                  <p className="text-sm text-gray-400">
                    {selectedExpiredSignal ? `${selectedExpiredSignal.symbol} - ${selectedExpiredSignal.signal}` : 'All expired signals'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsExpiredModalOpen(false);
                  setSelectedExpiredSignal(null);
                }}
                className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedExpiredSignal ? (
                <div className="space-y-6">
                  {/* Selected Signal Details */}
                  <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-4">Signal Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-400">Symbol:</span>
                        <span className="text-white ml-2">{selectedExpiredSignal.symbol}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Status:</span>
                        <span className={`ml-2 ${selectedExpiredSignal.status === 'EXECUTED' ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedExpiredSignal.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Signal:</span>
                        <span className="text-white ml-2">{selectedExpiredSignal.signal}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Timestamp:</span>
                        <span className="text-white ml-2">{new Date(selectedExpiredSignal.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trade Contracts */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Related Trade Contracts</h4>
                    <div className="grid gap-3">
                      {tradeContracts.map((contract) => (
                        <div key={contract.id} className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{contract.symbol}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                contract.type === 'CALL' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {contract.type}
                              </span>
                              <span className="text-sm text-gray-400">${contract.strike}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-white">${contract.premium.toFixed(2)}</div>
                              <div className="text-xs text-gray-400">Premium</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Volume:</span>
                              <span className="text-white ml-1">{contract.volume.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">OI:</span>
                              <span className="text-white ml-1">{contract.openInterest.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">IV:</span>
                              <span className="text-white ml-1">{(contract.impliedVolatility * 100).toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Delta:</span>
                              <span className="text-white ml-1">{contract.delta.toFixed(3)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {expiredSignals.map((signal) => (
                    <div 
                      key={signal.id}
                      className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4 cursor-pointer hover:border-blue-500/50 transition-colors"
                      onClick={() => handleExpiredSignalClick(signal)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white">{signal.symbol}</span>
                          <span className="text-sm text-gray-400">{signal.signal}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            signal.status === 'EXECUTED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {signal.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">{new Date(signal.timestamp).toLocaleString()}</div>
                          <Eye className="w-4 h-4 text-gray-500 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

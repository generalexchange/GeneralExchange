import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

interface GreeksHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  companyName: string;
}

interface OptionData {
  strike: number;
  expiration: string;
  theta: number;
  gamma: number;
  delta: number;
  vega: number;
  rho: number;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
}

interface GreeksHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  companyName: string;
}

export const GreeksHeatmapModal: React.FC<GreeksHeatmapModalProps> = ({ 
  isOpen, 
  onClose, 
  symbol, 
  companyName 
}) => {
  const [activeGreek, setActiveGreek] = useState<'theta' | 'gamma' | 'delta'>('theta');
  const [optionsData, setOptionsData] = useState<OptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);

  // Mock data generation - replace with real WebSocket data
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate data loading
      setTimeout(() => {
        const mockData = generateMockOptionsData(symbol);
        setOptionsData(mockData);
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen, symbol]);

  const generateMockOptionsData = (symbol: string): OptionData[] => {
    const strikes = [90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150];
    const expirations = ['2024-01-19', '2024-02-16', '2024-03-15', '2024-04-19'];
    const data: OptionData[] = [];
    
    // Set current price based on symbol
    const basePrice = symbol === 'TSLA' ? 258 : symbol === 'NVDA' ? 456 : symbol === 'AAPL' ? 178 : 100;
    setCurrentPrice(basePrice);

    strikes.forEach(strike => {
      expirations.forEach(expiration => {
        const timeToExp = (new Date(expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365);
        const moneyness = strike / basePrice;
        
        // Theta decay formula: faster decay for ATM options and shorter time
        const thetaDecay = -Math.exp(-timeToExp * 2) * (1 - Math.abs(moneyness - 1)) * 0.1;
        
        data.push({
          strike,
          expiration,
          theta: thetaDecay,
          gamma: Math.random() * 0.05 + 0.01,
          delta: Math.random() * 0.8 + 0.1,
          vega: Math.random() * 0.3 + 0.1,
          rho: Math.random() * 0.1 + 0.01,
          bid: Math.random() * 10 + 1,
          ask: Math.random() * 10 + 1,
          volume: Math.floor(Math.random() * 1000),
          openInterest: Math.floor(Math.random() * 5000),
          impliedVolatility: Math.random() * 0.5 + 0.2
        });
      });
    });

    return data;
  };


  const getExpirationGroups = () => {
    const groups: { [key: string]: OptionData[] } = {};
    optionsData.forEach(option => {
      if (!groups[option.expiration]) {
        groups[option.expiration] = [];
      }
      groups[option.expiration].push(option);
    });
    return groups;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Greeks Heatmap - {symbol}
              </h3>
              <p className="text-xs text-gray-400">{companyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Greeks Toggle Header */}
        <div className="p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <h4 className="text-lg font-semibold text-white">Greeks Analysis</h4>
                <p className="text-sm text-gray-400">Options risk visualization for {symbol} at ${currentPrice.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Current Price</div>
              <div className="text-lg font-bold text-white">${currentPrice.toFixed(2)}</div>
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

        {/* Content - Dot Plot */}
        <div className="p-4 overflow-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400">Loading options data...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dot Plot Visualization */}
              <div className="bg-[#0f0f0f] rounded-lg p-6">
                <div className="grid grid-cols-4 gap-6">
                  {Object.keys(getExpirationGroups()).map(exp => {
                    const expOptions = getExpirationGroups()[exp];
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
                              const moneyness = option.strike / currentPrice;
                              const isATM = Math.abs(moneyness - 1) < 0.05;
                              
                              // Get the active Greek value
                              const greekValue = activeGreek === 'theta' ? option.theta : 
                                               activeGreek === 'gamma' ? option.gamma : 
                                               option.delta;
                              
                              // Calculate dot properties based on active Greek
                              let dotSize, dotColor, intensity;
                              
                              if (activeGreek === 'theta') {
                                intensity = Math.abs(greekValue);
                                dotSize = Math.max(4, Math.min(20, intensity * 200));
                                dotColor = isATM ? '#ef4444' : intensity > 0.05 ? '#f59e0b' : '#10b981';
                              } else if (activeGreek === 'gamma') {
                                intensity = Math.abs(greekValue);
                                dotSize = Math.max(4, Math.min(20, intensity * 1000));
                                dotColor = intensity > 0.03 ? '#f59e0b' : intensity > 0.01 ? '#eab308' : '#10b981';
                              } else { // delta
                                intensity = Math.abs(greekValue);
                                dotSize = Math.max(4, Math.min(20, intensity * 25));
                                dotColor = intensity > 0.7 ? '#3b82f6' : intensity > 0.3 ? '#60a5fa' : '#93c5fd';
                              }
                              
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

              {/* Dynamic Legend and Explanation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1a1a1a] rounded-lg p-4">
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
                
                <div className="bg-[#1a1a1a] rounded-lg p-4">
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
                        <div><span className="text-blue-400">S</span> = Current price (${currentPrice.toFixed(2)})</div>
                        <div className="text-yellow-400 mt-2">Larger dots = Faster decay</div>
                      </>
                    ) : activeGreek === 'gamma' ? (
                      <>
                        <div>
                          <span className="text-blue-400">γ</span> = N&apos;(d1) / (S × σ × √T)
                        </div>
                        <div><span className="text-blue-400">S</span> = Current price (${currentPrice.toFixed(2)})</div>
                        <div><span className="text-blue-400">σ</span> = Implied volatility</div>
                        <div><span className="text-blue-400">T</span> = Time to expiration</div>
                        <div className="text-yellow-400 mt-2">Larger dots = Higher acceleration</div>
                      </>
                    ) : (
                      <>
                        <div><span className="text-blue-400">Δ</span> = N(d1) for calls, N(d1) - 1 for puts</div>
                        <div><span className="text-blue-400">d1</span> = (ln(S/K) + (r + σ²/2)T) / (σ√T)</div>
                        <div><span className="text-blue-400">S</span> = Current price (${currentPrice.toFixed(2)})</div>
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
    </div>
  );
};

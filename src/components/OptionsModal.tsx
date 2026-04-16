/**
 * Options contract modal with risk heat map
 * Ready for Monte Carlo simulation integration
 */

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle } from 'lucide-react';

interface OptionsContract {
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
  totalValue: number;
  return: string;
}

interface OptionsModalProps {
  contract: OptionsContract | null;
  isOpen: boolean;
  onClose: () => void;
}

interface RiskMetrics {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

interface MonteCarloData {
  scenarios: number;
  confidenceLevels: {
    '95%': { min: number; max: number };
    '90%': { min: number; max: number };
    '80%': { min: number; max: number };
  };
  expectedReturn: number;
  volatility: number;
  skewness: number;
  kurtosis: number;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({ contract, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'montecarlo'>('overview');
  const [heatMapData, setHeatMapData] = useState<number[][]>([]);
  const [monteCarloData, setMonteCarloData] = useState<MonteCarloData | null>(null);

  console.log('OptionsModal rendered:', { contract, isOpen });

  // Mock risk metrics - will be replaced with real calculations
  const riskMetrics: RiskMetrics = {
    delta: contract?.type === 'CALL' ? 0.45 : -0.35,
    gamma: 0.02,
    theta: -0.15,
    vega: 0.08,
    rho: 0.03
  };

  // Generate mock heat map data - will be replaced with Monte Carlo results
  useEffect(() => {
    if (contract && isOpen) {
      // Mock 10x10 heat map representing price vs time scenarios
      const mockHeatMap = Array(10).fill(null).map(() => 
        Array(10).fill(null).map(() => Math.random() * 200 - 100)
      );
      setHeatMapData(mockHeatMap);

      // Mock Monte Carlo data
      setMonteCarloData({
        scenarios: 10000,
        confidenceLevels: {
          '95%': { min: -45, max: 180 },
          '90%': { min: -35, max: 165 },
          '80%': { min: -25, max: 145 }
        },
        expectedReturn: 12.5,
        volatility: 28.3,
        skewness: 0.8,
        kurtosis: 3.2
      });
    }
  }, [contract, isOpen]);

  console.log('Modal render check:', { isOpen, contract: !!contract });
  
  if (!isOpen || !contract) {
    console.log('Modal not rendering - conditions not met');
    return null;
  }
  
  console.log('Modal rendering with contract:', contract);

  const isProfit = contract.return.startsWith('+');

  // Calculate heat map color intensity
  const getHeatMapColor = (value: number) => {
    const intensity = Math.min(Math.abs(value) / 100, 1);
    const hue = value >= 0 ? 120 : 0; // Green for positive, red for negative
    return `hsla(${hue}, 70%, 50%, ${intensity})`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${
              isProfit 
                ? 'bg-green-500/20 border border-green-500/30' 
                : 'bg-red-500/20 border border-red-500/30'
            }`}>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{contract.symbol}</div>
                <div className="text-xs text-gray-400">${contract.strike}</div>
                <div className={`text-xs px-2 py-1 rounded mt-1 ${
                  contract.type === 'CALL' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {contract.type}
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white">
                {contract.symbol} ${contract.strike} {contract.type}
              </h2>
              <p className="text-gray-400">Expires {contract.expiration}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 px-6 border-b border-[#2a2a2a]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'risk'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Risk Metrics
          </button>
          <button
            onClick={() => setActiveTab('montecarlo')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'montecarlo'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monte Carlo
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Price Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Current Value</span>
                  </div>
                  <p className="text-xl font-bold text-white">${contract.totalValue.toLocaleString()}</p>
                </div>
                
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {isProfit ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                    <span className="text-xs text-gray-500">Return</span>
                  </div>
                  <p className={`text-xl font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                    {contract.return}
                  </p>
                </div>
                
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Volume</span>
                  </div>
                  <p className="text-xl font-bold text-white">{contract.volume.toLocaleString()}</p>
                </div>
                
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Implied Vol</span>
                  </div>
                  <p className="text-xl font-bold text-white">{(contract.impliedVolatility * 100).toFixed(1)}%</p>
                </div>
              </div>

              {/* Bid/Ask Spread */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Bid/Ask Spread</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Bid</p>
                    <p className="text-2xl font-bold text-green-500">${contract.bid.toFixed(2)}</p>
                  </div>
                  <div className="flex-1 h-px bg-gray-600"></div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Ask</p>
                    <p className="text-2xl font-bold text-red-500">${contract.ask.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-400">
                    Spread: ${(contract.ask - contract.bid).toFixed(2)} 
                    ({(((contract.ask - contract.bid) / contract.bid) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-yellow-500">Risk Metrics</h3>
                </div>
                <p className="text-sm text-gray-300">
                  These metrics will be calculated in real-time once Monte Carlo simulation is connected.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Delta (Δ)</h4>
                  <p className="text-2xl font-bold text-blue-400">{riskMetrics.delta.toFixed(3)}</p>
                  <p className="text-xs text-gray-400 mt-1">Price sensitivity</p>
                </div>
                
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Gamma (Γ)</h4>
                  <p className="text-2xl font-bold text-purple-400">{riskMetrics.gamma.toFixed(3)}</p>
                  <p className="text-xs text-gray-400 mt-1">Delta sensitivity</p>
                </div>
                
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Theta (Θ)</h4>
                  <p className="text-2xl font-bold text-orange-400">{riskMetrics.theta.toFixed(3)}</p>
                  <p className="text-xs text-gray-400 mt-1">Time decay</p>
                </div>
                
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Vega (ν)</h4>
                  <p className="text-2xl font-bold text-cyan-400">{riskMetrics.vega.toFixed(3)}</p>
                  <p className="text-xs text-gray-400 mt-1">Volatility sensitivity</p>
                </div>
                
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Rho (ρ)</h4>
                  <p className="text-2xl font-bold text-green-400">{riskMetrics.rho.toFixed(3)}</p>
                  <p className="text-xs text-gray-400 mt-1">Interest rate sensitivity</p>
                </div>
                
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Open Interest</h4>
                  <p className="text-2xl font-bold text-white">{contract.openInterest.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">Active contracts</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'montecarlo' && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-blue-500">Monte Carlo Simulation</h3>
                </div>
                <p className="text-sm text-gray-300">
                  Risk heat map showing potential outcomes. Will be powered by your Monte Carlo setup.
                </p>
              </div>

              {/* Simulation Stats */}
              {monteCarloData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <p className="text-sm text-gray-500">Scenarios</p>
                    <p className="text-xl font-bold text-white">{monteCarloData.scenarios.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <p className="text-sm text-gray-500">Expected Return</p>
                    <p className="text-xl font-bold text-green-400">{monteCarloData.expectedReturn.toFixed(1)}%</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <p className="text-sm text-gray-500">Volatility</p>
                    <p className="text-xl font-bold text-orange-400">{monteCarloData.volatility.toFixed(1)}%</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <p className="text-sm text-gray-500">Skewness</p>
                    <p className="text-xl font-bold text-purple-400">{monteCarloData.skewness.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {/* Risk Heat Map */}
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Risk Heat Map</h3>
                <div className="text-sm text-gray-400 mb-4">
                  Price scenarios vs Time to expiration (Mock data - will be replaced with Monte Carlo results)
                </div>
                
                <div className="grid grid-cols-10 gap-1 mb-4">
                  {heatMapData.map((row, rowIndex) => 
                    row.map((value, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: getHeatMapColor(value) }}
                      >
                        <span className="text-white drop-shadow-sm">
                          {value > 0 ? '+' : ''}{value.toFixed(0)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Lower Risk</span>
                  <span>Higher Risk</span>
                </div>
              </div>

              {/* Confidence Intervals */}
              {monteCarloData && (
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Confidence Intervals</h3>
                  <div className="space-y-3">
                    {Object.entries(monteCarloData.confidenceLevels).map(([level, range]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{level} Confidence</span>
                        <span className="text-sm font-semibold text-white">
                          ${range.min.toFixed(0)} to ${range.max.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

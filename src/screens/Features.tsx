/**
 * Features page - Learn More about General Exchange
 * Comprehensive overview of the algorithmic trading platform
 */

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  Shield,
  Brain,
  ArrowRight,
  BarChart3,
  Zap,
  Target,
  Cpu,
  Database,
  Eye,
  CheckCircle,
  AlertTriangle,
  Users,
  BookOpen,
  Play,
  Dice5,
  Workflow,
} from 'lucide-react';
import { FeaturesPlatformSections } from '../components/FeaturesPlatformSections';
import { Navbar } from '../components/Navbar';
import { ToolCard } from '../components/ToolCard';

const platformJumpLinks = [
  { href: '#feature-backtesting', label: 'Backtesting' },
  { href: '#feature-monte-carlo', label: 'Monte Carlo' },
  { href: '#feature-strategy', label: 'Strategy' },
  { href: '#feature-risk-management', label: 'Risk' },
  { href: '#feature-execution', label: 'Execution' },
  { href: '#feature-automation', label: 'Automation' },
  { href: '#feature-performance', label: 'Performance' },
] as const;

const TRADING_TOOLS = [
  {
    title: 'Backtesting Engine',
    description: 'Walk-forward validation, embargo windows, and execution-aware replay on tokenized AMD pools.',
    icon: BarChart3,
    to: '/features#feature-backtesting',
  },
  {
    title: 'Monte Carlo Simulator',
    description: 'Path-dependent scenarios, convergence metrics, and tail-risk visualisation at institutional scale.',
    icon: Dice5,
    to: '/features#feature-monte-carlo',
  },
  {
    title: 'Risk Modeling Suite',
    description: 'VaR-style grids, stress libraries, and reproducible seeds for second-line review.',
    icon: Shield,
    to: '/features#feature-risk-management',
  },
  {
    title: 'Strategy Builder',
    description: 'Compose signals, sizing rules, and release gates—then attach compute and lineage automatically.',
    icon: Workflow,
    to: '/features#feature-strategy',
  },
] as const;

export const Features: React.FC = () => {
  const pathname = usePathname();

  useEffect(() => {
    const scrollToHash = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      if (!hash) return;
      const id = hash.slice(1);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-charcoal">
      <Navbar showSearch={false} />

      <section className="relative overflow-hidden border-b border-white/[0.06] py-20 sm:py-28 pt-[calc(3.5rem+3rem)] sm:pt-[calc(3.75rem+4rem)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(46,90,58,0.12),transparent_50%)]" />
        <div className="relative max-w-content mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-tan mb-4">Trading tools</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-medium text-neutral-50 leading-tight mb-6">
              Institutional workflows on{' '}
              <span className="text-tan">tokenized AMD compute</span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-400 leading-relaxed mb-10 font-light">
              Train and test algorithms, run Monte Carlo and risk grids, and ship strategies—with the same restraint expected
              in English private wealth and exchange-grade infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-tan text-charcoal font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-tan/20 hover:bg-tan-muted group"
              >
                Launch Platform
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/[0.04] hover:bg-white/[0.07] text-neutral-100 font-semibold rounded-lg border border-white/10 transition-all duration-200"
              >
                Compute tokens
              </Link>
            </div>
            <p className="text-sm text-neutral-500 mt-12 mb-3 uppercase tracking-wider font-semibold">Deep dives</p>
            <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm" aria-label="Platform sections">
              {platformJumpLinks.map(({ href, label }) => (
                <a key={href} href={href} className="text-tan/90 hover:text-tan transition-colors">
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.06] bg-dark-gray/40 py-16 sm:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10">
          <h2 className="font-display text-2xl sm:text-3xl text-neutral-50 mb-3 text-center sm:text-left">Core tools</h2>
          <p className="text-neutral-400 text-sm max-w-2xl mb-10 text-center sm:text-left">
            Tan accents and institutional green hover states—each card links to the detailed chapter below.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {TRADING_TOOLS.map((tool, i) => (
              <ToolCard key={tool.title} {...tool} index={i} />
            ))}
          </div>
        </div>
      </section>

      <FeaturesPlatformSections />

      {/* About the Engine */}
      <section className="py-16 sm:py-24 bg-[#0f0f0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                The Quantitative Framework
              </h2>
              <p className="text-lg text-gray-400 mb-6">
                General Exchange merges mathematics, data science, and risk management into a unified framework. 
                It serves as a quant-driven layer between theoretical models (like Black-Scholes) and practical market execution.
              </p>
              <p className="text-lg text-gray-400 mb-8">
                Our platform integrates mathematical concepts into actionable signals through Delta and Gamma sensitivity modeling, 
                volatility surface interpolation, dynamic hedging via payoff symmetry, and time-series anomaly detection for volatility regime shifts.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-tan">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Real-time Analysis</span>
                </div>
                <div className="flex items-center space-x-2 text-tan">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">AI-Powered Insights</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Core Analytics</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-institutional-green/15 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-tan" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Delta-Based Momentum Engine</div>
                    <div className="text-sm text-gray-400">Evaluates option Delta changes relative to underlying price movements</div>
                  </div>
                      </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-institutional-green/15 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-institutional-green" />
                    </div>
                  <div>
                    <div className="text-white font-medium">Black-Scholes Risk Formatting</div>
                    <div className="text-sm text-gray-400">Computes theoretical values with volatility skew integration</div>
                      </div>
                    </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-tan/10 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-tan" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Machine Learning Clustering</div>
                    <div className="text-sm text-gray-400">Identifies latent structures in time-series data</div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

      {/* Key Features */}
      <section className="py-16 sm:py-24 bg-[#0b0c0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Advanced Analytics Engine
              </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Modular engines that can evolve independently within the platform, 
              each managing a specific part of the trading process.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Delta Momentum Engine */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-institutional-green/35 transition-colors">
              <div className="w-12 h-12 bg-institutional-green/15 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-tan" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Delta-Based Momentum Engine</h3>
              <p className="text-gray-400 mb-4">
                Evaluates how option Deltas change relative to underlying price movements, 
                identifying when Delta acceleration signals directional momentum.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Quantifies trend strength and potential reversals</li>
                <li>• Uses sensitivity data from option Greeks</li>
                <li>• Identifies momentum shifts in real-time</li>
              </ul>
            </div>

            {/* Black-Scholes Engine */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-institutional-green/35 transition-colors">
              <div className="w-12 h-12 bg-institutional-green/15 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-institutional-green" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Black-Scholes Risk Formatting</h3>
              <p className="text-gray-400 mb-4">
                Computes theoretical option values using the Black-Scholes-Merton model 
                and integrates volatility skew data to normalize risk.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Visual and numerical market pricing efficiency</li>
                <li>• Normalizes risk across strikes and expirations</li>
                <li>• Real-time theoretical value calculations</li>
              </ul>
            </div>

            {/* Bollinger Band Tracker */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-tan/40 transition-colors">
              <div className="w-12 h-12 bg-tan/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-tan" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Bollinger Band Volatility Tracker</h3>
              <p className="text-gray-400 mb-4">
                Uses deviations from Bollinger midlines to define entry and exit thresholds, 
                combined with Delta analysis for dynamic rebalancing.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Highlights volatility compression and expansion</li>
                <li>• Dynamic rebalancing strategies</li>
                <li>• Entry and exit threshold optimization</li>
              </ul>
            </div>

            {/* Markov Chain Forecasting */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-institutional-green/30 transition-colors">
              <div className="w-12 h-12 bg-tan/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-tan" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Markov Chain Forecasting</h3>
              <p className="text-gray-400 mb-4">
                Analyzes probabilistic state transitions in historical market data 
                to determine likely next-phase price behavior.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Transition probabilities between market states</li>
                <li>• Bullish, bearish, and neutral volatility states</li>
                <li>• Forward-looking market behavior prediction</li>
              </ul>
            </div>

            {/* Monte Carlo Simulation */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-tan/35 transition-colors">
              <div className="w-12 h-12 bg-institutional-green/10 rounded-lg flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-institutional-green" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Monte Carlo Simulation</h3>
              <p className="text-gray-400 mb-4">
                Runs stochastic simulations across Delta shifts and implied volatility levels 
                to visualize potential payoff outcomes.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Forward-looking risk distributions</li>
                <li>• Confidence intervals for position sizing</li>
                <li>• Stochastic scenario modeling</li>
              </ul>
            </div>

            {/* Machine Learning */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-institutional-green/35 transition-colors">
              <div className="w-12 h-12 bg-tan/10 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-tan" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Unsupervised Machine Learning</h3>
              <p className="text-gray-400 mb-4">
                Utilizes k-means and PCA-style clustering to identify latent structures 
                in time-series price and volatility data.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Detects regime shifts and outlier events</li>
                <li>• Adaptive algorithmic strategy selection</li>
                <li>• Pattern recognition in market data</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Data Processing & Learning */}
      <section className="py-16 sm:py-24 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-6">Data Processing Pipeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-institutional-green/15 rounded-full flex items-center justify-center mt-1">
                    <Database className="w-3 h-3 text-tan" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Historical Data Collection</div>
                    <div className="text-sm text-gray-400">Bid/ask spreads, implied volatility metrics, and realized volatility</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-institutional-green/15 rounded-full flex items-center justify-center mt-1">
                    <Brain className="w-3 h-3 text-institutional-green" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Adaptive Model Calibration</div>
                    <div className="text-sm text-gray-400">Continuous learning from market data streams</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-tan/10 rounded-full flex items-center justify-center mt-1">
                    <Zap className="w-3 h-3 text-tan" />
                    </div>
                  <div>
                    <div className="text-white font-medium">Real-time Signal Generation</div>
                    <div className="text-sm text-gray-400">Live analysis and decision support</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Data Processing & Learning
              </h2>
              <p className="text-lg text-gray-400 mb-6">
                General Exchange collects, cleans, and feeds market data into its learning pipeline. 
                We use historical bid/ask spreads, implied volatility metrics, and realized volatility 
                for adaptive model calibration.
              </p>
              <p className="text-lg text-gray-400 mb-8">
                The system continuously refines signal weighting based on live data streams and backtested model accuracy, 
                learning from past trade efficiency to improve its signal-to-risk ratio over time.
              </p>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-tan">99.9%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-institutional-green">&lt;50ms</div>
                  <div className="text-sm text-gray-400">Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-tan">24/7</div>
                  <div className="text-sm text-gray-400">Monitoring</div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

      {/* Risk Visualization */}
      <section className="py-16 sm:py-24 bg-[#0b0c0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Risk Illustration & Visualization
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Generate intuitive risk visuals that help traders understand potential outcomes 
              before executing strategies.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
              <div className="w-12 h-12 bg-institutional-green/15 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-tan" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Payoff Cones</h3>
              <p className="text-gray-400">
                Visualize potential profit/loss scenarios across multiple time horizons 
                with statistical confidence intervals.
              </p>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
              <div className="w-12 h-12 bg-institutional-green/15 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-institutional-green" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Volatility Heatmaps</h3>
              <p className="text-gray-400">
                Identify volatility clustering patterns and regime shifts 
                through interactive heatmap visualizations.
              </p>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
              <div className="w-12 h-12 bg-tan/10 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-tan" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Monte Carlo Projections</h3>
              <p className="text-gray-400">
                Rolling Monte Carlo projections show forward-looking risk distributions 
                and confidence intervals for position sizing.
              </p>
            </div>
            </div>
          </div>
        </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-24 bg-[#0f0f0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Use Cases
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              General Exchange serves diverse trading professionals and institutions 
              seeking advanced algorithmic capabilities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-institutional-green/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-tan" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Quantitative Hedge Funds</h3>
              <p className="text-gray-400">
                Advanced modeling and risk management for institutional trading strategies.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-institutional-green/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-institutional-green" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Retail Options Traders</h3>
              <p className="text-gray-400">
                Statistical edge and professional-grade analysis tools for individual traders.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-tan/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-tan" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Academic Research</h3>
              <p className="text-gray-400">
                Applied finance research and market data visualization for risk assessment.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-institutional-green/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-institutional-green" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Risk Management</h3>
              <p className="text-gray-400">
                Portfolio risk assessment and dynamic hedging strategies for institutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Safety */}
      <section className="py-16 sm:py-24 bg-[#0b0c0f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8">
            <div className="w-16 h-16 bg-tan/10 rounded-xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-tan" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Compliance & Safety
            </h2>
            <p className="text-lg text-gray-400 mb-6">
              All trading involves risk. No algorithm can guarantee profits. 
              Past performance does not predict future results.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Model Interpretability</h3>
                <p className="text-gray-400 text-sm">
                  Our platform follows best practices for model interpretability, 
                  ensuring transparency in algorithmic decision-making.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Data Privacy</h3>
                <p className="text-gray-400 text-sm">
                  User data privacy is protected with enterprise-grade security 
                  and compliance with financial regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 sm:py-24 bg-[#0f0f0f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join the waitlist for early access or connect your brokerage APIs for simulation testing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/request-access"
              className="inline-flex items-center justify-center px-8 py-4 bg-institutional-green hover:bg-institutional-green-muted text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-institutional-green/25 hover:shadow-institutional-green/35 group"
            >
              Join Waitlist
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg border border-white/10 transition-all duration-200">
              <Play className="mr-2 w-5 h-5" />
              Run Demo Simulation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0b0c0f] border-t border-[#1a1a1a] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center">
              <span className="text-lg font-serif font-bold text-white">General Exchange</span>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} General Exchange. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
    </div>
  );
};
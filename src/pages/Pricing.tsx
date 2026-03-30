/**
 * Pricing page - subscription plans and pricing information
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SEO } from '../components/SEO';
import { Check, X } from 'lucide-react';

export const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for individual traders getting started',
      monthlyPrice: 49,
      annualPrice: 470,
      features: [
        { name: 'Up to 2 connected accounts', included: true },
        { name: 'Real-time risk analysis', included: true },
        { name: 'Basic alerts & notifications', included: true },
        { name: 'News integration', included: true },
        { name: 'Mobile app access', included: true },
        { name: 'Email support', included: true },
        { name: 'Advanced analytics', included: false },
        { name: 'Custom risk models', included: false },
        { name: 'API access', included: false },
        { name: 'Priority support', included: false }
      ],
      popular: false
    },
    {
      name: 'Professional',
      description: 'For serious traders managing multiple positions',
      monthlyPrice: 149,
      annualPrice: 1430,
      features: [
        { name: 'Up to 10 connected accounts', included: true },
        { name: 'Real-time risk analysis', included: true },
        { name: 'Advanced alerts & notifications', included: true },
        { name: 'News integration', included: true },
        { name: 'Mobile app access', included: true },
        { name: 'Priority email support', included: true },
        { name: 'Advanced analytics dashboard', included: true },
        { name: 'Custom risk models', included: true },
        { name: 'Backtesting tools', included: true },
        { name: 'API access (Standard)', included: false }
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'For institutions and professional trading teams',
      monthlyPrice: 499,
      annualPrice: 4790,
      features: [
        { name: 'Unlimited connected accounts', included: true },
        { name: 'Real-time risk analysis', included: true },
        { name: 'Advanced alerts & notifications', included: true },
        { name: 'News integration', included: true },
        { name: 'Mobile app access', included: true },
        { name: '24/7 phone & email support', included: true },
        { name: 'Advanced analytics dashboard', included: true },
        { name: 'Custom risk models', included: true },
        { name: 'Backtesting tools', included: true },
        { name: 'Full API access', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'Custom integrations', included: true }
      ],
      popular: false
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavings = (plan: typeof plans[0]) => {
    const monthlyTotal = plan.monthlyPrice * 12;
    const savings = monthlyTotal - plan.annualPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { amount: savings, percentage };
  };

  return (
    <div className="min-h-screen bg-[#0b0c0f]">
      <SEO 
        title="Pricing Plans - Affordable Trading Solutions"
        description="Transparent pricing for professional traders. Choose from Starter ($49/mo), Professional ($149/mo), or Enterprise ($499/mo) plans. 14-day free trial, no credit card required."
        keywords="trading platform pricing, trading software cost, options trading subscription, professional trading plans, trading platform cost"
        canonical="https://generalexchange.com/pricing"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'General Exchange Subscription',
          offers: [
            {
              '@type': 'Offer',
              name: 'Starter Plan',
              price: '49.00',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock'
            },
            {
              '@type': 'Offer',
              name: 'Professional Plan',
              price: '149.00',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock'
            },
            {
              '@type': 'Offer',
              name: 'Enterprise Plan',
              price: '499.00',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock'
            }
          ]
        }}
      />
      <Navbar showSearch={false} />
      
      <div className="pt-14 sm:pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-[#0b0c0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                Choose the plan that's right for you. All plans include a 14-day free trial.
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-2 bg-[#1a1a1a] rounded-lg border border-white/10">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                    billingCycle === 'annual'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Annual
                  <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              {plans.map((plan) => {
                const savings = getSavings(plan);
                return (
                  <div
                    key={plan.name}
                    className={`relative bg-[#1a1a1a] rounded-xl border ${
                      plan.popular
                        ? 'border-blue-500 shadow-xl shadow-blue-600/20'
                        : 'border-white/10'
                    } p-8`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                      
                      <div className="mb-4">
                        <span className="text-5xl font-bold text-white">
                          ${getPrice(plan)}
                        </span>
                        <span className="text-gray-400 ml-2">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>

                      {billingCycle === 'annual' && (
                        <p className="text-green-400 text-sm">
                          Save ${savings.amount}/year ({savings.percentage}% off)
                        </p>
                      )}
                    </div>

                    <Link
                      to="/login"
                      className={`block w-full py-3 rounded-lg font-semibold text-center transition-colors mb-8 ${
                        plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                      }`}
                    >
                      Start Free Trial
                    </Link>

                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature.name} className="flex items-start space-x-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                          )}
                          <span
                            className={`text-sm ${
                              feature.included ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-[#0b0c0f] border-t border-[#2a2a2a]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  What's included in the free trial?
                </h3>
                <p className="text-gray-400">
                  All plans include a full-featured 14-day free trial. No credit card required. You'll have access to all features of your chosen plan during the trial period.
                </p>
              </div>

              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  Can I switch plans later?
                </h3>
                <p className="text-gray-400">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.
                </p>
              </div>

              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-400">
                  We accept all major credit cards (Visa, MasterCard, American Express, Discover) and PayPal. Enterprise customers can also pay via wire transfer.
                </p>
              </div>

              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  Is there a refund policy?
                </h3>
                <p className="text-gray-400">
                  Yes. If you're not satisfied within the first 30 days, we'll provide a full refund, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Our team is here to help you choose the right plan
            </p>
            <Link
              to="/help-center"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              Contact Support
            </Link>
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


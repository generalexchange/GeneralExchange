/**
 * Our Team page - showcasing the General Exchange team
 */

import React from 'react';
import Image from 'next/image';
import { Navbar } from '../components/Navbar';
import { Linkedin, Mail } from 'lucide-react';

export const OurTeam: React.FC = () => {
  const teamMembers = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-Founder',
      bio: 'Former VP of Trading Technology at Goldman Sachs. 15+ years in algorithmic trading.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO & Co-Founder',
      bio: 'Ex-Bloomberg engineer. Built trading systems used by Fortune 500 companies.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Head of AI Research',
      bio: 'PhD in Machine Learning from MIT. Published researcher in quantitative finance.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop'
    },
    {
      name: 'James Park',
      role: 'Head of Product',
      bio: 'Previously led product at Thomson Reuters. Expert in financial data platforms.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop'
    },
    {
      name: 'Lisa Thompson',
      role: 'Head of Risk Management',
      bio: '20 years in risk management at JPMorgan and Credit Suisse.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
    },
    {
      name: 'David Kim',
      role: 'Head of Data Science',
      bio: 'Former quantitative analyst at Two Sigma. Specializes in predictive modeling.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0c0f]">
      <Navbar showSearch={false} />
      
      <div className="pt-14 sm:pt-16">
        {/* Hero Section */}
        <section className="py-20 sm:py-32 bg-[#0b0c0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Meet Our Team
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                A world-class team of traders, engineers, and data scientists building the future of algorithmic risk management
              </p>
            </div>

            {/* Team Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="group bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-blue-400 text-sm font-semibold mb-3">{member.role}</p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{member.bio}</p>
                    <div className="flex space-x-3">
                      <a
                        href="#"
                        className="w-8 h-8 bg-white/5 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Linkedin className="w-4 h-4 text-gray-400" />
                      </a>
                      <a
                        href="#"
                        className="w-8 h-8 bg-white/5 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Mail className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Company Values */}
        <section className="py-20 bg-[#0b0c0f] border-t border-[#2a2a2a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Values</h2>
              <p className="text-xl text-gray-400">The principles that guide everything we do</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Precision</h3>
                <p className="text-gray-400">
                  We believe in data-driven decisions and building tools that provide accurate, actionable insights.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Security</h3>
                <p className="text-gray-400">
                  Protecting our users&apos; data and capital is our top priority. Enterprise-grade security in everything we
                  build.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Innovation</h3>
                <p className="text-gray-400">
                  Constantly pushing the boundaries of what&apos;s possible with AI and algorithmic trading technology.
                </p>
              </div>
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


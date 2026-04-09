/**
 * Community page - forums, discussions, and social features
 */

import React from 'react';
import { Navbar } from '../components/Navbar';
import { Users, MessageSquare, TrendingUp, Award, Calendar } from 'lucide-react';

export const Community: React.FC = () => {
  const stats = [
    { label: 'Active Members', value: '150K+', icon: Users },
    { label: 'Discussions', value: '45K+', icon: MessageSquare },
    { label: 'Success Stories', value: '12K+', icon: TrendingUp }
  ];

  const discussions = [
    {
      title: 'Best strategies for managing risk in volatile markets',
      author: 'TraderMike',
      replies: 234,
      likes: 567,
      category: 'Risk Management',
      time: '2 hours ago'
    },
    {
      title: 'How I used General Exchange to improve my win rate by 40%',
      author: 'QuantJess',
      replies: 156,
      likes: 892,
      category: 'Success Stories',
      time: '5 hours ago'
    },
    {
      title: 'Near-term trading algorithms: Deep dive discussion',
      author: 'AlgoExpert',
      replies: 89,
      likes: 421,
      category: 'Algorithms',
      time: '1 day ago'
    },
    {
      title: 'Setting up custom alerts for options trading',
      author: 'OptionsGuru',
      replies: 112,
      likes: 334,
      category: 'Tips & Tricks',
      time: '2 days ago'
    }
  ];

  const events = [
    {
      title: 'Monthly Trading Strategies Webinar',
      date: 'Oct 25, 2025',
      time: '2:00 PM EST',
      attendees: 1243
    },
    {
      title: 'Risk Management Workshop',
      date: 'Nov 2, 2025',
      time: '1:00 PM EST',
      attendees: 856
    },
    {
      title: 'AI in Trading: Panel Discussion',
      date: 'Nov 15, 2025',
      time: '3:00 PM EST',
      attendees: 2104
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0c0f]">
      <Navbar showSearch={false} />
      
      <div className="pt-14 sm:pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-[#0b0c0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Join Our Community
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Connect with thousands of traders, share strategies, and learn from the best
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="text-center p-8 bg-[#1a1a1a] border border-white/10 rounded-xl"
                  >
                    <Icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-gray-400">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Recent Discussions */}
        <section className="py-12 bg-[#0b0c0f] border-t border-[#2a2a2a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Trending Discussions</h2>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                New Discussion
              </button>
            </div>

            <div className="space-y-4">
              {discussions.map((discussion, index) => (
                <div
                  key={index}
                  className="p-6 bg-[#1a1a1a] border border-white/10 rounded-xl hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-blue-600/10 text-blue-400 text-xs font-semibold rounded-full">
                          {discussion.category}
                        </span>
                        <span className="text-gray-500 text-sm">{discussion.time}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{discussion.title}</h3>
                      <p className="text-gray-400 text-sm">
                        Started by <span className="text-blue-400">{discussion.author}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <span className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{discussion.replies} replies</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span>{discussion.likes} likes</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-20 bg-[#0b0c0f] border-t border-[#2a2a2a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-8">Upcoming Events</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="p-6 bg-[#1a1a1a] border border-white/10 rounded-xl hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-gray-400 text-sm mb-1">{event.date}</p>
                  <p className="text-gray-400 text-sm mb-4">{event.time}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">
                      {event.attendees} attending
                    </span>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                      Register
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#2a2a2a] bg-[#0b0c0f] py-12 mt-20">
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


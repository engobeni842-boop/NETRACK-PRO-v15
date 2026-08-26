import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  DollarSign, Users, TrendingUp, CreditCard, 
  ArrowUpRight, ArrowDownRight, Activity, 
  Globe, Shield, Wallet, BarChart3, 
  ChevronRight, Search, Filter, Download
} from 'lucide-react';

const OWNER_EMAIL = 'your-email@example.com'; // ← CHANGE THIS TO YOUR EMAIL

interface Subscription {
  id: string;
  user: string;
  email: string;
  plan: 'Basic' | 'Pro' | 'Elite';
  status: 'active' | 'cancelled' | 'pending';
  amount: number;
  date: string;
  platform: string;
}

interface Earning {
  id: string;
  source: string;
  amount: number;
  status: 'available' | 'pending' | 'withdrawn';
  date: string;
}

export default function OwnerPortal() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'earnings' | 'platforms'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data — replace with Supabase queries later
  const stats = {
    totalRevenue: 12450.00,
    monthlyRecurring: 3200.00,
    activeUsers: 142,
    totalUsers: 389,
    pendingWithdrawal: 1850.00,
    availableNow: 4100.00,
    todayEarnings: 245.50,
    conversionRate: 36.5
  };

  const subscriptions: Subscription[] = [
    { id: '1', user: 'John Trader', email: 'john@email.com', plan: 'Pro', status: 'active', amount: 49.99, date: '2026-08-05', platform: 'MT5' },
    { id: '2', user: 'Sarah Forex', email: 'sarah@email.com', plan: 'Elite', status: 'active', amount: 99.99, date: '2026-08-04', platform: 'Deriv' },
    { id: '3', user: 'Mike Crypto', email: 'mike@email.com', plan: 'Basic', status: 'pending', amount: 19.99, date: '2026-08-04', platform: 'Binance' },
    { id: '4', user: 'Anna Stocks', email: 'anna@email.com', plan: 'Pro', status: 'cancelled', amount: 49.99, date: '2026-08-01', platform: 'eToro' },
    { id: '5', user: 'David FX', email: 'david@email.com', plan: 'Elite', status: 'active', amount: 99.99, date: '2026-08-05', platform: 'XM' },
    { id: '6', user: 'Lisa Options', email: 'lisa@email.com', plan: 'Basic', status: 'active', amount: 19.99, date: '2026-08-03', platform: 'IQ Option' },
  ];

  const earnings: Earning[] = [
    { id: '1', source: 'Pro Subscription - John Trader', amount: 49.99, status: 'available', date: '2026-08-05' },
    { id: '2', source: 'Elite Subscription - Sarah Forex', amount: 99.99, status: 'available', date: '2026-08-04' },
    { id: '3', source: 'Basic Subscription - Mike Crypto', amount: 19.99, status: 'pending', date: '2026-08-04' },
    { id: '4', source: 'Pro Subscription - David FX', amount: 49.99, status: 'available', date: '2026-08-05' },
    { id: '5', source: 'Affiliate Commission', amount: 150.00, status: 'pending', date: '2026-08-03' },
    { id: '6', source: 'Elite Subscription - New User', amount: 99.99, status: 'pending', date: '2026-08-02' },
  ];

  const platformStats = [
    { name: 'MetaTrader 5', users: 89, revenue: 4450, color: 'bg-blue-500', icon: 'M5' },
    { name: 'Deriv', users: 67, revenue: 3200, color: 'bg-red-500', icon: 'D' },
    { name: 'Binance', users: 54, revenue: 2100, color: 'bg-yellow-500', icon: 'B' },
    { name: 'IQ Option', users: 43, revenue: 1500, color: 'bg-orange-500', icon: 'IQ' },
    { name: 'XM', users: 38, revenue: 1200, color: 'bg-green-500', icon: 'XM' },
    { name: 'eToro', users: 31, revenue: 980, color: 'bg-cyan-500', icon: 'eT' },
    { name: 'Pocket Option', users: 28, revenue: 750, color: 'bg-purple-500', icon: 'PO' },
    { name: 'MT4', users: 25, revenue: 620, color: 'bg-indigo-500', icon: 'M4' },
  ];

  const filteredSubs = subscriptions.filter(s => 
    s.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'available': return 'bg-emerald-500/20 text-emerald-400';
      case 'withdrawn': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  if (user?.email !== OWNER_EMAIL) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">This portal is restricted to the owner only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Top Navigation */}
      <nav className="border-b border-gray-800 bg-[#0f1424] px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg">
              N
            </div>
            <div>
              <h1 className="font-bold text-lg">NETRACK PRO</h1>
              <p className="text-xs text-gray-400">Owner Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user.email}</span>
            <button 
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-2 text-emerald-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12.5% this month</span>
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Available to Withdraw</span>
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">${stats.availableNow.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-2 text-gray-400 text-sm">
              <span>{stats.pendingWithdrawal} pending</span>
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Active Users</span>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
            <div className="flex items-center gap-1 mt-2 text-emerald-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>of {stats.totalUsers} total</span>
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Monthly Recurring</span>
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">${stats.monthlyRecurring.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-2 text-emerald-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>MRR growing</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-1">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'users', label: 'Subscribers', icon: Users },
            { id: 'earnings', label: 'Earnings', icon: DollarSign },
            { id: 'platforms', label: 'Platforms', icon: Globe },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Breakdown */}
            <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Revenue Breakdown
              </h3>
              <div className="space-y-4">
                {platformStats.map(p => (
                  <div key={p.name} className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${p.color} rounded-lg flex items-center justify-center text-xs font-bold`}>
                      {p.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{p.name}</span>
                        <span className="text-sm text-gray-400">${p.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className={`${p.color} h-2 rounded-full transition-all`} 
                          style={{ width: `${(p.revenue / stats.totalRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{p.users} users</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Today's Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">New Signups</span>
                    <span className="text-emerald-400 font-semibold">+12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">New Subscriptions</span>
                    <span className="text-emerald-400 font-semibold">+5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Cancellations</span>
                    <span className="text-red-400 font-semibold">-2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Conversion Rate</span>
                    <span className="text-blue-400 font-semibold">{stats.conversionRate}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">Withdraw Funds</h3>
                <p className="text-blue-100 text-sm mb-4">
                  ${stats.availableNow.toLocaleString()} available for withdrawal
                </p>
                <button className="w-full py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors">
                  Withdraw to Bank
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">All Subscribers</h3>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm hover:bg-gray-700">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-gray-400 text-sm">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Plan</th>
                    <th className="pb-3 font-medium">Platform</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredSubs.map(sub => (
                    <tr key={sub.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-4">
                        <div>
                          <p className="font-medium text-white">{sub.user}</p>
                          <p className="text-gray-500 text-xs">{sub.email}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          sub.plan === 'Elite' ? 'bg-purple-500/20 text-purple-400' :
                          sub.plan === 'Pro' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {sub.plan}
                        </span>
                      </td>
                      <td className="py-4 text-gray-300">{sub.platform}</td>
                      <td className="py-4 text-white font-medium">${sub.amount}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-400">{sub.date}</td>
                      <td className="py-4">
                        <button className="text-gray-400 hover:text-white">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Earnings History</h3>
              <div className="space-y-3">
                {earnings.map(e => (
                  <div key={e.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        e.status === 'available' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                      }`}>
                        <CreditCard className={`w-5 h-5 ${
                          e.status === 'available' ? 'text-emerald-400' : 'text-amber-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{e.source}</p>
                        <p className="text-xs text-gray-500">{e.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">+${e.amount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(e.status)}`}>
                        {e.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Earnings Summary</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Available Now</p>
                    <p className="text-2xl font-bold text-emerald-400">${stats.availableNow}</p>
                  </div>
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Pending Clearance</p>
                    <p className="text-2xl font-bold text-amber-400">${stats.pendingWithdrawal}</p>
                    <p className="text-xs text-gray-500 mt-1">Available in 7 days</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Total Withdrawn</p>
                    <p className="text-2xl font-bold text-blue-400">$8,420.00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'platforms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platformStats.map(p => (
              <div key={p.name} className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${p.color} rounded-xl flex items-center justify-center text-lg font-bold`}>
                    {p.icon}
                  </div>
                  <span className="text-xs text-gray-500">{((p.users / stats.totalUsers) * 100).toFixed(1)}% of users</span>
                </div>
                <h4 className="font-semibold text-white mb-1">{p.name}</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{p.users} traders</span>
                  <span className="text-emerald-400 font-medium">${p.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
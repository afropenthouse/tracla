'use client'
import React, { useMemo, useState } from 'react';
import { Gift, TrendingUp, Calendar, Settings, Plus, Trash2, Edit, Search } from 'lucide-react';

// Frontend-only demo: point rule, rewards, and purchases live in component state
export default function LoyaltyPage() {
  // Points: assign N points per ₦ spent (e.g., 1 point per ₦100)
  const [nairaPerPoint, setNairaPerPoint] = useState(100); // ₦ per 1 point
  const [rewardPercent, setRewardPercent] = useState(20); // redeem value e.g. 20%

  // Rewards CRUD (frontend-only)
  const [rewards, setRewards] = useState([
    { id: 'rw1', label: 'Free Drink', points: 100, description: 'Any soft drink' },
    { id: 'rw2', label: '10% Off', points: 250, description: 'Discount on next purchase' },
  ]);
  const [newReward, setNewReward] = useState({ label: '', points: '', description: '' });

  // Purchases ledger sample (phone + amount and derived points)
  const [purchases, setPurchases] = useState([
    { id: 1, phone: '+2348097772221', amount: 20000, date: '2025-09-24' },
    { id: 2, phone: '+2348069090880', amount: 12000, date: '2025-09-27' },
    { id: 3, phone: '+2348023344556', amount: 48000, date: '2025-09-25' },
  ]);

  const [filter, setFilter] = useState({ from: '', to: '', search: '' });

  // Derived points for a purchase based on rule
  const computePoints = (amount) => Math.floor(amount / nairaPerPoint);

  // Aggregate by phone with date filters
  const filteredPurchases = useMemo(() => {
    const from = filter.from ? new Date(filter.from) : null;
    const to = filter.to ? new Date(filter.to) : null;
    return purchases.filter((p) => {
      const d = new Date(p.date);
      if (from && d < from) return false;
      if (to && d > to) return false;
      if (filter.search && !p.phone.toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    });
  }, [purchases, filter]);

  const totalsByPhone = useMemo(() => {
    const map = new Map();
    for (const p of filteredPurchases) {
      const cur = map.get(p.phone) || { phone: p.phone, amount: 0, points: 0, purchaseCount: 0 };
      cur.amount += p.amount;
      cur.points += computePoints(p.amount);
      cur.purchaseCount += 1;
      map.set(p.phone, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [filteredPurchases, nairaPerPoint]);

  const totalIssuedPoints = useMemo(() => totalsByPhone.reduce((s, t) => s + t.points, 0), [totalsByPhone]);
  const topSpender = totalsByPhone[0];

  // Add purchase
  const [newPurchase, setNewPurchase] = useState({ phone: '', amount: '' });
  const addPurchase = () => {
    const amt = Number(newPurchase.amount);
    if (!newPurchase.phone || isNaN(amt) || amt <= 0) return;
    setPurchases((prev) => [
      { id: (prev[prev.length - 1]?.id || 0) + 1, phone: newPurchase.phone.trim(), amount: amt, date: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
    setNewPurchase({ phone: '', amount: '' });
  };

  // Rewards CRUD operations
  const createReward = () => {
    const pts = Number(newReward.points);
    if (!newReward.label || isNaN(pts) || pts <= 0) return;
    setRewards((prev) => [
      { id: `rw${Date.now()}`, label: newReward.label.trim(), points: pts, description: newReward.description.trim() },
      ...prev,
    ]);
    setNewReward({ label: '', points: '', description: '' });
  };
  const deleteReward = (id) => setRewards((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6d0e2b] flex items-center justify-center shadow-md">
            <Gift className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Loyalty & Points</h1>
            <p className="text-xs sm:text-sm text-gray-500">Assign points from spend and reward by points</p>
          </div>
        </div>
      </div>

      {/* Rules & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Points Rule</h3>
          <div className="space-y-2">
            <label className="text-xs text-gray-600">₦ per 1 point</label>
            <input type="number" value={nairaPerPoint} onChange={(e) => setNairaPerPoint(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm" />
            <label className="text-xs text-gray-600">Reward value (% of purchase)</label>
            <input type="number" value={rewardPercent} onChange={(e) => setRewardPercent(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm" />
            <p className="text-xs text-gray-500">Example: ₦{nairaPerPoint} per point • Reward {rewardPercent}%</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Summary</h3>
          <p className="text-xs text-gray-600 mb-1">Total Issued Points</p>
          <p className="text-2xl font-bold text-[#6d0e2b]">{totalIssuedPoints.toLocaleString()}</p>
          <div className="mt-3">
            <p className="text-xs text-gray-600">Top Spender</p>
            <p className="text-sm font-semibold text-gray-900">{topSpender ? topSpender.phone : '—'}</p>
            <p className="text-xs text-gray-500">₦{topSpender ? topSpender.amount.toLocaleString() : 0} • {topSpender ? topSpender.points.toLocaleString() : 0} pts</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Add Purchase</h3>
          <div className="space-y-2">
            <input type="text" placeholder="Customer phone (e.g. +23480...)" value={newPurchase.phone} onChange={(e) => setNewPurchase({ ...newPurchase, phone: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
            <input type="number" placeholder="Amount (₦)" value={newPurchase.amount} onChange={(e) => setNewPurchase({ ...newPurchase, amount: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
            <button onClick={addPurchase} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#6d0e2b] text-white text-sm hover:opacity-90">
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-500" />
            <input type="text" placeholder="Search phone" value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} className="bg-transparent text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs text-gray-600">From</label>
            <input type="date" value={filter.from} onChange={(e) => setFilter({ ...filter, from: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-600">To</label>
            <input type="date" value={filter.to} onChange={(e) => setFilter({ ...filter, to: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
          </div>        </div>
      </div>

      {/* Top Spenders */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Top Spenders</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-600">Select category:</span>
            {/* Example categories */}
            <button className="px-3 py-1 rounded-lg border hover:bg-gray-50">Top 10</button>
            <button className="px-3 py-1 rounded-lg border hover:bg-gray-50">Top 50</button>
            <button className="px-3 py-1 rounded-lg border hover:bg-gray-50">Min ₦20k</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 px-2">Phone</th>
                <th className="py-2 px-2">Total Spent (₦)</th>
                <th className="py-2 px-2">Points</th>
                <th className="py-2 px-2">Purchases</th>
              </tr>
            </thead>
            <tbody>
              {totalsByPhone.map((t) => (
                <tr key={t.phone} className="border-t border-gray-100">
                  <td className="py-2 px-2 font-medium text-gray-900">{t.phone}</td>
                  <td className="py-2 px-2">₦{t.amount.toLocaleString()}</td>
                  <td className="py-2 px-2 text-[#6d0e2b] font-semibold">{t.points.toLocaleString()}</td>
                  <td className="py-2 px-2">{t.purchaseCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rewards CRUD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Create Reward */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Create Reward</h3>
          <div className="space-y-2">
            <input type="text" placeholder="Label" value={newReward.label} onChange={(e) => setNewReward({ ...newReward, label: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
            <input type="number" placeholder="Points required" value={newReward.points} onChange={(e) => setNewReward({ ...newReward, points: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
            <input type="text" placeholder="Description" value={newReward.description} onChange={(e) => setNewReward({ ...newReward, description: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
            <button onClick={createReward} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#6d0e2b] text-white text-sm hover:opacity-90">
              <Plus size={16} /> Create
            </button>
          </div>
        </div>

        {/* Rewards List */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Rewards</h3>
          <div className="space-y-3">
            {rewards.map((rw) => (
              <div key={rw.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-900">{rw.label}</p>
                  <p className="text-xs text-gray-600">{rw.description}</p>
                  <p className="text-xs text-[#6d0e2b] font-semibold">{rw.points} pts</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => deleteReward(rw.id)} className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {rewards.length === 0 && <p className="text-sm text-gray-500">No rewards yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
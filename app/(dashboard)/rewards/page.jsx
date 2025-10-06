'use client'
import React, { useMemo, useState } from 'react';
import { Gift, TrendingUp, Calendar, Settings, Plus, Trash2, Edit, Search, X, Send } from 'lucide-react';

// Frontend-only demo: point rule, rewards, and purchases live in component state
export default function RewardsPage() {
  // Points: assign N points per ₦ spent (e.g., 1 point per ₦100)
  const [nairaPerPoint, setNairaPerPoint] = useState(100); // ₦ per 1 point
  const [rewardPercent, setRewardPercent] = useState(20); // redeem value e.g. 20%

  // Rewards CRUD (frontend-only)
  const [rewards, setRewards] = useState([
    { id: 'rw1', label: 'Free Drink', points: 100, description: 'Any soft drink', validFrom: '', validTo: '' },
    { id: 'rw2', label: '10% Off', points: 250, description: 'Discount on next purchase', validFrom: '', validTo: '' },
  ]);
  const [newReward, setNewReward] = useState({ label: '', points: '', description: '', validFrom: '', validTo: '' });

  // Purchases ledger sample (phone + amount and derived points)
  const [purchases, setPurchases] = useState([
    { id: 1, phone: '+2348097772221', amount: 20000, date: '2025-09-24' },
    { id: 2, phone: '+2348069090880', amount: 12000, date: '2025-09-27' },
    { id: 3, phone: '+2348023344556', amount: 48000, date: '2025-09-25' },
  ]);

  const [filter, setFilter] = useState({ from: '', to: '', search: '' });

  // Reward claims and messaging modals state
  const [isClaimsOpen, setIsClaimsOpen] = useState(false);
  const [isRewardMessageOpen, setIsRewardMessageOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [rewardMessage, setRewardMessage] = useState('');
  // Frontend-only demo claims store keyed by reward id
  const [rewardClaims, setRewardClaims] = useState({
    rw1: ['+2348097772221', '+2348069090880'],
    rw2: []
  });

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
      { id: `rw${Date.now()}`, label: newReward.label.trim(), points: pts, description: newReward.description.trim(), validFrom: newReward.validFrom, validTo: newReward.validTo },
      ...prev,
    ]);
    setNewReward({ label: '', points: '', description: '', validFrom: '', validTo: '' });
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Rewards</h1>
            <p className="text-xs sm:text-sm text-gray-500">Create rewards and get your customers spending more.</p>
          </div>
        </div>
      </div>



      {/* Filters */}
      {false && (
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
            </div>
          </div>
        </div>
      )}

      {/* Top Spenders */}
      {false && (
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
      )}

      {/* Rewards CRUD */}
      <div className="mb-4">
        <h2 className="text-xs sm:text-sm font-semibold text-gray-800">
          10 points = ₦1000</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Create Reward */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Create Reward</h3>
          <div className="space-y-2">
            <input type="text" placeholder="Label" value={newReward.label} onChange={(e) => setNewReward({ ...newReward, label: e.target.value })} className="w-full rounded-md border px-2.5 py-1.5 text-sm" />
            <input type="number" placeholder="Points required" value={newReward.points} onChange={(e) => setNewReward({ ...newReward, points: e.target.value })} className="w-full rounded-md border px-2.5 py-1.5 text-sm" />
            <input type="text" placeholder="Description" value={newReward.description} onChange={(e) => setNewReward({ ...newReward, description: e.target.value })} className="w-full rounded-md border px-2.5 py-1.5 text-sm" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600">Valid From</label>
                <input type="date" value={newReward.validFrom} onChange={(e) => setNewReward({ ...newReward, validFrom: e.target.value })} className="w-full rounded-md border px-2.5 py-1.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-600">Valid To</label>
                <input type="date" value={newReward.validTo} onChange={(e) => setNewReward({ ...newReward, validTo: e.target.value })} className="w-full rounded-md border px-2.5 py-1.5 text-sm" />
              </div>
            </div>
            <button onClick={createReward} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#6d0e2b] text-white text-sm hover:opacity-90">
              <Plus size={16} /> Create
            </button>
          </div>
        </div>

        {/* Rewards List */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Rewards</h3>
          <div className="space-y-3">
            {rewards.map((rw) => (
              <div key={rw.id} className="flex items-center justify-between bg-gray-50 rounded-md p-2.5">
                <div>
                  <p className="font-medium text-gray-900">{rw.label}</p>
                  <p className="text-xs text-gray-600">{rw.description}</p>
                  <p className="text-xs text-[#6d0e2b] font-semibold">{rw.points} pts</p>
                  {(rw.validFrom || rw.validTo) && (
                    <p className="text-xs text-gray-500">Duration: {rw.validFrom || '—'} to {rw.validTo || '—'}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => deleteReward(rw.id)} className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-red-600">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => { setSelectedReward(rw); setIsRewardMessageOpen(true); }} className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50 bg-[#6d0e2b] text-white">
                    send message
                  </button>
                </div>
              </div>
            ))}
            {rewards.length === 0 && <p className="text-sm text-gray-500">No rewards yet.</p>}
          </div>
        </div>
      </div>
      {/* Reward Claims Modal */}
      {false && selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsClaimsOpen(false)}></div>
          <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reward Claims</h3>
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => setIsClaimsOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">Reward: {selectedReward?.label}</p>
            <div className="max-h-60 overflow-y-auto">
              {(rewardClaims[selectedReward.id] && rewardClaims[selectedReward.id].length > 0) ? (
                <ul className="list-disc pl-5 text-sm text-gray-800">
                  {rewardClaims[selectedReward.id].map((phone) => (
                    <li key={phone}>{phone}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No claims yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Send Message to Reward Recipients Modal (SMS) */}
      {isRewardMessageOpen && selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsRewardMessageOpen(false)}></div>
          <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send SMS to Reward Recipients</h3>
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => setIsRewardMessageOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">Reward: {selectedReward?.label}</p>
            <textarea
              value={rewardMessage}
              onChange={(e) => setRewardMessage(e.target.value)}
              placeholder="Type your SMS message here..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => { setIsRewardMessageOpen(false); setRewardMessage(''); }}
                disabled={!rewardMessage.trim()}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
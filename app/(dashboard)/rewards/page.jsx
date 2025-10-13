'use client'
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Gift, Trash2, Edit, Search, X, Sparkles, Trophy, Calendar, Tag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBusinessStore } from "@/store/store";
import { getRewards as getRewardsApi, createRewardApi, updateRewardApi, deleteRewardApi } from "@/lib/api";

export default function RewardsPage() {
  // Helper: format date as 30th-08-2025
  const formatDateShort = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    const day = d.getDate();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const isTeen = day >= 11 && day <= 13;
    const last = day % 10;
    const suffix = isTeen ? 'th' : last === 1 ? 'st' : last === 2 ? 'nd' : last === 3 ? 'rd' : 'th';
    return `${day}${suffix}-${month}-${year}`;
  };

  // Rewards CRUD (now backed by API)
  const [rewards, setRewards] = useState([]);
  const [newReward, setNewReward] = useState({ 
    label: '', 
    points: '', 
    description: '', 
    validFrom: '', 
    validTo: '' 
  });

  // Loading & editing state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ 
    label: '', 
    points: '', 
    description: '', 
    validFrom: '', 
    validTo: '' 
  });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Reward messaging state
  // Remove reward messaging state
  // const [isRewardMessageOpen, setIsRewardMessageOpen] = useState(false);
  // const [selectedReward, setSelectedReward] = useState(null);
  // const [rewardMessage, setRewardMessage] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const amountFieldRef = useRef(null);

  // Replace localStorage with backend-powered fetching
  const { business } = useBusinessStore();
  const businessId = business?.id;
  const queryClient = useQueryClient();

  const { data: rewardsResponse, isLoading: rewardsLoading, isError: rewardsError } = useQuery({
    queryKey: ['rewards', businessId],
    queryFn: () => getRewardsApi(businessId),
    enabled: !!businessId,
  });

  useEffect(() => {
    const list = rewardsResponse?.data || [];
    setRewards(Array.isArray(list) ? list : []);
  }, [rewardsResponse]);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (amountFieldRef.current && !amountFieldRef.current.contains(e.target)) {
        setShowSuggestion(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const createRewardMutation = useMutation({
    mutationFn: (payload) => createRewardApi(businessId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards', businessId] });
    }
  });

  const updateRewardMutation = useMutation({
    mutationFn: ({ rewardId, payload }) => updateRewardApi(businessId, rewardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards', businessId] });
      setIsEditOpen(false);
      setEditTarget(null);
      setEditForm({ label: '', points: '', description: '', validFrom: '', validTo: '' });
    }
  });

  const deleteRewardMutation = useMutation({
    mutationFn: (rewardId) => deleteRewardApi(businessId, rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards', businessId] });
      setDeleteConfirm(null);
    }
  });

  // Create Reward (API-backed)
  const createReward = () => {
    if (!businessId) {
      alert('Please select a business to create rewards.');
      return;
    }
  
    // Prevent creating more than one reward at a time
    if (Array.isArray(rewards) && rewards.length > 0) {
      alert('You already have a reward. Edit or delete the existing reward before creating a new one.');
      return;
    }
  
    const amount = Number(newReward.points);
    const points = Math.floor(amount / 100);
  
    if (!newReward.label.trim() || Number.isNaN(amount) || amount <= 0 || points <= 0) {
      alert('Please fill in all required fields with valid data');
      return;
    }
  
    const payload = {
      label: newReward.label.trim(),
      description: newReward.description.trim() || undefined,
      points,
      validFrom: newReward.validFrom || undefined,
      validTo: newReward.validTo || undefined,
    };
  
    createRewardMutation.mutate(payload, {
      onSuccess: () => {
        setNewReward({ label: '', points: '', description: '', validFrom: '', validTo: '' });
      }
    });
  };

  // OPEN EDIT MODAL
  const openEdit = (reward) => {
    setEditTarget(reward);
    setEditForm({
      label: reward.label,
      points: reward.points.toString(),
      description: reward.description || '',
      validFrom: reward.validFrom || '',
      validTo: reward.validTo || ''
    });
    setIsEditOpen(true);
  };

  // UPDATE Reward (API-backed)
  const updateReward = () => {
    if (!editTarget) return;

    const points = Number(editForm.points);
    
    if (!editForm.label || isNaN(points) || points <= 0) {
      alert('Please fill in all required fields with valid data');
      return;
    }

    const payload = {
      label: editForm.label.trim(),
      description: editForm.description.trim() || undefined,
      points,
      validFrom: editForm.validFrom || undefined,
      validTo: editForm.validTo || undefined,
    };

    updateRewardMutation.mutate({ rewardId: editTarget.id, payload });
  };

  // OPEN DELETE CONFIRMATION
  const openDeleteConfirm = (reward) => {
    setDeleteConfirm(reward);
  };

  // DELETE Reward (API-backed)
  const confirmDelete = () => {
    if (!deleteConfirm) return;
    
    deleteRewardMutation.mutate(deleteConfirm.id);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6d0e2b] to-[#8a1a3d] flex items-center justify-center shadow-lg">
                <Gift className="text-white" size={24} />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                <Sparkles className="text-white" size={10} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Rewards</h1>
              <p className="text-sm text-gray-600 mt-1">Create and manage customer rewards</p>
            </div>
          </div>
        </div>


        {/* Points Info Card */}
        <div className="bg-gradient-to-r from-[#6d0e2b] to-[#8a1a3d] rounded-2xl p-6 text-white shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="text-amber-300" size={24} />
              <div>
                <h2 className="text-lg font-semibold">Create Your Special Reward</h2>
                {/* <p className="text-amber-100 text-sm">₦1,000 = 10 reward points</p> */}
                <p className="text-amber-200 text-xs mt-1">Note: You can only create one reward at a time.</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-sm font-medium">Active Rewards: <span className="text-amber-300">{rewards.length}</span></p>
            </div>
          </div>
        </div>

        {/* Rewards CRUD */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Create Reward Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Tag className="text-white" size={16} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Create a Reward</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Reward Label *</label>
                <input 
                  type="text" 
                  placeholder="e.g., 20% OFF" 
                  value={newReward.label} 
                  onChange={(e) => setNewReward({ ...newReward, label: e.target.value.toUpperCase() })} 
                  disabled={Array.isArray(rewards) && rewards.length > 0}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d0e2b] focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                />
              </div>
              
              <div className="relative" ref={amountFieldRef}>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Spending Amount *</label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  pattern="\\d*"
                  min="1"
                  step="1"
                  placeholder="Enter amount customers need to spend" 
                  value={newReward.points} 
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^0-9]/g, '');
                    setNewReward({ ...newReward, points: sanitized });
                    setShowSuggestion(Number(sanitized) > 0);
                  }} 
                  onKeyDown={(evt) => {
                    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                    if (!/[0-9]/.test(evt.key) && !allowed.includes(evt.key)) {
                      evt.preventDefault();
                    }
                  }}
                  onFocus={() => {
                    if (Number(newReward.points) > 0) setShowSuggestion(true);
                  }}
                  disabled={Array.isArray(rewards) && rewards.length > 0}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d0e2b] focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                />
                {Number(newReward.points) > 0 && showSuggestion && (
                  <div className="mt-2 text-xs text-gray-600">
                    {Math.floor(Number(newReward.points) / 100)}pts to get rewards
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                <input 
                  type="text" 
                  placeholder="e.g., Food, drinks, merchandise, etc." 
                  value={newReward.description} 
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })} 
                  disabled={Array.isArray(rewards) && rewards.length > 0}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d0e2b] focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                    <Calendar size={14} />
                    Valid From
                  </label>
                  <input 
                    type="date" 
                    value={newReward.validFrom} 
                    onChange={(e) => setNewReward({ ...newReward, validFrom: e.target.value })} 
                    disabled={Array.isArray(rewards) && rewards.length > 0}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d0e2b] focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                    <Calendar size={14} />
                    Valid To
                  </label>
                  <input 
                    type="date" 
                    value={newReward.validTo} 
                    onChange={(e) => setNewReward({ ...newReward, validTo: e.target.value })} 
                    disabled={Array.isArray(rewards) && rewards.length > 0}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d0e2b] focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                  />
                </div>
              </div>
              
              <button 
                onClick={createReward} 
                disabled={(Array.isArray(rewards) && rewards.length > 0) || createRewardMutation.isLoading}
                className={`w-full py-3 rounded-xl text-white font-medium transition-all duration-300 mt-4 ${
                  (Array.isArray(rewards) && rewards.length > 0) 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-[#6d0e2b] to-[#8a1a3d] hover:from-[#5a0c23] hover:to-[#731732] hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
                title={(Array.isArray(rewards) && rewards.length > 0) ? 'A reward already exists. Edit or delete it before creating a new one.' : 'Create a reward'}
              >
                {createRewardMutation.isLoading ? 'Creating...' : 'Create Reward'}
              </button>
            </div>
          </div>

          {/* Rewards List Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Gift className="text-white" size={16} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Active Rewards</h3>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                {rewards.length} {rewards.length === 1 ? 'reward' : 'rewards'}
              </span>
            </div>
            
            <div className="space-y-4">
              {rewardsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6d0e2b]"></div>
                </div>
              ) : rewards.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500 text-sm">No rewards yet. Create your first reward!</p>
                </div>
              ) : (
                rewards.map((reward) => (
                  <div key={reward.id} className="group bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900 text-lg">{reward.label}</span>
                          <span className="bg-gradient-to-r from-[#6d0e2b] to-[#8a1a3d] text-white px-2 py-1 rounded-lg text-xs font-bold">
                            ₦{(reward.points * 100).toLocaleString('en-NG')}
                          </span>
                        </div>
                        
                        {reward.description && (
                          <p className="text-gray-600 text-sm mb-2">{reward.description}</p>
                        )}
                        
                        <div className="flex items-center gap-6 text-xs text-gray-500 flex-nowrap">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-semibold whitespace-nowrap inline-flex items-center gap-1">
                            <span className="font-bold">{reward.points}</span>
                            <span>pts</span>
                          </span>
                          
                          {(reward.validFrom || reward.validTo) && (
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Calendar size={12} />
                              {formatDateShort(reward.validFrom)} → {formatDateShort(reward.validTo)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:flex-nowrap flex-wrap justify-end">
                        <button 
                          onClick={() => openEdit(reward)} 
                          className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 shadow-sm"
                          title="Edit reward"
                        >
                          <Edit size={16} className="text-gray-600" />
                        </button>
                        <button 
                          onClick={() => openDeleteConfirm(reward)} 
                          className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-red-50 hover:border-red-300 transition-colors duration-200 shadow-sm"
                          title="Delete reward"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Reward Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6 shadow-2xl transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Reward</h3>
              <button 
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200" 
                onClick={() => setIsEditOpen(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Label *</label>
                <input 
                  type="text" 
                  value={editForm.label} 
                  onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} 
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d0e2b] focus:border-transparent transition-all duration-200" 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Points *</label>
                <div className="relative">
                  <input 
                    type="number" 
                    inputMode="numeric"
                    pattern="\\d*"
                    min="1"
                    step="1"
                    value={editForm.points} 
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9]/g, '');
                      setEditForm({ ...editForm, points: sanitized });
                    }} 
                    onKeyDown={(evt) => {
                      const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                      if (!/[0-9]/.test(evt.key) && !allowed.includes(evt.key)) {
                        evt.preventDefault();
                      }
                    }}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d0e2b] focus:border-transparent transition-all duration-200" 
                  />
                  {Number(editForm.points) > 0 && (
                    <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg">
                      Estimated amount: <span className="font-semibold">₦{(Number(editForm.points) * 100).toLocaleString('en-NG')}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                <input 
                  type="text" 
                  value={editForm.description} 
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} 
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d0e2b] focus:border-transparent transition-all duration-200" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Valid From</label>
                  <input 
                    type="date" 
                    value={editForm.validFrom} 
                    onChange={(e) => setEditForm({ ...editForm, validFrom: e.target.value })} 
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d0e2b] focus:border-transparent transition-all duration-200" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Valid To</label>
                  <input 
                    type="date" 
                    value={editForm.validTo} 
                    onChange={(e) => setEditForm({ ...editForm, validTo: e.target.value })} 
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d0e2b] focus:border-transparent transition-all duration-200" 
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setIsEditOpen(false)} 
                  className="px-6 py-3 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={updateReward} 
                  className="px-6 py-3 text-sm bg-gradient-to-r from-[#6d0e2b] to-[#8a1a3d] text-white rounded-xl hover:from-[#5a0c23] hover:to-[#731732] transition-all duration-300 font-medium shadow-sm"
                >
                  Update Reward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}></div>
          <div className="relative bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Reward</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete <strong>"{deleteConfirm.label}"</strong>? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="px-6 py-3 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-6 py-3 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-sm"
              >
                Delete Reward
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
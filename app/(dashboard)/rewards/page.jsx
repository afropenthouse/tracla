'use client'
import React, { useMemo, useState, useEffect } from 'react';
import { Gift, Plus, Trash2, Edit, Search, X, Send } from 'lucide-react';
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
  const [isRewardMessageOpen, setIsRewardMessageOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [rewardMessage, setRewardMessage] = useState('');

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

    const points = Number(newReward.points);

    if (!newReward.label.trim() || Number.isNaN(points) || points <= 0) {
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

  // Send reward message (simulated)
  const sendRewardMessage = () => {
    if (!rewardMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    // Simulate sending message
    console.log(`Sending message for reward ${selectedReward.label}:`, rewardMessage);
    alert('Message sent successfully!');
    
    // Close modal and reset
    setIsRewardMessageOpen(false);
    setSelectedReward(null);
    setRewardMessage('');
  };

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
            <p className="text-xs sm:text-sm text-gray-500">Create and manage customer rewards</p>
          </div>
        </div>
      </div>

      {/* Points Info */}
      <div className="mb-4">
        <h2 className="text-xs sm:text-sm font-semibold text-gray-800">
          ₦1000 = 10 points
        </h2>
      </div>

      {/* Rewards CRUD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Create Reward */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Create Reward</h3>
          <div className="space-y-2">
            <input 
              type="text" 
              label="Label"
              placeholder="Label *" 
              value={newReward.label} 
              onChange={(e) => setNewReward({ ...newReward, label: e.target.value })} 
              className="w-full rounded-md border px-2.5 py-1.5 text-sm" 
            />
            <div className="relative pb-8">
              <input 
                type="number" 
                inputMode="numeric"
                pattern="\\d*"
                min="1"
                step="1"
                placeholder="Points required *" 
                value={newReward.points} 
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^0-9]/g, '');
                  setNewReward({ ...newReward, points: sanitized });
                }} 
                onKeyDown={(evt) => {
                  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                  if (!/[0-9]/.test(evt.key) && !allowed.includes(evt.key)) {
                    evt.preventDefault();
                  }
                }}
                className="w-full rounded-md border px-2.5 py-1.5 text-sm" 
              />
              {Number(newReward.points) > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-sm p-2 text-xs text-gray-700">
                  Estimated purchase amount: ₦{(Number(newReward.points) * 100).toLocaleString('en-NG')}
                </div>
              )}
            </div>
            <input 
              type="text" 
              placeholder="Description" 
              value={newReward.description} 
              onChange={(e) => setNewReward({ ...newReward, description: e.target.value })} 
              className="w-full rounded-md border px-2.5 py-1.5 text-sm" 
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600">Valid From</label>
                <input 
                  type="date" 
                  value={newReward.validFrom} 
                  onChange={(e) => setNewReward({ ...newReward, validFrom: e.target.value })} 
                  className="w-full rounded-md border px-2.5 py-1.5 text-sm" 
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Valid To</label>
                <input 
                  type="date" 
                  value={newReward.validTo} 
                  onChange={(e) => setNewReward({ ...newReward, validTo: e.target.value })} 
                  className="w-full rounded-md border px-2.5 py-1.5 text-sm" 
                />
              </div>
            </div>
            <button 
              onClick={createReward} 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#6d0e2b] text-white text-sm hover:opacity-90"
            >
              <Plus size={16} /> Create
            </button>
          </div>
        </div>

        {/* Rewards List */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Rewards</h3>
          <div className="space-y-3">
            {rewardsLoading ? (
              <p className="text-sm text-gray-500">Loading rewards...</p>
            ) : rewards.length === 0 ? (
              <p className="text-sm text-gray-500">No rewards yet. Create your first reward!</p>
            ) : (
              rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between bg-gray-50 rounded-md p-2.5">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{reward.label}</p>
                    <p className="text-xs text-gray-600">{reward.description}</p>
                    <p className="text-xs text-[#6d0e2b] font-semibold">{reward.points} pts</p>
                    {(reward.validFrom || reward.validTo) && (
                      <p className="text-xs text-gray-500">
                        Valid: {formatDateShort(reward.validFrom)} to {formatDateShort(reward.validTo)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEdit(reward)} 
                      className="text-xs p-1.5 rounded-lg border hover:bg-gray-50"
                      title="Edit reward"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => openDeleteConfirm(reward)} 
                      className="text-xs p-1.5 rounded-lg border hover:bg-gray-50 text-red-600"
                      title="Delete reward"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button 
                      onClick={() => { 
                        setSelectedReward(reward); 
                        setIsRewardMessageOpen(true); 
                      }} 
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#6d0e2b] text-white hover:opacity-90"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Reward Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Reward</h3>
              <button 
                className="p-2 rounded-lg hover:bg-gray-100" 
                onClick={() => setIsEditOpen(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Label *</label>
                <input 
                  type="text" 
                  value={editForm.label} 
                  onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} 
                  className="w-full rounded-md border px-3 py-2 text-sm mt-1" 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Points *</label>
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
                    className="w-full rounded-md border px-3 py-2 text-sm mt-1" 
                  />
                  {Number(editForm.points) > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-sm p-2 text-xs text-gray-700">
                      Estimated purchase amount: ₦{(Number(editForm.points) * 100).toLocaleString('en-NG')}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <input 
                  type="text" 
                  value={editForm.description} 
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} 
                  className="w-full rounded-md border px-3 py-2 text-sm mt-1" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Valid From</label>
                  <input 
                    type="date" 
                    value={editForm.validFrom} 
                    onChange={(e) => setEditForm({ ...editForm, validFrom: e.target.value })} 
                    className="w-full rounded-md border px-3 py-2 text-sm mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Valid To</label>
                  <input 
                    type="date" 
                    value={editForm.validTo} 
                    onChange={(e) => setEditForm({ ...editForm, validTo: e.target.value })} 
                    className="w-full rounded-md border px-3 py-2 text-sm mt-1" 
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setIsEditOpen(false)} 
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={updateReward} 
                  className="px-4 py-2 text-sm bg-[#6d0e2b] text-white rounded-lg hover:opacity-90"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)}></div>
          <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
              <button 
                className="p-2 rounded-lg hover:bg-gray-100" 
                onClick={() => setDeleteConfirm(null)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the reward <strong>"{deleteConfirm.label}"</strong>? 
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setDeleteConfirm(null)} 
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Reward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {isRewardMessageOpen && selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsRewardMessageOpen(false)}></div>
          <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send SMS for Reward</h3>
              <button 
                className="p-2 rounded-lg hover:bg-gray-100" 
                onClick={() => setIsRewardMessageOpen(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              Reward: <span className="font-semibold">{selectedReward.label}</span>
            </p>
            
            <textarea
              value={rewardMessage}
              onChange={(e) => setRewardMessage(e.target.value)}
              placeholder="Type your SMS message here..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            
            <div className="flex justify-end mt-4">
              <button
                onClick={sendRewardMessage}
                disabled={!rewardMessage.trim()}
                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
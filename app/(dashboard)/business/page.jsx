'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Phone, Mail, Users, Eye, Download,
  Calendar, Activity, X, QrCode, ExternalLink, Copy,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useLoadingStore } from "@/store/loadingStore";

// QR Code Download Function (reusable from onboarding)
const downloadQRCode = async (branch, showLoader, hideLoader) => {
  if (!branch?.qrCodeUrl) {
    toast.error("QR code URL not available");
    return;
  }

  try {
    showLoader({
      text: "Generating QR code...",
      loaderColor: "#1A73E8",
      textColor: "#ffffff",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    });

    // Use QR Server API to generate QR code
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(branch.qrCodeUrl)}`;
    
    const response = await fetch(qrApiUrl);
    if (!response.ok) throw new Error('Failed to generate QR code');
    
    const blob = await response.blob();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${branch.slug}-qr-code.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    hideLoader();
    toast.success("QR code downloaded successfully!");

  } catch (error) {
    hideLoader();
    console.error('Error downloading QR code:', error);
    
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(branch.qrCodeUrl);
        toast.info("QR code download failed, but URL copied to clipboard!");
      } catch (clipboardError) {
        toast.error("Failed to download QR code. Please try again.");
      }
    } else {
      toast.error("Failed to download QR code. Please try again.");
    }
  }
};

// Branch Modal Component
const BranchModal = ({ branch, business, isOpen, onClose, showLoader, hideLoader }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(true);
      toast.success("URL copied to clipboard!");
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  const handleDownloadQR = () => {
    downloadQRCode(branch, showLoader, hideLoader);
  };

  if (!isOpen || !branch) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1A73E8] rounded-xl flex items-center justify-center">
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{branch.name}</h2>
                <p className="text-sm text-gray-600">{business?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Branch Status */}
            <div className="flex items-center gap-2">
              {branch.isActive ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-medium">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">Inactive</span>
                </div>
              )}
            </div>

            {/* Branch Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">Branch Information</h3>
                
                {branch.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Address</p>
                      <p className="text-sm text-gray-600">{branch.address}</p>
                    </div>
                  </div>
                )}

                {branch.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-sm text-gray-600">{branch.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(branch.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">QR Code</h3>
                
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(branch.qrCodeUrl)}`}
                      alt={`QR Code for ${branch.name}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={handleDownloadQR}
                      className="w-full bg-[#1A73E8] text-white py-2 px-4 rounded-lg hover:bg-[#1557B0] transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download QR Code
                    </button>
                    
                    <button
                      onClick={() => copyToClipboard(branch.qrCodeUrl)}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      {copiedUrl ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      {copiedUrl ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <p className="mb-1">Share this QR code with customers to:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>Submit receipts</li>
                    <li>Earn loyalty points</li>
                    <li>Access promotions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* QR URL Preview */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ExternalLink size={16} className="text-blue-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 mb-1">Public Access URL</p>
                  <p className="text-sm text-blue-800 break-all">{branch.qrCodeUrl}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={handleDownloadQR}
              className="px-4 py-2 bg-[#1A73E8] text-white rounded-lg hover:bg-[#1557B0] transition-colors font-medium flex items-center gap-2"
            >
              <Download size={16} />
              Download QR
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Main Business Branches Component
const BusinessBranchesView = ({ businessId }) => {
  const { showLoader, hideLoader } = useLoadingStore();
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch business with branches
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['business-branches', businessId],
    queryFn: async () => {
      const response = await api.get(`/businesses/${businessId}/branches`);
      return response.data.data.business;
    },
    enabled: !!businessId,
  });

  const openBranchModal = (branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const closeBranchModal = () => {
    setSelectedBranch(null);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A73E8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle size={16} />
          <h3 className="font-medium">Error loading business</h3>
        </div>
        <p className="text-sm text-red-600 mb-3">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const business = data;
  const branches = business?.branches || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Business Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-[#1A73E8] to-[#1557B0] rounded-2xl flex items-center justify-center">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business?.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                {business?.email && (
                  <div className="flex items-center gap-1">
                    <Mail size={14} />
                    {business.email}
                  </div>
                )}
                {business?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone size={14} />
                    {business.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {business?.currentTier || 'Basic'} Plan
            </div>
            <p className="text-sm text-gray-500 mt-1">{branches.length} Branches</p>
          </div>
        </div>

        {business?.address && (
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin size={16} className="mt-0.5" />
            <p className="text-sm">{business.address}</p>
          </div>
        )}
      </div>

      {/* Branches Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Branches ({branches.length})
          </h2>
        </div>

        {branches.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
            <Building2 size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No branches yet</h3>
            <p className="text-gray-600 mb-4">Create your first branch to start tracking customers</p>
            <button className="bg-[#1A73E8] text-white px-6 py-2 rounded-lg hover:bg-[#1557B0] transition-colors font-medium">
              Add Branch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <motion.div
                key={branch.id}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => openBranchModal(branch)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1A73E8]/10 rounded-lg flex items-center justify-center">
                      <Building2 size={18} className="text-[#1A73E8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {branch.isActive ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-500">
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Eye size={16} className="text-gray-400" />
                </div>

                {branch.address && (
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin size={14} className="text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600 line-clamp-2">{branch.address}</p>
                  </div>
                )}

                {branch.phone && (
                  <div className="flex items-center gap-2 mb-4">
                    <Phone size={14} className="text-gray-400" />
                    <p className="text-sm text-gray-600">{branch.phone}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <QrCode size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">QR Available</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(branch.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Branch Modal */}
      <BranchModal
        branch={selectedBranch}
        business={business}
        isOpen={isModalOpen}
        onClose={closeBranchModal}
        showLoader={showLoader}
        hideLoader={hideLoader}
      />
    </div>
  );
};

export default BusinessBranchesView;
"use client"
import React, { useState, useEffect } from 'react';
import { QrCode, Download, Copy, Building2, Store, ArrowLeft } from 'lucide-react';
import { useBranchStore, useBusinessStore } from '@/store/store';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useLoadingStore } from '@/store/loadingStore';

const QRCodePage = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoadingStore();
  const { currentBranch } = useBranchStore();
  const { business } = useBusinessStore();
  const [qrDataURL, setQrDataURL] = useState(null);
  const isBusinessView = !currentBranch;
  const currentContext = isBusinessView ? business : currentBranch;
  const contextName = currentContext?.name || 'Loading...';
  const qrCodeValue = currentContext?.qrCodeUrl || 'Loading...';
  
  // Generate QR code when component mounts or context changes
  useEffect(() => {
    const generateQRCode = async () => {
      if (!qrCodeValue || qrCodeValue.includes('undefined')) return;
      
      try {
        const QRCode = (await import('qrcode')).default;
        const dataURL = await QRCode.toDataURL(qrCodeValue, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        setQrDataURL(dataURL);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
        toast.error('Failed to generate QR code');
      }
    };
    generateQRCode();
  }, [qrCodeValue]);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrCodeValue);
    toast.success('Link copied to clipboard!');
  };
  
  const handleDownload = async () => {
    if (!qrDataURL) {
      toast.error('QR code not ready for download');
      return;
    }
    
    try {
      showLoader({
        text: "Generating QR code...",
        loaderColor: "#6d0e2b",
        textColor: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      });
      
      // Create canvas for download
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 400;
      canvas.width = size;
      canvas.height = size + 100; // Extra space for text
      
      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Load and draw QR code
      const qrImage = new Image();
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrDataURL;
      });
      
      ctx.drawImage(qrImage, 20, 20, size - 40, size - 40);
      
      // Add context name below QR code
      ctx.fillStyle = '#6d0e2b';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(business?.name + ' - ' + currentBranch?.name, size / 2, size + 40);
      
      // Add "Scan to visit" text
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText('Scan to earn discounts', size / 2, size + 70);
      
      // Download the image
      const link = document.createElement('a');
      link.download = `${business?.name + ' - ' + currentBranch?.name.replace(/[^a-zA-Z0-9]/g, '_')}_QR_Code.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      hideLoader();
      toast.success('QR code downloaded successfully!');
    } catch (error) {
      hideLoader();
      console.error('Failed to download QR code:', error);
      toast.error('Failed to download QR code');
    }
  };
  
  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 sm:mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#6d0e2b] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
            {isBusinessView ? <Building2 className="sm:size-28 text-white" /> : <Store className=" text-white" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">QR Code</h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            {isBusinessView ? 'Business QR Code' : 'Branch QR Code'} for {business?.name + ' - ' + currentBranch?.name}
          </p>
        </div>
        
        {/* QR Code Display */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          <div className="text-center">
            {/* Context Indicator */}
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6 px-3 sm:px-4 py-2 bg-[#6d0e2b] rounded-xl border border-red-100">
              {isBusinessView ? <Building2 size={14} className=" text-white" /> : <Store size={14} className=" text-white" />}
              <span className="text-xs sm:text-sm font-medium text-white truncate max-w-[200px] sm:max-w-xs">
                {isBusinessView ? 'Overall Business' : 'Branch View'}: {business?.name + ' - ' + currentBranch?.name}
              </span>
            </div>
            
            {/* QR Code Display */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-white border-4 border-gray-200 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
              {qrDataURL ? (
                <img 
                  src={qrDataURL} 
                  alt={`QR Code for ${business?.name + ' - ' + currentBranch?.name}`}
                  className="w-40 h-40 sm:w-52 sm:h-52 object-contain"
                />
              ) : (
                <div className="text-center">
                  <QrCode size={80} className=" text-gray-400 mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-gray-500">Generating QR Code...</p>
                </div>
              )}
            </div>
            
            {/* QR Code URL */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Customer Link:</p>
              <p className="text-xs sm:text-sm font-mono text-gray-800 break-all">{qrCodeValue}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg cursor-pointer"
              >
                <Copy size={16} className="" />
                <span className="text-sm sm:text-base">Copy Link</span>
              </button>
              
              <button
                onClick={handleDownload}
                disabled={!qrDataURL}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#6d0e2b] text-white rounded-xl hover:from-rose-500 hover:to-[#6d0e2b] transition-all duration-300 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} className="" />
                <span className="text-sm sm:text-base">Download QR Code</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">How to use this QR Code</h3>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
            <p>• <strong>Display at your location:</strong> Print and place this QR code where customers can easily scan it</p>
            <p>• <strong>Customer scanning:</strong> When customers scan, they'll be taken to your {isBusinessView ? 'business' : 'branch'} page</p>
            <p>• <strong>Automatic tracking:</strong> All customer interactions will be tracked in your dashboard</p>
            <p>• <strong>Mobile friendly:</strong> The page works perfectly on all mobile devices</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
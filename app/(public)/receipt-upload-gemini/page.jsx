"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Camera, FileImage, X, CheckCircle, AlertCircle, 
  Loader2, Receipt, Clock, DollarSign, Calendar, Image,
  Sparkles, Building2, ShoppingCart, CreditCard, Tag, MapPin,
  ArrowRight, Phone, Gift, Star, Zap, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

const VibeazyReceiptUpload = () => {
  const searchParams = useSearchParams();
  const branchSlug = searchParams.get('branch') || 'demo-branch'; // Get from URL params
  
  const [step, setStep] = useState(1); // 1: Upload, 2: Phone, 3: Confirmation
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [branchInfo, setBranchInfo] = useState(null);
  const [isLoadingBranch, setIsLoadingBranch] = useState(true);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch branch information from backend
  useEffect(() => {
    const fetchBranchInfo = async () => {
      try {
        setIsLoadingBranch(true);
        const response = await fetch(`/api/v1/public/branch/${branchSlug}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setBranchInfo(data.data);
        } else {
          setError(data.message || 'Branch not found');
        }
      } catch (err) {
        console.error('Failed to fetch branch info:', err);
        setError('Failed to load branch information');
      } finally {
        setIsLoadingBranch(false);
      }
    };
    
    if (branchSlug) {
      fetchBranchInfo();
    }
  }, [branchSlug]);

  // Default business info for demo/loading
  const businessInfo = branchInfo ? {
    name: branchInfo.business.name,
    logo: "🏪",
    pointsRate: "₦1,000 = 1 point",
    welcomeOffer: "Welcome! Earn points with every visit!",
    branchName: branchInfo.branch.name,
    branchAddress: branchInfo.branch.address
  } : {
    name: "Loading...",
    logo: "⏳",
    pointsRate: "₦1,000 = 1 point",
    welcomeOffer: "Loading branch information..."
  };

  // Simulate receipt processing (using your Gemini backend)
  const parseReceiptWithGemini = async (imageBase64) => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
        }),
      });

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process receipt');
      }

      return result.data;
    } catch (error) {
      console.error('Receipt processing error:', error);
      throw error;
    }
  };

  // HEIC file detection and conversion (keep your existing logic)
  const isHEIC = (file) => {
    return file.type === 'image/heic' || 
           file.type === 'image/heif' || 
           file.name.toLowerCase().endsWith('.heic') || 
           file.name.toLowerCase().endsWith('.heif');
  };

  const convertHEIC = async (file) => {
    setIsConverting(true);
    setConversionProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Use heic2any library
      const heic2any = (await import('heic2any')).default;
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9
      });

      clearInterval(progressInterval);
      setConversionProgress(100);

      const convertedFile = new File([convertedBlob], 
        file.name.replace(/\.(heic|heif)$/i, '.jpg'), 
        { type: 'image/jpeg' }
      );

      setTimeout(() => {
        setIsConverting(false);
        setConversionProgress(0);
      }, 500);

      return convertedFile;
    } catch (error) {
      setIsConverting(false);
      setConversionProgress(0);
      throw new Error('Could not process iPhone image. Please try a different photo.');
    }
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    const isImageFile = file.type.startsWith('image/') || isHEIC(file);
    if (!isImageFile) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setExtractedData(null);

    try {
      let processedFile = file;

      if (isHEIC(file)) {
        processedFile = await convertHEIC(file);
      }

      setUploadedFile(processedFile);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(processedFile);

    } catch (error) {
      console.error('File processing error:', error);
      setError(error.message || 'Failed to process image file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const processReceipt = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const progressInterval = setInterval(() => {
            setProcessingProgress(prev => Math.min(prev + 8, 85));
          }, 150);

          const base64Data = e.target.result.split(',')[1];
          const result = await parseReceiptWithGemini(base64Data);
          
          clearInterval(progressInterval);
          setProcessingProgress(100);

          setExtractedData(result);
          setTimeout(() => {
            setStep(2); // Move to phone number step
            setIsProcessing(false);
            setProcessingProgress(0);
          }, 1000);

        } catch (err) {
          console.error('Processing Error:', err);
          setError('Could not read your receipt. Please try again or take a clearer photo.');
        } finally {
          setIsProcessing(false);
          setProcessingProgress(0);
        }
      };
      reader.readAsDataURL(uploadedFile);

    } catch (err) {
      console.error('Process error:', err);
      setError('Something went wrong. Please try again.');
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!extractedData?.amount) {
      setError('No purchase amount detected from receipt');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Record purchase in backend
      const response = await fetch(`/api/v1/public/branch/${branchSlug}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\s/g, ''), // Remove spaces
          amount: extractedData.amount,
          purchaseDate: extractedData.dateTime ? 
            new Date(extractedData.dateTime.date + (extractedData.dateTime.time ? ' ' + extractedData.dateTime.time : '')).toISOString() : 
            new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPurchaseResult(data.data);
        setStep(3); // Move to confirmation
      } else {
        if (response.status === 409) {
          setError('This purchase has already been recorded. Please check if you\'ve already submitted this receipt.');
        } else {
          setError(data.message || 'Failed to record purchase. Please try again.');
        }
      }
    } catch (err) {
      console.error('Purchase recording error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setStep(1);
    setUploadedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setPhoneNumber('');
    setError(null);
    setProcessingProgress(0);
    setIsConverting(false);
    setConversionProgress(0);
    setPurchaseResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatPhoneNumber = (value) => {
    // Simple Nigerian phone number formatting
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    if (numbers.length <= 11) return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7)}`;
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 11)}`;
  };

  // Show loading screen while fetching branch info
  if (isLoadingBranch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#d32f2f] mx-auto mb-4" />
          <p className="text-gray-600">Loading branch information...</p>
        </div>
      </div>
    );
  }

  // Show error if branch not found
  if (error && !branchInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Branch Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Please check your QR code or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b-2 border-red-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{businessInfo.logo}</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{businessInfo.name}</h1>
                <p className="text-sm text-gray-600">
                  {businessInfo.branchName ? `${businessInfo.branchName} • ` : ''}Earn points with every visit!
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-[#d32f2f]">{businessInfo.pointsRate}</div>
              <div className="text-xs text-gray-500">Points Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Step 1: Upload Receipt */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Receipt</h2>
                <p className="text-gray-600">Take a photo or upload your receipt to earn points</p>
              </div>

              {!uploadedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#d32f2f] transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] rounded-full flex items-center justify-center mb-4">
                      <Camera size={24} className="text-white" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Take a photo or upload
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Tap here to add your receipt
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Image size={16} />
                      <span>Works with any image format</span>
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    capture="environment"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="w-full h-64 object-contain bg-gray-100 rounded-lg border"
                    />
                    <button
                      onClick={resetUpload}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <button
                    onClick={processReceipt}
                    disabled={isProcessing || isConverting}
                    className="w-full bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] text-white py-4 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Reading receipt... {processingProgress}%
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Process Receipt
                      </>
                    )}
                  </button>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                >
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </motion.div>
              )}

              {isConverting && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Processing image...
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${conversionProgress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={16} className="animate-pulse text-[#d32f2f]" />
                      <span className="text-sm font-medium text-[#6c0f2a]">
                        Reading your receipt...
                      </span>
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#6c0f2a] mt-2">
                      {processingProgress}% complete
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: Phone Number */}
        {step === 2 && extractedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Receipt Processed!</h2>
                <p className="text-gray-600">Enter your phone number to earn points</p>
              </div>

              {/* Receipt Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Amount Spent</span>
                  <span className="text-lg font-bold text-green-600">
                    ₦{extractedData.amount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Points to Earn</span>
                  <span className="text-lg font-bold text-[#d32f2f]">
                    {Math.floor((extractedData.amount || 0) / 1000)} points
                  </span>
                </div>
              </div>

              {/* Phone Number Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={20} className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                      placeholder="0801 234 5678"
                      className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-[#d32f2f] focus:border-[#d32f2f] text-lg"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] text-white py-4 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Recording Purchase...
                    </>
                  ) : (
                    <>
                      <Gift size={20} />
                      Claim My Points
                    </>
                  )}
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                >
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && extractedData && purchaseResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="text-white" size={32} />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {purchaseResult.customer.isNewCustomer ? 'Welcome!' : 'Thank You!'}
              </h2>
              <p className="text-gray-600 mb-6">
                {purchaseResult.customer.isNewCustomer 
                  ? `Welcome to ${businessInfo.name}! Your purchase has been recorded.`
                  : `You've earned points with ${businessInfo.name}`
                }
              </p>

              {/* Purchase Summary */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
                <div className="text-4xl font-bold text-[#d32f2f] mb-2">
                  +{Math.floor((purchaseResult.purchase.amount || 0) / 1000)} Points
                </div>
                <div className="text-sm text-gray-600">
                  From your ₦{purchaseResult.purchase.amount?.toLocaleString()} purchase
                </div>
              </div>

              {/* Customer Stats */}
              {!purchaseResult.customer.isNewCustomer && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{purchaseResult.customer.visitCount}</div>
                      <div className="text-xs text-blue-700">Total Visits</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">₦{purchaseResult.customer.totalSpent?.toLocaleString()}</div>
                      <div className="text-xs text-blue-700">Total Spent</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="text-left space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Heart size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Purchase Recorded!</div>
                    <div className="text-sm text-gray-600">Your points have been added to {phoneNumber}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Gift size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Keep visiting!</div>
                    <div className="text-sm text-gray-600">Collect more points for rewards and discounts</div>
                  </div>
                </div>
              </div>

              <button
                onClick={resetUpload}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Upload Another Receipt
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VibeazyReceiptUpload;
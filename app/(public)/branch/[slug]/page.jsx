"use client";

import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Upload, Camera, FileImage, X, CheckCircle, AlertCircle, 
  Loader2, Receipt, Clock, DollarSign, Calendar, Image as ImageIcon,
  Sparkles, Building2, ShoppingCart, CreditCard, Tag, MapPin,
  ArrowRight, Phone, Gift, Star, Zap, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useParams } from 'next/navigation';  

const PurchaseReceiptUpload = () => {
  const params = useParams();
  const branchSlug = params.slug;
  // console.log(JSON.stringify('this is the branch slug', branchSlug));
  
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Fetch branch information using React Query
  const { data: branchData, isLoading: isLoadingBranch, error: branchError } = useQuery({
    queryKey: ['branch', branchSlug],
    queryFn: async () => {
      const response = await api.get(`/public/branch/${branchSlug}`);
      return response.data;
    },
    enabled: !!branchSlug,
    retry: false
  });

  // Purchase recording mutation
  const recordPurchaseMutation = useMutation({
    mutationFn: async (purchaseData) => {
      const response = await api.post(`/public/branch/${branchSlug}/purchase`, purchaseData);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage('Purchase recorded successfully!');
      setStep(3);
      setError(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to record purchase';
      if (error.response?.status === 409) {
        setError('This purchase has already been recorded. Please check if you\'ve already submitted this receipt.');
      } else {
        setError(errorMessage);
      }
    }
  });

  const businessInfo = branchData?.data ? {
    name: branchData.data.business.name,
    branchName: branchData.data.branch.name,
    branchAddress: branchData.data.branch.address
  } : {
    name: "Loading...",
    branchName: "",
    branchAddress: ""
  };

  const parseReceiptWithGemini = async (imageBase64) => {
    try {
      console.log('🔄 Starting Gemini API call...');
      console.log('📸 Image size:', Math.round(imageBase64.length / 1024), 'KB');
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not OK:', response.status, errorText);
        throw new Error(`Processing failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📋 API Response:', result);
      
      if (!result.success) {
        console.error('❌ API returned error:', result.error, result.details);
        throw new Error(result.error || 'Failed to process receipt');
      }
      
      console.log('✅ Gemini processing successful:', result.data);
      return result.data;
    } catch (error) {
      console.error('💥 Receipt processing error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  const formatDateTime = (dateTimeObj) => {
    if (!dateTimeObj || !dateTimeObj.date) {
      const now = new Date();
      return {
        day: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    }

    try {
      const dateStr = dateTimeObj.date + (dateTimeObj.time ? ' ' + dateTimeObj.time : '');
      const date = new Date(dateStr);
      
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    } catch (error) {
      const now = new Date();
      return {
        day: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    }
  };

  const isHEIC = (file) => {
    return file.type === 'image/heic' || file.type === 'image/heif' || 
           file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
  };

  // Image compression function
  const compressImage = (file, maxWidth = 1200, maxHeight = 1600, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          console.log('📷 Image compressed:', {
            originalSize: Math.round(file.size / 1024) + ' KB',
            compressedSize: Math.round(blob.size / 1024) + ' KB',
            compression: Math.round((1 - blob.size / file.size) * 100) + '%',
            dimensions: `${width}x${height}`
          });
          resolve(blob);
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const convertHEIC = async (file) => {
    setIsConverting(true);
    setConversionProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => Math.min(prev + 10, 90));
      }, 100);

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

    console.log('📁 File selected:', {
      name: file.name,
      size: Math.round(file.size / 1024) + ' KB',
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    const isImageFile = file.type.startsWith('image/') || isHEIC(file);
    if (!isImageFile) {
      console.error('❌ Invalid file type:', file.type);
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      console.error('❌ File too large:', Math.round(file.size / 1024 / 1024) + 'MB');
      setError(`Image too large (${Math.round(file.size / 1024 / 1024)}MB). Please use a smaller image or take a new photo.`);
      return;
    }

    console.log('✅ File validation passed');
    setError(null);
    setExtractedData(null);
    setSuccessMessage('');

    try {
      let processedFile = file;
      
      // Convert HEIC files first
      if (isHEIC(file)) {
        console.log('🔄 Converting HEIC file...');
        setSuccessMessage('Converting iPhone image format...');
        processedFile = await convertHEIC(file);
        setSuccessMessage('Image converted successfully!');
      }

      // Compress large images (>2MB or >3MB base64 equivalent)
      const shouldCompress = processedFile.size > 2 * 1024 * 1024; // 2MB
      
      if (shouldCompress) {
        console.log('🗜️ Compressing large image...');
        setSuccessMessage('Optimizing image for processing...');
        
        // Create a File object from the blob if it's not already a File
        if (processedFile instanceof Blob && !(processedFile instanceof File)) {
          processedFile = new File([processedFile], file.name, { type: processedFile.type || file.type });
        }
        
        const compressedBlob = await compressImage(processedFile);
        processedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
        setSuccessMessage('Image optimized successfully!');
      }

      setUploadedFile(processedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('📸 Preview generated, final size:', Math.round(e.target.result.length / 1024), 'KB');
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(processedFile);
      setSuccessMessage('Receipt uploaded successfully!');
    } catch (error) {
      console.error('❌ File processing error:', error);
      setError(error.message || 'Failed to process image file');
      setSuccessMessage('');
    }
  };

  const processReceipt = async () => {
    if (!uploadedFile) return;

    setProcessingProgress(0);
    setError(null);
    setSuccessMessage('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        console.log('reader.onload', e);
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
            setStep(2);
            setProcessingProgress(0);
            setSuccessMessage('Receipt processed successfully!');
          }, 1000);
        } catch (err) {
          console.error('Processing Error:', err);
          setError('Could not read your receipt. Please try again or take a clearer photo.');
          setProcessingProgress(0);
        }
      };
      reader.readAsDataURL(uploadedFile);
    } catch (err) {
      console.error('Process error:', err);
      setError('Something went wrong. Please try again.');
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

    if (!extractedData?.dateTime?.date) {
      setError('No purchase date detected from receipt');
      return;
    }

    if (!extractedData?.merchant?.name) {
      setError('No merchant name detected from receipt');
      return;
    }

    const purchaseData = {
      phoneNumber: phoneNumber.replace(/\s/g, ''),
      amount: extractedData.amount,
      purchaseDate: extractedData.dateTime ? 
        new Date(extractedData.dateTime.date + (extractedData.dateTime.time ? ' ' + extractedData.dateTime.time : '')).toISOString() : 
        new Date().toISOString(),
      merchantName: extractedData.merchant.name
    };

    console.log('📤 Submitting purchase data:', purchaseData);
    recordPurchaseMutation.mutate(purchaseData);
  };

  const resetUpload = () => {
    setStep(1);
    setUploadedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setPhoneNumber('');
    setError(null);
    setSuccessMessage('');
    setProcessingProgress(0);
    setIsConverting(false);
    setConversionProgress(0);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    if (numbers.length <= 11) return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7)}`;
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 11)}`;
  };

  const isProcessing = processingProgress > 0 || recordPurchaseMutation.isPending;

  // Loading state
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

  // Error state
  if (branchError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Branch Not Found</h2>
          <p className="text-gray-600 mb-4">
            {branchError.response?.data?.message || 'Failed to load branch information'}
          </p>
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
          <div className="flex items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{businessInfo.name}</h1>
              <p className="text-sm text-gray-600">
                {businessInfo.branchName ? `${businessInfo.branchName} • ` : ''}Earn points with every visit!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Success Message */}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg flex items-center gap-3"
          >
            <CheckCircle size={20} className="text-[#d32f2f] flex-shrink-0" />
            <span className="text-sm text-[#6c0f2a] font-medium">{successMessage}</span>
          </motion.div>
        )}

        {/* Step 1: Upload Receipt */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Receipt</h2>
                <p className="text-gray-600">Take a photo or upload your receipt to get discounts</p>
              </div>

              {!uploadedFile ? (
                <div
                  onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]); }}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#d32f2f] transition-colors"
                >
                  {/* <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] rounded-full flex items-center justify-center mb-4">
                      <Receipt size={24} className="text-white" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">Upload Your Receipt</p>
                    <p className="text-sm text-gray-500 mb-4">Choose how you want to add your receipt</p>
                  </div> */}

                  {/* Camera and Gallery Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#d32f2f] hover:bg-red-50 transition-all duration-200"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] rounded-full flex items-center justify-center mb-3">
                        <Camera size={20} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Take Photo</span>
                      <span className="text-xs text-gray-500">Use Camera</span>
                    </button>

                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-[#d32f2f] hover:bg-red-50 transition-all duration-200"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] rounded-full flex items-center justify-center mb-3">
                        <Upload size={20} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Upload</span>
                      <span className="text-xs text-gray-500">From Gallery</span>
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <ImageIcon size={16} />
                    <span>Supports JPG, PNG, HEIC formats</span>
                  </div>
                  
                  {/* Camera Input */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    capture="environment"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />

                  {/* Gallery Input */}
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*,.heic,.heif"
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
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </motion.div>
              )}

              {isConverting && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Processing image...</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${conversionProgress}%` }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {isProcessing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={16} className="animate-pulse text-[#d32f2f]" />
                      <span className="text-sm font-medium text-[#6c0f2a]">Reading your receipt...</span>
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] h-2 rounded-full transition-all duration-300" style={{ width: `${processingProgress}%` }} />
                    </div>
                    <p className="text-xs text-[#6c0f2a] mt-2">{processingProgress}% complete</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: Phone Number */}
        {step === 2 && extractedData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Receipt Processed!</h2>
                <p className="text-gray-600">Enter your phone number to get discounts</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Amount Spent</span>
                  <span className="text-lg font-bold text-green-600">₦{extractedData.amount?.toLocaleString() || '0'}</span>
                </div>
                
                {extractedData.dateTime && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Calendar size={16} />
                        Day
                      </span>
                      <span className="text-sm text-gray-800">{formatDateTime(extractedData.dateTime).day}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Clock size={16} />
                        Time
                      </span>
                      <span className="text-sm text-gray-800">{formatDateTime(extractedData.dateTime).time}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
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
                  disabled={recordPurchaseMutation.isPending}
                  className="w-full bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] text-white py-4 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center gap-2"
                >
                  {recordPurchaseMutation.isPending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Recording Purchase...
                    </>
                  ) : (
                    <>
                      <Gift size={20} />
                      Claim My Discounts
                    </>
                  )}
                </button>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && extractedData && recordPurchaseMutation.data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="text-white" size={32} />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {recordPurchaseMutation.data.data.customer.isNewCustomer ? 'Welcome!' : 'Thank You!'}
              </h2>
              <p className="text-gray-600 mb-6">
                {recordPurchaseMutation.data.data.customer.isNewCustomer 
                  ? `Thank you for visiting ${businessInfo.branchName}! Your purchase has been recorded.`
                  : `You've earned points with ${businessInfo.name}`
                }
              </p>

              {!recordPurchaseMutation.data.data.customer.isNewCustomer && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{recordPurchaseMutation.data.data.customer.visitCount}</div>
                      <div className="text-xs text-blue-700">Total Visits</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">₦{recordPurchaseMutation.data.data.customer.totalSpent?.toLocaleString()}</div>
                      <div className="text-xs text-blue-700">Total Spent</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-left space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Heart size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Purchase Recorded!</div>
                    <div className="text-sm text-gray-600">Your purchase has been added to {phoneNumber} for {businessInfo.branchName}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Gift size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Keep visiting {businessInfo.branchName}!</div>
                    <div className="text-sm text-gray-600">Collect more discounts for rewards and discounts</div>
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

export default PurchaseReceiptUpload;
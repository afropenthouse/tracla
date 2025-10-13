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
      return {
        day: "--",
        time: "--"
      };
    }

    try {
      // Parse date in DD/MM/YYYY or DD-MM-YYYY format
      const [day, month, year] = dateTimeObj.date.replace('-', '/').split('/');
      const dateStr = `${year}-${month}-${day}` + (dateTimeObj.time ? ' ' + dateTimeObj.time : '');
      const date = new Date(dateStr);
      
      return {
        day: date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      };
    } catch (error) {
      return {
        day: "--",
        time: "--"
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
          console.log('this is extracted data', result);
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

    // Check if date is valid (can be parsed properly)
    try {
      const [day, month, year] = extractedData.dateTime.date.replace('-', '/').split('/');
      const dateStr = `${year}-${month}-${day}` + (extractedData.dateTime.time ? ' ' + extractedData.dateTime.time : '');
      const date = new Date(dateStr);
      
      // Check if date is invalid (NaN)
      if (isNaN(date.getTime())) {
        setError('Invalid purchase date detected from receipt');
        return;
      }
    } catch (error) {
      setError('Invalid purchase date detected from receipt');
      return;
    }

    const purchaseData = {
      phoneNumber: phoneNumber.replace(/\s/g, ''),
      amount: extractedData.amount,
      purchaseDate: extractedData.dateTime && extractedData.dateTime.date ? 
        (() => {
          try {
            const [day, month, year] = extractedData.dateTime.date.replace('-', '/').split('/');
            const dateStr = `${year}-${month}-${day}` + (extractedData.dateTime.time ? ' ' + extractedData.dateTime.time : '');
            const date = new Date(dateStr);
            
            // Check if date is valid before converting to ISO string
            if (isNaN(date.getTime())) {
              return new Date().toISOString(); // Fallback to current date
            }
            return date.toISOString();
          } catch (error) {
            return new Date().toISOString(); // Fallback to current date on any error
          }
        })() : 
        new Date().toISOString(),
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

  // Loading states
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
                      Submit
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
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Thank you!</h2>
              <p className="text-gray-600 mb-6">
                {`Thank you for visiting ${businessInfo.name}! Your purchase has been recorded.`}
              </p>

              {/* Points Summary */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div>
                    <div className="text-2xl font-bold text-[#6c0f2a]">
                      {recordPurchaseMutation?.data?.data?.rewards?.currentPoints ?? 0}
                    </div>
                    <div className="text-xs text-gray-600">Total Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#6c0f2a]">
                      +{recordPurchaseMutation.data.data.purchase.pointsEarned}
                    </div>
                    <div className="text-xs text-gray-600">This Purchase</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#6c0f2a]">
                      ₦{Number(recordPurchaseMutation.data.data.customer.totalSpent ?? 0).toLocaleString('en-NG', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                    </div>
                    <div className="text-xs text-gray-600">Total Spent</div>
                  </div>
                </div>
                
                {/* Points to Naira conversion removed */}
              </div>

              {/* Rewards Progress */}
              {(() => {
                const rewardsData = recordPurchaseMutation.data.data.rewards;
                const currentPoints = rewardsData.currentPoints;
                const availableRewards = rewardsData.available || [];
                const nextReward = rewardsData.nextReward;
                const hasAchievedAll = rewardsData.hasAchievedAll;

                // Show banner only when ALL rewards have just been achieved
                const rewardAchievedMessage = rewardsData.rewardAchievedMessage;
                if (hasAchievedAll && rewardAchievedMessage) {
                  return (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 justify-center mb-2">
                        <CheckCircle size={18} className="text-green-600" />
                        <span className="font-medium text-green-800">All Rewards Achieved! 🎉</span>
                      </div>
                      <p className="text-sm text-green-700 text-center">
                        {rewardAchievedMessage}
                      </p>
                    </div>
                  );
                }

                // If no rewards are set up
                if (availableRewards.length === 0) {
                  return (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 justify-center mb-2">
                        <Gift size={18} className="text-yellow-600" />
                        <span className="font-medium text-yellow-800">No Rewards Available</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        This business hasn't set up any rewards yet. Check back later!
                      </p>
                    </div>
                  );
                }

                // If customer has achieved all rewards
                if (hasAchievedAll) {
                  return (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 justify-center mb-2">
                        <CheckCircle size={18} className="text-green-600" />
                        <span className="font-medium text-green-800">All Rewards Achieved! 🎉</span>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
{/* -                        You've unlocked all available rewards! Visit the store to claim your rewards. */}
+                       {`Congrats! You've received a ${availableRewards.length > 0 ? availableRewards[availableRewards.length - 1].label : ''} reward! Show this message at the counter to claim your rewards. Valid for a limited time — redeem now!`}
                      </p>s
                      <div className="space-y-2">
                        {availableRewards.map((reward, index) => (
                          <div key={reward.id} className="flex items-center justify-between bg-white p-2 rounded">
                            <div className="flex items-center gap-2">
                              <CheckCircle size={16} className="text-green-500" />
                              <span className="text-sm font-medium text-gray-900">{reward.label}</span>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {reward.points} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Show progress to next reward
                if (nextReward) {
                  const pointsNeeded = nextReward.points - currentPoints;
                  const progressPercent = Math.min(100, Math.round((currentPoints / nextReward.points) * 100));

                  return (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap size={18} className="text-[#d32f2f]" />
                        <span className="font-medium text-gray-900">Next Reward Progress</span>
                      </div>
                      
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4 mb-4">
                        {/* Next Reward Info */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-left">
                              <div className="font-semibold text-gray-900">{nextReward.label}</div>
                              <div className="text-xs text-gray-600">
                                {nextReward.description || 'Claim your reward!'}
                              </div>
                              {(nextReward.validFrom || nextReward.validTo) && (
                                <div className="text-xs text-gray-500">
                                  {`${nextReward.validFrom ? new Date(nextReward.validFrom).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}${nextReward.validFrom && nextReward.validTo ? ' — ' : ''}${nextReward.validTo ? new Date(nextReward.validTo).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}`}
                                </div>
                              )}
                            </div>
                          <div className="text-right">
                            <div className="font-bold text-[#6c0f2a]">{nextReward.points} pts</div>
                            <div className="text-xs text-gray-500">Required</div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-red-200 rounded-full h-3 mb-2">
                          <div
                            className="bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] h-3 rounded-full transition-all duration-700"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        
                        {/* Progress Text */}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {currentPoints} / {nextReward.points} points
                          </span>
                          <span className="font-semibold text-[#6c0f2a]">
                            {pointsNeeded} points to go
                          </span>
                        </div>
                      </div>

                      {/* All Available Rewards - commented out per request */}
                      { /*
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 text-left mb-2">Upcoming Reward</h4>
                        {availableRewards.map((reward) => {
                          const isAchieved = currentPoints >= reward.points;
                          const isNextReward = reward.id === nextReward.id;
                          
                          return (
                            <div 
                              key={reward.id} 
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                isAchieved 
                                  ? 'bg-green-50 border-green-200' 
                                  : isNextReward
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isAchieved ? (
                                  <CheckCircle size={16} className="text-green-500" />
                                ) : isNextReward ? (
                                  <Zap size={16} className="text-blue-500" />
                                ) : (
                                  <Gift size={16} className="text-gray-400" />
                                )}
                                <div className="text-left">
                                  <span className={`text-sm font-medium ${
                                    isAchieved ? 'text-green-800' : 'text-gray-900'
                                  }`}>
                                    {reward.label}
                                  </span>
                                  {reward.description && (
                                    <div className="text-xs text-gray-600">{reward.description}</div>
                                  )}
                                  {(reward.validFrom || reward.validTo) && (
                                    <div className="text-xs text-gray-500">
                                      {`${reward.validFrom ? new Date(reward.validFrom).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}${reward.validFrom && reward.validTo ? ' — ' : ''}${reward.validTo ? new Date(reward.validTo).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}`}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  isAchieved 
                                    ? 'bg-green-100 text-green-800' 
                                    : isNextReward
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {reward.points} pts
                                </span>
                                {isAchieved && (
                                  <div className="text-xs text-green-600 mt-1">Achieved! 🎉</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      */ }
                    </div>
                  );
                }

                return null;
              })()}

              {/* Additional Info */}
              <div className="text-left space-y-4 mt-6">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Keep visiting {businessInfo.name}!</div>
                    <div className="text-sm text-gray-600">Collect more points to unlock amazing rewards</div>
                  </div>
                </div>
              </div>

              <button
                onClick={resetUpload}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium mt-6"
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
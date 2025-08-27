"use client";

import React, { useState, useRef } from 'react';
import { 
  Upload, Camera, FileImage, X, CheckCircle, AlertCircle, 
  Loader2, Receipt, Clock, DollarSign, Calendar, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Tesseract from 'tesseract.js';
import heic2any from 'heic2any';

const ReceiptUploadPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Receipt parsing functions
  const parseAmount = (text) => {
    const lines = text.split('\n').map(line => line.trim());
    
    // Priority 1: Explicit total keywords (highest priority)
    const totalPatterns = [
      /(?:^|\s)total[:\s]*\$?(\d+\.\d{2})(?:\s|$)/gi,
      /(?:^|\s)amount\s+due[:\s]*\$?(\d+\.\d{2})(?:\s|$)/gi,
      /(?:^|\s)balance\s+due[:\s]*\$?(\d+\.\d{2})(?:\s|$)/gi,
      /(?:^|\s)grand\s+total[:\s]*\$?(\d+\.\d{2})(?:\s|$)/gi,
      /(?:^|\s)final\s+total[:\s]*\$?(\d+\.\d{2})(?:\s|$)/gi,
    ];

    // Check each line for high-priority total patterns
    for (const line of lines) {
      for (const pattern of totalPatterns) {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          const amount = parseFloat(match[1]);
          if (!isNaN(amount) && amount > 0 && amount < 10000) { // Reasonable total range
            console.log(`🎯 Found TOTAL via keyword: ${amount} from line: "${line}"`);
            return amount;
          }
        }
      }
    }

    // Priority 2: Currency format amounts in bottom section (medium priority)
    const bottomHalf = lines.slice(Math.floor(lines.length / 2));
    const currencyPatterns = [
      /\$(\d+\.\d{2})(?:\s|$)/g,
      /₦(\d+\.\d{2})(?:\s|$)/g,
      /(\d+\.\d{2})(?:\s|$)/g // Plain currency format
    ];

    const bottomAmounts = [];
    for (const line of bottomHalf) {
      // Skip reference numbers, terminal IDs, etc.
      if (/(?:ref|terminal|account|approval|tch)\s*#?\s*\d+/gi.test(line)) {
        continue;
      }
      
      for (const pattern of currencyPatterns) {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          const amount = parseFloat(match[1]);
          if (!isNaN(amount) && amount > 0 && amount < 10000) {
            bottomAmounts.push({
              amount,
              line: line,
              confidence: line.toLowerCase().includes('total') ? 3 : 
                         line.toLowerCase().includes('subtotal') ? 2 : 1
            });
          }
        }
      }
    }

    // Return highest confidence amount from bottom section
    if (bottomAmounts.length > 0) {
      const bestMatch = bottomAmounts.sort((a, b) => b.confidence - a.confidence)[0];
      console.log(`💰 Found amount via currency format: ${bestMatch.amount} from line: "${bestMatch.line}"`);
      return bestMatch.amount;
    }

    // Priority 3: Fallback - look for SUBTOTAL and add tax (lowest priority)
    for (const line of lines) {
      const subtotalMatch = line.match(/subtotal[:\s]*\$?(\d+\.\d{2})/gi);
      if (subtotalMatch) {
        const subtotal = parseFloat(subtotalMatch[0].match(/(\d+\.\d{2})/)[1]);
        
        // Look for tax amounts after subtotal
        const remainingLines = lines.slice(lines.indexOf(line));
        let totalTax = 0;
        
        for (const taxLine of remainingLines) {
          const taxMatch = taxLine.match(/(?:tax|th\s*\d+)[:\s]*\$?(\d+\.\d{2})/gi);
          if (taxMatch) {
            const tax = parseFloat(taxMatch[0].match(/(\d+\.\d{2})/)[1]);
            totalTax += tax;
          }
        }
        
        const calculatedTotal = subtotal + totalTax;
        console.log(`🧮 Calculated total: ${calculatedTotal} (Subtotal: ${subtotal} + Tax: ${totalTax})`);
        return calculatedTotal;
      }
    }

    console.log('❌ No amount could be extracted with confidence');
    return null;
  };

  const parseDateTime = (text) => {
    const datePatterns = [
      // DD/MM/YYYY HH:MM
      /(\d{1,2}\/\d{1,2}\/\d{4})\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)?/g,
      // DD-MM-YYYY HH:MM
      /(\d{1,2}-\d{1,2}-\d{4})\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)?/g,
      // YYYY/MM/DD HH:MM
      /(\d{4}\/\d{1,2}\/\d{1,2})\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)?/g,
      // Month DD, YYYY
      /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})/gi,
      // Time only patterns
      /(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)/g,
    ];

    const results = [];
    
    datePatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[0]) {
          results.push({
            full: match[0],
            date: match[1] || match[0],
            time: match[2] || null
          });
        }
      }
    });

    return results.length > 0 ? results[0] : null;
  };

  // HEIC file detection
  const isHEIC = (file) => {
    return file.type === 'image/heic' || 
           file.type === 'image/heif' || 
           file.name.toLowerCase().endsWith('.heic') || 
           file.name.toLowerCase().endsWith('.heif');
  };

  // Convert HEIC to JPEG
  const convertHEIC = async (file) => {
    setIsConverting(true);
    setConversionProgress(0);
    
    try {
      // Simulate conversion progress
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      });

      clearInterval(progressInterval);
      setConversionProgress(100);

      // Create a new File object from the converted blob
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
      throw new Error('Failed to convert HEIC image. Please try a different image.');
    }
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type (including HEIC)
    const isImageFile = file.type.startsWith('image/') || isHEIC(file);
    if (!isImageFile) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setExtractedData(null);

    try {
      let processedFile = file;

      // Check if file is HEIC and convert it
      if (isHEIC(file)) {
        toast.info('Converting iPhone image format...', { autoClose: 2000 });
        processedFile = await convertHEIC(file);
        toast.success('Image converted successfully!');
      }

      setUploadedFile(processedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(processedFile);

      toast.success('Receipt uploaded successfully!');

    } catch (error) {
      console.error('File processing error:', error);
      setError(error.message || 'Failed to process image file');
      toast.error('Failed to process image');
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
    setOcrProgress(0);
    setError(null);

    try {
      // Process image with Tesseract
      const result = await Tesseract.recognize(uploadedFile, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });

      const extractedText = result.data.text;
      console.log('=== EXTRACTED TEXT ===');
      console.log(extractedText);
      console.log('=====================');

      // Parse the extracted text
      const amount = parseAmount(extractedText);
      const dateTime = parseDateTime(extractedText);

      const parsedData = {
        rawText: extractedText,
        amount: amount,
        dateTime: dateTime,
        processedAt: new Date().toISOString()
      };

      setExtractedData(parsedData);

      // Console output as requested
      console.log('=== PARSED RECEIPT DATA ===');
      console.log('Amount:', amount);
      console.log('Date/Time:', dateTime);
      console.log('Full data:', parsedData);
      console.log('===========================');

      toast.success('Receipt processed successfully!');

    } catch (err) {
      console.error('OCR Error:', err);
      setError('Failed to process receipt. Please try again.');
      toast.error('Failed to process receipt');
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setError(null);
    setOcrProgress(0);
    setIsConverting(false);
    setConversionProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-[#1A73E8] rounded-2xl mb-4"
          >
            <Receipt size={32} className="text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Upload Receipt
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600"
          >
            Upload your receipt image and we'll extract the amount and time automatically
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Receipt</h2>
              
              {!uploadedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#1A73E8] transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center">
                    <Upload size={48} className="text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drop your receipt here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      or click to browse files
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <ImageIcon size={16} />
                      <span>Supports: JPG, PNG, GIF, HEIC (iPhone) - max 10MB</span>
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
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
                      className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                    />
                    <button
                      onClick={resetUpload}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>File:</strong> {uploadedFile.name}</p>
                    <p><strong>Size:</strong> {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>

                  <button
                    onClick={processReceipt}
                    disabled={isProcessing || isConverting}
                    className="w-full bg-[#1A73E8] text-white py-3 rounded-lg hover:bg-[#1557B0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing... {ocrProgress}%
                      </>
                    ) : (
                      <>
                        <Camera size={20} />
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
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </motion.div>
              )}

              {isConverting && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 size={16} className="animate-spin text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">
                        Converting iPhone Image...
                      </span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${conversionProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-orange-700 mt-2">
                      {conversionProgress}% complete - Converting HEIC to JPEG
                    </p>
                  </div>
                </motion.div>
              )}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Processing Receipt...
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      {ocrProgress}% complete - This may take a few moments
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Extracted Data</h2>
              
              {!extractedData ? (
                <div className="text-center py-8">
                  <FileImage size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Upload and process a receipt to see extracted data</p>
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Success indicator */}
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <CheckCircle size={20} />
                      <span className="font-medium">Receipt processed successfully!</span>
                    </div>

                    {/* Amount */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={20} className="text-[#1A73E8]" />
                        <h3 className="font-semibold text-gray-900">Amount</h3>
                      </div>
                      {extractedData.amount ? (
                        <p className="text-2xl font-bold text-[#1A73E8]">
                          ₦{extractedData.amount.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">Amount not detected</p>
                      )}
                    </div>

                    {/* Date/Time */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={20} className="text-[#1A73E8]" />
                        <h3 className="font-semibold text-gray-900">Date & Time</h3>
                      </div>
                      {extractedData.dateTime ? (
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">
                            {extractedData.dateTime.date}
                          </p>
                          {extractedData.dateTime.time && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock size={14} />
                              <span>{extractedData.dateTime.time}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Date/time not detected</p>
                      )}
                    </div>

                    {/* Console Log Notice */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        💡 <strong>Check your browser console</strong> for detailed extracted data and raw text
                      </p>
                    </div>

                    {/* Process Another Button */}
                    <button
                      onClick={resetUpload}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Process Another Receipt
                    </button>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Better Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Image Quality</h4>
              <ul className="space-y-1">
                <li>• Use good lighting</li>
                <li>• Avoid shadows and glare</li>
                <li>• Keep the receipt flat</li>
                <li>• Take photo straight-on</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What We Extract</h4>
              <ul className="space-y-1">
                <li>• Total amount or price</li>
                <li>• Purchase date</li>
                <li>• Transaction time</li>
                <li>• Store information (coming soon)</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReceiptUploadPage;
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, CreditCard, Copy, CheckCircle, ArrowLeft, Banknote, Building, Hash } from 'lucide-react';
import { usePaymentModalStore } from '@/store/modalStore';
import { useSubscriptionStore } from '@/store/store';
import { useBusinessStore } from '@/store/store';
import { useToastStore } from '@/store/toastStore';
import { getDVA, verifyPayment } from '@/lib/api';
import confetti from 'canvas-confetti';

const PaymentModal = () => {
  const { isOpen, onClose } = usePaymentModalStore();
  const { updateLastPaymentModalShown, dismissPaymentModalLonger, setSubscription } = useSubscriptionStore();
  const { business } = useBusinessStore();
  const { showSuccess, showError } = useToastStore();
  
  // Multi-step state: 'plans' -> 'payment' -> 'success'
  const [currentStep, setCurrentStep] = useState('plans');
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [activeMobilePlan, setActiveMobilePlan] = useState('growth');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment details
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Bank details (will be populated from API)
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    sortCode: ""
  });
  const [isCreatingDVA, setIsCreatingDVA] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [verificationError, setVerificationError] = useState('');

  const plans = [
    {
      id: 'growth',
      name: 'Tier 1',
      price: '₦20,000',
      description: 'Great for growing businesses',
      features: [
        {text: 'Access to customer dashboard with spending data', included: true},
        {text: 'Identify and reward top spenders', included: true},
        {text: 'View customer insights: number of visits, total spend, etc.', included: true},
        {text: '1 branch only', included: true},
        {text: 'Segment customers better using dashboard filters', included: true},
      ],
      highlight: true
    },
    {
      id: 'enterprise',
      name: 'Tier 2',
      price: '₦35,000',
      description: 'For large businesses and enterprises',
      features: [
        {text: 'Access to customer dashboard with spending data', included: true},
        {text: 'Identify and reward top spenders', included: true},
        {text: 'View customer insights: number of visits, total spend, etc.', included: true},
        {text: '3 branches only', included: true},
        {text: 'Segment customers better using dashboard filters', included: true},
        {text: 'Priority support', included: true},
        {text: 'Dedicated account manager', included: true},
      ],
      highlight: false
    },
    {
      id: 'custom',
      name: 'Custom',
      price: 'Custom',
      description: 'Tailored plan for unique business needs',
      features: [
        {text: 'Access to customer dashboard with spending data', included: true},
        {text: 'Identify and reward top spenders', included: true},
        {text: 'View customer insights: number of visits, total spend, etc.', included: true},
        {text: 'Unlimited branches', included: true},
        {text: 'Segment customers better using dashboard filters', included: true},
        {text: 'Priority support', included: true},
        {text: 'Dedicated account manager', included: true},
      ],
      highlight: false,
    },
  ];

  const handleClose = () => {
    updateLastPaymentModalShown();
    setCurrentStep('plans');
    setPaymentDetails(null);
    setVerificationError('');
    onClose();
  };

  const handleRemindLater = () => {
    dismissPaymentModalLonger();
    setCurrentStep('plans');
    setPaymentDetails(null);
    setVerificationError('');
    onClose();
    showSuccess('We\'ll remind you about upgrading in an hour.');
  };

  const handlePlanSelect = async (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (plan.id === 'custom') {
      showSuccess('We\'ll reach out to set up a custom plan.');
      try {
        window.open('mailto:traclaapp@gmail.com?subject=Custom%20Plan%20Request', '_blank');
      } catch (e) {}
      return;
    }
    const paymentData = {
      planId,
      planName: plan.name,
      amount: plan.price,
      periodText: 'for 1 month'
    };
    
    setPaymentDetails(paymentData);
    setIsCreatingDVA(true);
    setSelectedPlanForPayment(planId);
    
    try {
      // Call DVA API to get dedicated virtual account
      const dvaResponse = await getDVA({
        plan: planId,
        billingPeriod: 'monthly',
        amount: plan.price
      });
      
      // Update bank details with real DVA data
      const dvaData = dvaResponse.data.dva;
      setBankDetails({
        bankName: dvaData.bankName,
        accountName: dvaData.accountName,
        accountNumber: dvaData.accountNumber,
        sortCode: dvaData.bankId?.toString() || ""
      });
      
      setCurrentStep('payment');
    } catch (error) {
      console.error('Failed to create DVA:', error);
      showError('Failed to generate payment details. Please try again.');
    } finally {
      setIsCreatingDVA(false);
      setSelectedPlanForPayment(null);
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(`${label} copied to clipboard!`);
    } catch (err) {
      showError('Failed to copy to clipboard');
    }
  };

  const handlePaymentConfirm = async () => {
    if (!business?.id) {
      showError('Business information not found. Please try again.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Verify payment with backend
      const verificationResponse = await verifyPayment(business.id);
      const planData = verificationResponse.data;
      
      // Check if user is no longer on basic plan
      if (planData.currentTier === 'basic') {
        throw new Error('Payment not yet verified. Please ensure you have transferred the exact amount.');
      }
      
      // Update subscription in store
      setSubscription({
        plan: planData.currentTier,
        planName: paymentDetails.planName,
        amount: paymentDetails.amount,
        period: 'monthly',
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true
      });
      
      setCurrentStep('success');
      
      // Trigger confetti
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 300);
      
    } catch (error) {
      console.error('Payment verification failed:', error);
      setVerificationError(error.message || 'Payment verification failed. Please try again or contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessClose = () => {
    handleClose();
    showSuccess('Welcome to Tracla Pro! Enjoy your upgraded features.');
  };

  // Reset to plans step when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('plans');
      setPaymentDetails(null);
      setVerificationError('');
    }
  }, [isOpen]);

  const renderPlansStep = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-6 border-b border-white/30 bg-gradient-to-r from-white/80 to-white/60">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#6c0f2a] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Upgrade Your Plan</h2>
            <p className="text-xs sm:text-base text-gray-600">Choose the perfect plan for your business</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto -mx-3 sm:-mx-6 px-3 sm:px-6">
          <div className="flex gap-4 snap-x snap-mandatory">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                className={`min-w-[85%] snap-start rounded-2xl overflow-hidden flex flex-col relative ${plan.highlight ? 'border-2 border-[#6c0f2a] z-10' : 'border border-gray-200'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className={`p-4 text-center ${plan.highlight ? 'bg-[#6c0f2a] text-white' : 'bg-white'} relative`}>
                  <h3 className={`text-lg font-bold ${plan.highlight ? 'text-white' : 'text-[#6c0f2a]'}`}>{plan.name}</h3>
                  <p className={`text-xs mb-3 ${plan.highlight ? 'text-white' : 'text-gray-600'}`}>{plan.description}</p>
                  <div className="my-3">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? 'text-white' : 'text-gray-600'}`}>/mo</span>
                  </div>
                </div>
                <div className="bg-white p-4 flex-grow">
                  <div className="mb-4">
                    <button
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={isCreatingDVA && selectedPlanForPayment === plan.id}
                      className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-300 cursor-pointer ${
                        plan.highlight ? 'bg-[#6c0f2a] text-white hover:bg-[#5a0d23]' : 'bg-[#f8e5ea] text-[#6c0f2a] hover:bg-[#f0d8df]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isCreatingDVA && selectedPlanForPayment === plan.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs">Generating Account...</span>
                        </div>
                        ) : (
                          plan.id === 'custom' ? 'Contact Sales' : 'Choose Plan'
                        )}
                      </button>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 flex-shrink-0 mr-2 mt-0.5 ${feature.included ? 'text-green-500' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {feature.included ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          )}
                        </svg>
                        <span className={`text-xs ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop/Large Grid View */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-2xl mx-auto items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`rounded-2xl overflow-hidden flex flex-col relative ${plan.highlight ? 'border-2 border-[#6c0f2a] z-10' : 'border border-gray-200'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className={`p-6 text-center ${plan.highlight ? 'bg-[#6c0f2a] text-white' : 'bg-white'} relative ${plan.highlight ? 'pt-8' : ''}`}>
                <h3 className={`text-xl font-bold ${plan.highlight ? 'text-white' : 'text-[#6c0f2a]'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlight ? 'text-white' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                
                <div className="my-4">
                  <span className="text-3xl font-bold">
                    {plan.price}
                  </span>
                  <span className={`text-base ${plan.highlight ? 'text-white' : 'text-gray-600'}`}>
                    /mo
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-grow">
                <div className="bg-white p-6 flex-grow">
                  {/* Payment Button */}
                  <div className="mb-6">
                    <button
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={isCreatingDVA && selectedPlanForPayment === plan.id}
                      className={`w-full py-3 rounded-lg font-medium text-base transition-all duration-300 cursor-pointer ${
                        plan.highlight
                          ? 'bg-[#6c0f2a] text-white hover:bg-[#5a0d23]'
                          : 'bg-[#f8e5ea] text-[#6c0f2a] hover:bg-[#f0d8df]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isCreatingDVA && selectedPlanForPayment === plan.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Generating Account...</span>
                        </div>
                      ) : (
                        plan.id === 'custom' ? 'Contact Sales' : 'Choose Plan'
                      )}
                    </button>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        {feature.included ? (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 flex-shrink-0 mr-3 mt-0.5 text-green-500" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 flex-shrink-0 mr-3 mt-0.5 text-red-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            <p>Need a tailored plan? Contact sales for custom pricing and features.</p>
          </div>
          <button
            onClick={handleRemindLater}
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 underline transition-colors cursor-pointer"
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200/50">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button 
            onClick={() => setCurrentStep('plans')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#6c0f2a] to-[#d32f2f] flex items-center justify-center shadow-lg flex-shrink-0">
            <CreditCard className="w-4 h-4 sm:w-6 sm:h-6 text-white drop-shadow" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Payment Details</h2>
            <p className="text-xs sm:text-base text-gray-500">Transfer to complete your subscription</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {/* Order Summary */}
          <div className="rounded-xl p-4 sm:p-6 bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Order Summary</h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium text-xs sm:text-sm">{paymentDetails?.planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Period:</span>
                <span className="font-medium text-xs sm:text-sm">{paymentDetails?.periodText}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 sm:pt-3 mt-2 sm:mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 text-xs sm:text-sm">Total:</span>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#6c0f2a] to-[#d32f2f] bg-clip-text text-transparent">{paymentDetails?.amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-[#6c0f2a]" />
              Bank Details
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/60 hover:bg-white/80 transition-colors rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Bank</p>
                    <p className="font-medium text-sm">{bankDetails.bankName}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(bankDetails.bankName, 'Bank name')}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/60 ring-1 ring-gray-200 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/60 hover:bg-white/80 transition-colors rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Account Number</p>
                    <p className="font-medium text-sm">{bankDetails.accountNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account number')}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/60 ring-1 ring-gray-200 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/60 hover:bg-white/80 transition-colors rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Account Name</p>
                    <p className="font-medium text-sm">{bankDetails.accountName}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(bankDetails.accountName, 'Account name')}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/60 ring-1 ring-gray-200 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="max-w-4xl mx-auto mt-3 sm:mt-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-xl shadow-sm">
            <p className="text-xs text-indigo-900">
              <strong>Important:</strong> You must transfer the exact amount shown for quick payment verification.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {verificationError && (
          <div className="max-w-md mx-auto mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs sm:text-sm text-red-800">
                <strong>Error:</strong> {verificationError}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-4 max-w-md mx-auto mt-4 sm:mt-6">
          <button
            onClick={() => {
              setVerificationError('');
              setCurrentStep('plans');
            }}
            className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 border border-white/50 bg-white/40 backdrop-blur-sm text-gray-800 rounded-xl hover:bg-white/60 transition-colors font-medium text-xs sm:text-sm cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={handlePaymentConfirm}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-[#6c0f2a] to-[#d32f2f] text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs sm:text-sm">Verifying...</span>
              </div>
            ) : (
              'I Have Made Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200/50">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#6c0f2a] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Payment Successful!</h2>
            <p className="text-xs sm:text-base text-gray-600">Welcome to Tracla Pro</p>
          </div>
        </div>
        <button
          onClick={handleSuccessClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#6c0f2a]/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-[#6c0f2a]" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Thank You for Your Payment!
          </h3>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            Your subscription to <strong>{paymentDetails?.planName}</strong> has been activated successfully.
          </p>
        </motion.div>

        <div className="bg-gradient-to-r from-[#6c0f2a]/5 to-[#d32f2f]/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8 border border-[#6c0f2a]/20">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">What's Next?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-left">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#6c0f2a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">Access Premium Features</p>
                <p className="text-xs sm:text-sm text-gray-600">All premium features are now available in your dashboard</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#6c0f2a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">Setup Complete</p>
                <p className="text-xs sm:text-sm text-gray-600">Your account is ready for advanced customer analytics</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSuccessClose}
          className="bg-[#6c0f2a] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-[#5a0d23] transition-colors font-medium text-sm sm:text-base cursor-pointer"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 p-2 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`mx-auto h-full ${currentStep === 'plans' ? 'max-w-screen-2xl' : 'max-w-3xl'}`}>
              <div className="h-full bg-white/80 backdrop-blur-2xl rounded-[24px] shadow-2xl border border-white/30 ring-1 ring-black/5 overflow-hidden">
            <AnimatePresence mode="wait">
              {currentStep === 'plans' && (
                <motion.div
                  key="plans"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col"
                >
                  {renderPlansStep()}
                </motion.div>
              )}
              
              {currentStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col"
                >
                  {renderPaymentStep()}
                </motion.div>
              )}
              
              {currentStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col"
                >
                  {renderSuccessStep()}
                </motion.div>
              )}
            </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;

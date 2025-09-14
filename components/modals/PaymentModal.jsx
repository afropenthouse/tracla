"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, CreditCard, Copy, CheckCircle, ArrowLeft, Banknote, Building, Hash } from 'lucide-react';
import { usePaymentModalStore } from '@/store/modalStore';
import { useSubscriptionStore } from '@/store/store';
import { useToastStore } from '@/store/toastStore';
import confetti from 'canvas-confetti';

const PaymentModal = () => {
  const { isOpen, onClose } = usePaymentModalStore();
  const { updateLastPaymentModalShown, dismissPaymentModalLonger, setSubscription } = useSubscriptionStore();
  const { showSuccess, showError } = useToastStore();
  
  // Multi-step state: 'plans' -> 'payment' -> 'success'
  const [currentStep, setCurrentStep] = useState('plans');
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [billingPeriods, setBillingPeriods] = useState({
    starter: 'monthly',
    growth: 'monthly',
    business: 'monthly'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment details
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Bank details (fake data)
  const bankDetails = {
    bankName: "Guaranty Trust Bank (GTBank)",
    accountName: "Tracla Technologies Ltd",
    accountNumber: "0123456789",
    sortCode: "058152052"
  };

  const getPrice = (plan, period) => {
    return plan.price[period];
  };

  const getPeriod = (period) => {
    return '/mo';
  };

  const getPeriodText = (period) => {
    if (period === 'quarterly') return 'for 3 months';
    if (period === 'yearly') return 'for 12 months';
    return 'for 1 month';
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: {
        monthly: '₦35,000',
        quarterly: '₦29,000',
        yearly: '₦25,000'
      },
      description: 'Perfect for small businesses',
      features: [
        {text: 'Access to customer dashboard with spending data', included: true},
        {text: 'Identify and reward top spenders', included: true},
        {text: 'View customer insights: number of visits, total spend, etc.', included: true},
        {text: '1 branch only', included: true},
        {text: 'Segment customers better using dashboard filters', included: true},
      ],
      highlight: false
    },
    {
      id: 'growth',
      name: 'Growth',
      price: {
        monthly: '₦45,000',
        quarterly: '₦39,000',
        yearly: '₦35,000'
      },
      description: 'Great for growing businesses',
      features: [
        {text: 'Access to customer dashboard with spending data', included: true},
        {text: 'Identify and reward top spenders', included: true},
        {text: 'View customer insights: number of visits, total spend, etc.', included: true},
        {text: '3 branches only', included: true},
        {text: 'Segment customers better using dashboard filters', included: true},
      ],
      highlight: true
    },
    {
      id: 'business',
      name: 'Enterprise',
      price: {
        monthly: '₦140,000',
        quarterly: '₦120,000',
        yearly: '₦100,000'
      },
      description: 'For large businesses and enterprises',
      features: [
        {text: 'Access to customer dashboard with spending data', included: true},
        {text: 'Identify and reward top spenders', included: true},
        {text: 'View customer insights: number of visits, total spend, etc.', included: true},
        {text: 'Unlimited branches', included: true},
        {text: 'Segment customers better using dashboard filters', included: true},
        {text: 'Priority support', included: true},
        {text: 'Dedicated account manager', included: true},
      ],
      highlight: false
    },
  ];

  const handleClose = () => {
    updateLastPaymentModalShown();
    setCurrentStep('plans');
    setPaymentDetails(null);
    onClose();
  };

  const handleRemindLater = () => {
    dismissPaymentModalLonger();
    setCurrentStep('plans');
    setPaymentDetails(null);
    onClose();
    showSuccess('We\'ll remind you about upgrading in an hour.');
  };

  const handlePlanSelect = (planId, period) => {
    const plan = plans.find(p => p.id === planId);
    setPaymentDetails({
      planId,
      planName: plan.name,
      period,
      amount: plan.price[period],
      periodText: getPeriodText(period)
    });
    setCurrentStep('payment');
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
    setIsProcessing(true);
    
    try {
      // Simulate payment verification (2 seconds delay)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set subscription in store
      setSubscription({
        plan: paymentDetails.planId,
        planName: paymentDetails.planName,
        amount: paymentDetails.amount,
        period: paymentDetails.period,
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
      showError('Payment verification failed. Please try again.');
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
    }
  }, [isOpen]);

  const renderPlansStep = () => (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#6c0f2a] rounded-xl flex items-center justify-center">
              <Crown size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#6c0f2a]">Upgrade Your Plan</h2>
              <p className="text-gray-600">Choose the perfect plan for your business</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setBillingPeriods({starter: 'monthly', growth: 'monthly', business: 'monthly'})}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer ${
                billingPeriods.starter === 'monthly' && billingPeriods.growth === 'monthly' && billingPeriods.business === 'monthly'
                  ? 'bg-[#6c0f2a] text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriods({starter: 'quarterly', growth: 'quarterly', business: 'quarterly'})}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer ${
                billingPeriods.starter === 'quarterly' && billingPeriods.growth === 'quarterly' && billingPeriods.business === 'quarterly'
                  ? 'bg-[#6c0f2a] text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setBillingPeriods({starter: 'yearly', growth: 'yearly', business: 'yearly'})}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer ${
                billingPeriods.starter === 'yearly' && billingPeriods.growth === 'yearly' && billingPeriods.business === 'yearly'
                  ? 'bg-[#6c0f2a] text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`rounded-2xl overflow-hidden flex flex-col relative ${plan.highlight ? 'border-2 border-[#6c0f2a] z-10' : 'border border-gray-200'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                  <span className="bg-yellow-400 text-[#6c0f2a] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <div className={`p-6 text-center ${plan.highlight ? 'bg-[#6c0f2a] text-white' : 'bg-white'} relative ${plan.highlight ? 'pt-8' : ''}`}>
                
                <h3 className={`text-xl font-bold ${plan.highlight ? 'text-white' : 'text-[#6c0f2a]'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlight ? 'text-white' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                
                <div className="my-4">
                  <span className="text-3xl font-bold">
                    {getPrice(plan, billingPeriods[plan.id])}
                  </span>
                  <span className={`text-base ${plan.highlight ? 'text-white' : 'text-gray-600'}`}>
                    {getPeriod(billingPeriods[plan.id])}
                  </span>
                  <div className={`text-sm mt-1 ${plan.highlight ? 'text-white' : 'text-gray-600'}`}>
                    {getPeriodText(billingPeriods[plan.id])}
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-grow">
                <div className="bg-white p-6 flex-grow">
                  {/* Payment Button */}
                  <div className="mb-6">
                    <button
                      onClick={() => handlePlanSelect(plan.id, billingPeriods[plan.id])}
                      className={`w-full py-3 rounded-lg font-medium text-base transition-all duration-300 cursor-pointer ${
                        plan.highlight
                          ? 'bg-[#6c0f2a] text-white hover:bg-[#5a0d23]'
                          : 'bg-[#f8e5ea] text-[#6c0f2a] hover:bg-[#f0d8df]'
                      }`}
                    >
                      Choose Plan
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
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-600 mb-4">
            <p>All plans include 24/7 support and a 30-day money-back guarantee</p>
            <p className="mt-1">Cancel anytime • No setup fees</p>
          </div>
          <button
            onClick={handleRemindLater}
            className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors cursor-pointer"
          >
            Remind me later
          </button>
        </div>
      </div>
    </>
  );

  const renderPaymentStep = () => (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentStep('plans')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-[#6c0f2a] rounded-xl flex items-center justify-center">
              <CreditCard size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#6c0f2a]">Payment Details</h2>
              <p className="text-gray-600">Transfer to complete your subscription</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Left Column - Order Summary */}
          <div className="bg-gradient-to-r from-[#6c0f2a]/10 to-[#d32f2f]/10 rounded-xl p-4 border border-[#6c0f2a]/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">{paymentDetails?.planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Period:</span>
                <span className="font-medium">{paymentDetails?.periodText}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-[#6c0f2a]">{paymentDetails?.amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Bank Details */}
          <div className="bg-white border-2 border-[#6c0f2a]/20 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Banknote size={18} className="text-[#6c0f2a]" />
              Bank Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building size={14} className="text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Bank</p>
                    <p className="font-medium text-sm">{bankDetails.bankName}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(bankDetails.bankName, 'Bank name')}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                >
                  <Copy size={14} className="text-gray-600" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Account Number</p>
                    <p className="font-medium text-sm">{bankDetails.accountNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account number')}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                >
                  <Copy size={14} className="text-gray-600" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Account Name</p>
                    <p className="font-medium text-sm">{bankDetails.accountName}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(bankDetails.accountName, 'Account name')}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                >
                  <Copy size={14} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="max-w-4xl mx-auto mt-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Important:</strong> Use your business email as transfer reference for quick identification.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 max-w-md mx-auto mt-6">
          <button
            onClick={() => setCurrentStep('plans')}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={handlePaymentConfirm}
            disabled={isProcessing}
            className="flex-1 bg-[#6c0f2a] text-white px-4 py-2.5 rounded-lg hover:bg-[#5a0d23] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </div>
            ) : (
              'I Have Made Payment'
            )}
          </button>
        </div>
      </div>
    </>
  );

  const renderSuccessStep = () => (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#6c0f2a] rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#6c0f2a]">Payment Successful!</h2>
              <p className="text-gray-600">Welcome to Tracla Pro</p>
            </div>
          </div>
          <button
            onClick={handleSuccessClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-[#6c0f2a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-[#6c0f2a]" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You for Your Payment!
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Your subscription to <strong>{paymentDetails?.planName}</strong> has been activated successfully.
          </p>
        </motion.div>

        <div className="bg-gradient-to-r from-[#6c0f2a]/5 to-[#d32f2f]/5 rounded-2xl p-6 mb-8 border border-[#6c0f2a]/20">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6c0f2a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Access Premium Features</p>
                <p className="text-sm text-gray-600">All premium features are now available in your dashboard</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#6c0f2a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Setup Complete</p>
                <p className="text-sm text-gray-600">Your account is ready for advanced customer analytics</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSuccessClose}
          className="bg-[#6c0f2a] text-white px-8 py-3 rounded-xl hover:bg-[#5a0d23] transition-colors font-medium cursor-pointer"
        >
          Continue to Dashboard
        </button>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              {currentStep === 'plans' && (
                <motion.div
                  key="plans"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
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
                >
                  {renderSuccessStep()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
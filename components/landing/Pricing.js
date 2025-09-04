import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [billingPeriods, setBillingPeriods] = useState({
    starter: 'monthly',
    growth: 'monthly',
    business: 'monthly'
  });

  const getPrice = (plan, period) => {
    return plan.price[period];
  };

  const getPeriod = (period) => {
    if (period === 'quarterly') return '/monthly';
    if (period === 'yearly') return '/monthly';
    return '/month';
  };

  const calculateDiscount = (plan, period) => {
    if (plan.id === 'starter' || period === 'monthly') return null;
    if (plan.id === 'growth' && period === 'quarterly') return 7;
    if (plan.id === 'business' && period === 'quarterly') return 3;
    if (plan.id === 'growth' && period === 'yearly') return 20;
    if (plan.id === 'business' && period === 'yearly') return 10;
    return null;
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      price: {
        monthly: '₦59,999',
        quarterly: '₦49,999',
        yearly: '₦39,999'
      },
      description: 'Perfect for small businesses',
      features: [
        {text: 'Access to customer dashboard with spending data', included: true},
        {text: 'Identify and reward top spenders', included: true},
        {text: 'View customer insights: number of visits, total spend, etc.', included: true},
        {text: '1 branch only', included: true},
        // {text: 'Send up to 300 whatsapp promo messages per month', included: true},
        {text: 'Segment customers better using dashboard filters', included: true},

      ],
      highlight: false
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      price: {
        monthly: '₦99,999',
        quarterly: '₦89,999',
        yearly: '₦79,999'
      },
      description: 'Great for growing businesses',
      features: [
        {text: 'Access to customer dashboard with spending data', included: true},
        {text: 'Identify and reward top spenders', included: true},
        {text: 'View customer insights: number of visits, total spend, etc.', included: true},
        // {text: 'Send up to 1000 whatsapp promo messages per month', included: true},
        {text: '3 branches only', included: true},
        {text: 'Segment customers better using dashboard filters', included: true},
      ],
      highlight: true
    },
    {
      id: 'business',
      name: 'Business Plan',
      price: {
        monthly: '₦199,999',
        quarterly: '₦189,999',
        yearly: '₦179,999'
      },
      description: 'For large businesses and enterprises',
      features: [
        {text: 'Access to customer dashboard with spending data', included: true},
        {text: 'Identify and reward top spenders', included: true},
        {text: 'View customer insights: number of visits, total spend, etc.', included: true},
        // {text: 'Send up to 1500 whatsapp promo messages per month', included: true},
        {text: 'Unlimited branches', included: true},
        {text: 'Segment customers better using dashboard filters', included: true},
        {text: 'Priority support', included: true},
        {text: 'Dedicated account manager', included: true},
      ],
      highlight: false
    }
  ];

  return (
    <section className="py-20 bg-[#f9f2f4]">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#6c0f2a] mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Choose the plan that fits your business needs. All plans include core features to boost customer loyalty.
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setBillingPeriods({starter: 'monthly', growth: 'monthly', business: 'monthly'})}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                billingPeriods.starter === 'monthly' && billingPeriods.growth === 'monthly' && billingPeriods.business === 'monthly'
                  ? 'bg-[#6c0f2a] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriods({starter: 'quarterly', growth: 'quarterly', business: 'quarterly'})}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                billingPeriods.starter === 'quarterly' && billingPeriods.growth === 'quarterly' && billingPeriods.business === 'quarterly'
                  ? 'bg-[#6c0f2a] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setBillingPeriods({starter: 'yearly', growth: 'yearly', business: 'yearly'})}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                billingPeriods.starter === 'yearly' && billingPeriods.growth === 'yearly' && billingPeriods.business === 'yearly'
                  ? 'bg-[#6c0f2a] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`rounded-2xl overflow-hidden flex flex-col ${plan.highlight ? 'border-2 border-[#6c0f2a] z-10' : 'border border-[#f0d8df]'}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={`p-6 text-center ${plan.highlight ? 'bg-[#6c0f2a] text-white' : 'bg-white'} relative`}>
                <h3 className={`text-xl md:text-2xl font-bold ${plan.highlight ? 'text-white' : 'text-[#6c0f2a]'}`}>{plan.name}</h3>
                <div className="block lg:hidden my-4">
                  <div className="flex justify-center space-x-1 mb-2">
                    <button
                      onClick={() => setBillingPeriods({...billingPeriods, [plan.id]: 'monthly'})}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        billingPeriods[plan.id] === 'monthly'
                          ? 'bg-[#6c0f2a] text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingPeriods({...billingPeriods, [plan.id]: 'quarterly'})}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        billingPeriods[plan.id] === 'quarterly'
                          ? 'bg-[#6c0f2a] text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Quarterly
                    </button>
                    <button
                      onClick={() => setBillingPeriods({...billingPeriods, [plan.id]: 'yearly'})}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        billingPeriods[plan.id] === 'yearly'
                          ? 'bg-[#6c0f2a] text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
                <div className="my-4">
                  <span className="text-3xl md:text-4xl font-bold">{getPrice(plan, billingPeriods[plan.id])}</span>
                  <span className={`text-lg ${plan.highlight ? 'text-white' : 'text-gray-600'}`}>{getPeriod(billingPeriods[plan.id])}</span>
                </div>
                <p className="text-base">
                  {plan.description}
                  {billingPeriods[plan.id] !== 'monthly' && (
                    <span className="block text-sm text-green-600 font-semibold mt-1">
                      {billingPeriods[plan.id] === 'quarterly' ? 'Saves ₦120,000 annually' : 'Saves ₦240,000 annually'}
                    </span>
                  )}
                </p>
              </div>

              {/* Content area with no extra space */}
              <div className="flex flex-col flex-grow">
                <div className="bg-white p-6 flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        {feature.included ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 flex-shrink-0 mr-3 mt-0.5 text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 mr-3 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={`text-base ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button placed directly under content */}
                <div className="bg-white p-6 pt-0">
                  <button
                    className={`w-full py-3 rounded-lg font-medium text-base ${
                      selectedPlan === plan.id
                        ? 'bg-[#6c0f2a] text-white hover:bg-[#5a0d23] border-2 border-[#6c0f2a]'
                        : plan.highlight
                          ? 'bg-[#6c0f2a] text-white hover:bg-[#5a0d23]'
                          : 'bg-[#f8e5ea] text-[#6c0f2a] hover:bg-[#f0d8df]'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Pricing;
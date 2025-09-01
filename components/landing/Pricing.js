import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState('growth');
  
  const plans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      price: '₦49,999',
      period: '/month',
      description: 'Perfect for business with up to 100 customers',
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
      price: '₦99,999',
      period: '/month',
      description: 'Great for growing businesses with up to 500 customers.',
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
      price: '₦199,999',
      period: '/month',
      description: 'For larger businesses with up to 1000 customers.',
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
              <div className={`p-6 text-center ${plan.highlight ? 'bg-[#6c0f2a] text-white' : 'bg-white'}`}>
                <h3 className={`text-xl md:text-2xl font-bold ${plan.highlight ? 'text-white' : 'text-[#6c0f2a]'}`}>{plan.name}</h3>
                <div className="my-4">
                  <span className="text-3xl md:text-4xl font-bold">{plan.price}</span>
                  <span className={`text-lg ${plan.highlight ? 'text-white' : 'text-gray-600'}`}>{plan.period}</span>
                </div>
                <p className="text-base">{plan.description}</p>
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
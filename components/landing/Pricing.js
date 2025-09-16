import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const Pricing = () => {
  const router = useRouter();

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
        // {text: 'Send up to 1000 whatsapp promo messages per month', included: true},
        {text: '3 branches only', included: true},
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
        // {text: 'Send up to 1500 whatsapp promo messages per month', included: true},
        {text: 'Unlimited branches', included: true},
        {text: 'Segment customers better using dashboard filters', included: true},
        {text: 'Priority support', included: true},
        {text: 'Dedicated account manager', included: true},
      ],
      highlight: false
    },
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


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
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
                <p className="text-base mb-4">
                  {plan.description}
                </p>
                <div className="my-4">
                  <span className="text-2xl md:text-3xl font-bold">
                    {plan.price} <span className={`text-base ${plan.highlight ? 'text-white' : 'text-gray-600'}`}>/month</span>
                  </span>
                </div>
              </div>

              {/* Content area with no extra space */}
              <div className="flex flex-col flex-grow">
                <div className="bg-white p-6 flex-grow">
                  {/* Button placed before features list */}
                  <div className="mb-6">
                    <button
                      className={`w-full py-3 rounded-lg font-medium text-base ${
                        plan.highlight
                          ? 'bg-[#6c0f2a] text-white hover:bg-[#5a0d23]'
                          : 'bg-[#f8e5ea] text-[#6c0f2a] hover:bg-[#f0d8df]'
                      }`}
                      onClick={() => router.push('/signup')}
                    >
                      Select Plan
                    </button>
                  </div>

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
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Pricing;
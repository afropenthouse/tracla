import React from 'react';
import { motion } from 'framer-motion';

const WhyWorks = () => {
  const benefits = [
    "No customer app needed",
    "Works with any payment method (POS, cash, transfer)",
    "Automatically builds your WhatsApp list",
    "Helps you keep contact with your customers",
    "Rewards tied to actual spend",
    "Drives loyalty and higher customer lifetime value"
  ];

  const launchFeatures = [
    {
      title: "Exclusive Launch Pricing",
      description: "Choose the plan that fits your business needs",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Custom Setup Assistance",
      description: "Personalized onboarding for your business",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#6c0f2a] mb-4">Why Vibeazy Works</h2>
            <p className="text-lg text-gray-700">Powerful features designed to grow your business</p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="h-full"
            >
              <div className="bg-gradient-to-br from-[#6c0f2a] to-[#d32f2f] rounded-2xl p-8 text-white h-full">
                <h3 className="text-2xl font-bold mb-6">Benefits for Your Business</h3>
                
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-300 flex-shrink-0 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            
            {/* Launch Features Box */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="h-full"
            >
              <div className="bg-gradient-to-br from-[#f8e5ea] to-white border-2 border-[#f0d8df] rounded-2xl p-8 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-[#6c0f2a] mb-6">Launch Special Features</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 flex-grow">
                  {launchFeatures.map((item, index) => (
                    <motion.div 
                      key={index}
                      className="bg-white p-5 rounded-xl shadow-md flex flex-col"
                      whileHover={{ y: -5 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#6c0f2a] flex items-center justify-center text-white mb-4">
                        {item.icon}
                      </div>
                      <h4 className="font-bold text-lg text-[#6c0f2a] mb-2">{item.title}</h4>
                      <p className="text-gray-700 flex-grow">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-auto pt-6 border-t border-[#f0d8df]">
                  <p className="text-center text-[#6c0f2a] font-bold">
                    Start building customer loyalty today
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyWorks;
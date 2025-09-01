// src/components/HowItWorks.js
import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  const steps = [
    {
      title: "Sign up your business",
      description: "Get started in minutes with a simple setup process."
    },
    {
      title: "Generate your QR code",
      description: "Create a unique QR code from your dashboard."
    },
    {
      title: "Place QR code at venue",
      description: "Display it prominently at counters, tables, or on receipts."
    },
    {
      title: "Customers scan & upload",
      description: "Customers scan, upload receipt, and enter phone number."
    },
    {
      title: "Track spending automatically",
      description: "Identify your top spenders effortlessly."
    },
    {
      title: "Reward your top spenders",
      description: "Offer deals to your customers on Whatsapp directly from your dashboard."
    },
    {
      title: "Make more sales",
      description: "When you reward your top spenders, they spend more."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#f9f2f4]">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#6c0f2a] mb-4">How it works</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">Transform customer interactions into loyal relationships in just a few simple steps</p>
        </motion.div>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#e8c4cf] hidden md:block"></div>
          
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="flex flex-col md:flex-row items-center md:items-stretch"
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Number circle positioned properly for desktop */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-[#6c0f2a] flex items-center justify-center text-white font-bold text-xl z-10 ${index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                  {index + 1}
                </div>
                
                {/* Step content aligned properly */}
                <motion.div 
                  className={`bg-white p-6 rounded-xl shadow-lg mt-4 md:mt-0 md:w-5/12 ${index % 2 === 0 ? 'md:mr-4' : 'md:ml-4'}`}
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <h3 className="text-xl font-bold text-[#6c0f2a] mb-2">{step.title}</h3>
                  <p className="text-gray-700">{step.description}</p>
                </motion.div>
                
                {/* Empty spacer for even items to push content to the right */}
                {index % 2 === 0 && <div className="hidden md:block flex-grow"></div>}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
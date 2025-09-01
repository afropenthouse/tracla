import React from 'react';
import { motion } from 'framer-motion';

const ForWho = () => {
  const businessTypes = [
    {
      icon: "🍽️",
      title: "Restaurants & Bars",
      description: "Reward regulars, drive repeat dining"
    },
    {
      icon: "🛒",
      title: "Supermarkets & Minimarkets",
      description: "Turn shoppers into loyal customers"
    },
    {
      icon: "💇",
      title: "Salons & Spas",
      description: "Encourage repeat bookings and referrals"
    },
    // {
    //   icon: "🏪",
    //   title: "Convenience Stores",
    //   description: "Build loyalty with daily customers"
    // },
    // {
    //   icon: "☕",
    //   title: "Cafés & Bakeries",
    //   description: "Reward frequent visitors"
    // }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#6c0f2a] mb-4">Who is Vibeazy For?</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Vibeazy works for any in-person business that wants to know their customers, identify their top spenders & make them spend more.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businessTypes.map((business, index) => (
            <motion.div 
              key={index}
              className="border border-[#f0d8df] rounded-xl p-6 hover:border-[#6c0f2a] transition-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(108, 15, 42, 0.1)"
              }}
            >
              <div className="text-4xl mb-4">{business.icon}</div>
              <h3 className="text-xl font-bold text-[#6c0f2a] mb-2">{business.title}</h3>
              <p className="text-gray-700">{business.description}</p>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 bg-gradient-to-r from-[#6c0f2a] to-[#d32f2f] rounded-2xl p-8 text-white text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h3 className="text-2xl font-bold mb-4">Perfect for any in-person business</h3>
          <p className="max-w-2xl mx-auto">
            If your business collects payments in person, issues receipts, and wants more returning customers — Vibeazy is built for you.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ForWho;
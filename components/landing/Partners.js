import React from 'react';
import { motion } from 'framer-motion';

const Partners = () => {
  const partners = [
    { name: "Partner 1" },
    { name: "Partner 2" },
    { name: "Partner 3" },
    { name: "Partner 4" },
    { name: "Partner 5" }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-[#6c0f2a] mb-4">Trusted by Businesses</h2>
          <p className="text-gray-700">Join hundreds of businesses using Vibeazy to drive customer loyalty</p>
        </motion.div>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {partners.map((partner, index) => (
            <motion.div 
              key={index}
              className="flex items-center justify-center w-32 h-16 bg-gray-100 rounded-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <span className="text-gray-700 font-medium">{partner.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
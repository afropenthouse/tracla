import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  const businessTypes = [
    'Restaurants & Bars',
    'Supermarkets',
    'Salons',
    'Spas',
  ];

  return (
    <section className="min-h-screen flex items-center relative bg-gradient-to-br from-[#f9f2f4] to-white overflow-hidden pt-[72px] md:pt-0">
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between w-full">
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
          className="md:w-1/2 mb-10 md:mb-0"
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#6c0f2a] mb-4 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
          Make Your Top Customers <span className="text-[#d32f2f]">Spend More</span>
          </motion.h1>
          
          <motion.h2 
            className="text-xl md:text-2xl text-gray-700 mb-8 max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Track spending. Reward customers. Sell more.
          </motion.h2>
          
          <motion.div 
            className="flex flex-wrap gap-2 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {businessTypes.map((item, index) => (
              <motion.span 
                key={index}
                className="px-3 py-1.5 bg-[#f8e5ea] text-[#6c0f2a] rounded-full text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {item}
              </motion.span>
            ))}
          </motion.div>
          
          <motion.button 
            className="px-8 py-3.5 bg-gradient-to-r from-[#6c0f2a] to-[#d32f2f] text-white font-bold rounded-lg text-lg hover:opacity-90 transition-opacity shadow-lg"
            whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(108, 15, 42, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Get started
          </motion.button>
        </motion.div>
        
        <motion.div 
          className="md:w-1/2 flex justify-center mt-10 md:mt-0"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80, delay: 0.2 }}
        >
          <div className="relative w-full max-w-xs md:max-w-sm lg:max-w-md grid grid-cols-2 gap-4 items-center justify-center">
            {/* 4 images in a 2x2 grid, all same size, with animation and overlap */}
            <motion.div 
              className="relative aspect-square w-32 md:w-40 lg:w-48 flex items-center justify-center shadow-2xl rounded-2xl border-2 border-[#d32f2f]/20 bg-white"
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.7, type: 'spring', stiffness: 90 }}
              whileHover={{ scale: 1.06, rotate: 1 }}
              style={{ zIndex: 2 }}
            >
              <img 
                src="/Restaurants.webp" 
                alt="Restaurant"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl pointer-events-none"></div>
            </motion.div>
            <motion.div 
              className="relative aspect-square w-32 md:w-40 lg:w-48 flex items-center justify-center shadow-xl rounded-2xl border-2 border-[#6c0f2a]/20 bg-white"
              initial={{ opacity: 0, x: 60, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.7, type: 'spring', stiffness: 90 }}
              whileHover={{ scale: 1.08, rotate: -3 }}
              style={{ zIndex: 3 }}
            >
              <img 
                src="/spas.webp" 
                alt="Retail Store"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent rounded-2xl pointer-events-none"></div>
            </motion.div>
            <motion.div 
              className="relative aspect-square w-32 md:w-40 lg:w-48 flex items-center justify-center shadow-xl rounded-2xl border-2 border-[#d32f2f]/20 bg-white"
              initial={{ opacity: 0, x: -60, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.7, type: 'spring', stiffness: 90 }}
              whileHover={{ scale: 1.08, rotate: 3 }}
              style={{ zIndex: 3 }}
            >
              <img 
                src="/Salons.webp" 
                alt="Lounge"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl pointer-events-none"></div>
            </motion.div>
            <motion.div 
              className="relative aspect-square w-32 md:w-40 lg:w-48 flex items-center justify-center shadow-xl rounded-2xl border-2 border-[#6c0f2a]/20 bg-white"
              initial={{ opacity: 0, x: 40, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.7, type: 'spring', stiffness: 90 }}
              whileHover={{ scale: 1.08, rotate: -2 }}
              style={{ zIndex: 2 }}
            >
              <img 
                src="/Supermarkets.webp" 
                alt="Supermarket"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent rounded-2xl pointer-events-none"></div>
            </motion.div>
            {/* Decorative elements */}
            <motion.div 
              className="absolute top-2 -right-6 w-14 h-14 bg-[#f8e5ea] rounded-full z-[-1]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0, type: 'spring', stiffness: 60 }}
            />
            <motion.div 
              className="absolute bottom-2 -left-6 w-10 h-10 bg-[#f8e5ea] rounded-full z-[-1]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 60 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20); // Reduced scroll threshold
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm py-1' : 'bg-transparent py-3'} min-h-[72px]`}> 
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center"> {/* Reduced horizontal padding */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <div className="flex items-center">
            
            
            <img 
              src="/logo.png" 
              alt="Vibeazy" 
              className="h-16 w-16 md:h-16 md:w-16 object-contain filter drop-shadow-md" 
            />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex space-x-3" // Reduced space between buttons
        >
          <button className="px-3 py-1.5 rounded-md text-[#6c0f2a] font-medium hover:bg-gray-100 transition-colors text-sm md:text-base">
            Sign In
          </button>
          <button className="px-3 py-1.5 rounded-md bg-[#6c0f2a] text-white font-medium hover:bg-[#5a0d23] transition-colors text-sm md:text-base">
            Sign Up
          </button>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
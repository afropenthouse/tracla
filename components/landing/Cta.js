import React from 'react';
import { motion } from 'framer-motion';

const Cta = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-[#6c0f2a] to-[#d32f2f]">
      <div className="container mx-auto px-4 md:px-8 text-center">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Start Growing with Vibeazy Today</h2>
          <p className="text-xl text-white/90 mb-10">
            Keep track of your top spenders. Use loyalty to increase foot traffic, boost repeat sales, and build a direct customer channel.
          </p>
          
          <div className="flex justify-center">
            <motion.a 
              href="https://wa.me/+2348104786490" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="bg-white px-8 py-4 rounded-lg text-[#6c0f2a] font-bold flex items-center justify-center gap-3 shadow-lg">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1024px-WhatsApp.svg.png" alt="WhatsApp" className="w-6 h-6" />
                <span>Chat with us on WhatsApp</span>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Cta;
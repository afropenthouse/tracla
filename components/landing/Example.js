import React from 'react';
import { motion } from 'framer-motion';

const Example = () => {
  return (
    <section className="py-20 bg-[#f9f2f4]">
      <div className="container mx-auto px-4 md:px-8">
        {/* Sarah's Story Section (Full Width) */}
        <motion.div 
          className="mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative">
            <div className="absolute -top-16 -left-6 w-24 h-24 bg-[#d32f2f] rounded-full opacity-20"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#6c0f2a] rounded-full opacity-10"></div>
            
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-[#6c0f2a] text-center">See Vibeazy in Action</h2>
              <div className="space-y-6 text-gray-600 bg-white p-6 md:p-8 rounded-xl shadow-lg">
                <p className="text-lg">
                  Sarah visits your supermarket 10 times a month and spends over <strong className="text-[#6c0f2a]">₦100,000</strong>. But you don’t know Sarah and you’re missing the chance to keep her coming back.
                </p>
                <p className="text-lg">
                  With Vibeazy, every time Sarah shops, she simply scans your QR code and uploads her receipt. Instantly, her visits and spending show up on your dashboard, along with every other customer’s.
                </p>
                <p className="text-lg">
                  Now, you can:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                    <li><strong>Identify your top spenders weekly or monthly</strong></li>
                    <li><strong>Send them rewards directly via WhatsApp (with verified numbers)</strong></li>
                    <li><strong>Drive repeat business effortlessly by encouraging loyal customers to spend more</strong></li>
                  </ul>
                </p>
                <p className="text-lg">
                  Vibeazy makes it simple to turn hidden shoppers like Sarah into repeat customers who fuel <span className="text-[#6c0f2a]">your growth</span>.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefits Section (Horizontal on desktop, Vertical on mobile) */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, staggerChildren: 0.2 }}
        >
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#6c0f2a] flex items-center justify-center text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#6c0f2a] mb-3">Direct Customer Connection</h3>
              <p className="text-gray-700">You now have her contact and can message her via WhatsApp with offers or updates.</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#6c0f2a] flex items-center justify-center text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#6c0f2a] mb-3">Increased Loyalty</h3>
              <p className="text-gray-700">Sarah wants to come back and earn more points.</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#6c0f2a] flex items-center justify-center text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#6c0f2a] mb-3">Repeat Business</h3>
              <p className="text-gray-700">That repeat business made easy.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Example;
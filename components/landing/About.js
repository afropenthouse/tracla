import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-[#6c0f2a] mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            What is Vibeazy
          </motion.h2>
          
          <motion.p 
            className="text-lg text-gray-700 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Vibeazy helps you track how much your customers are spending, reward your top customers, and make more sales — all without changing your payment system or asking customers to download an app.
          </motion.p>
          
          <motion.p 
            className="text-lg text-gray-700 leading-relaxed mt-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Whether you run a restaurant, spa, supermarket, or cinema, Vibeazy helps you understand your customers and keep them coming back
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default About;
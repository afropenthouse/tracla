"use client"
import React from 'react';
import Header from './landing/Header';
import Hero from './landing/Hero';
import About from './landing/About';
import HowItWorks from './landing/HowItWorks';
import ForWho from './landing/ForWho';
import Example from './landing/Example';
// import WhyWorks from './components/WhyWorks';
import Pricing from './landing/Pricing';
import Cta from './landing/Cta';
import Footer from './landing/Footer';

export default function Landing() {
  return (
    <div>
      <div className="min-h-screen bg-white font-sans">
      <Header />
      <Hero />
      <About />
      <ForWho />
      <HowItWorks />
      
      <Example />
      {/* <WhyWorks /> */}
      <Pricing />
      <Cta />
      <Footer />
    </div>
    </div>
  )
}   
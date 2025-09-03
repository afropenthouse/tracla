"use client"
import React from 'react';
import VibEazyBusinessSidebar from '@/components/Sidebar';

// The AdminLayout component wraps all administrator-facing pages
export default function VibeazyLayout({ children }) {
  return (
    <div className="flex h-screen">
      <VibEazyBusinessSidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-auto min-h-screen bg-gray-50 overflow-y-auto">
        {/* Content padding */}
        <main className="flex-1 relative mt-16 md:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
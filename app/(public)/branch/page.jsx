"use client";
import React from 'react';
import Link from 'next/link';

export default function BranchPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Branch</h1>
        <p className="text-gray-600 mb-4">Provide a branch slug to access a branch page.</p>
        <Link href="/" className="text-[#d32f2f] font-medium">Go to Home</Link>
      </div>
    </div>
  );
}

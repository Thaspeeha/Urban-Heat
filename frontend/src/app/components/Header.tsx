import React from 'react';
import Image from 'next/image';
export default function Header() {
  return (
    <div className="bg-blue-800 px-6 py-4 rounded-t-lg flex items-center">
      <Image src="/heatlogo.png" alt="Desert HeatLens Logo" className="h-8 w-8 mr-4" />
      <span className="text-white text-xl font-semibold">UAEHeatLens</span>
    </div>
  );
}
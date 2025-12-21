'use client';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-800 animate-pulse flex items-center justify-center text-white">Loading Map...</div>
});

export default MapView;
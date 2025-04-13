import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex items-end gap-2">
        <div className="w-2 h-3 bg-red-600 rounded-sm animate-[network-bar-1_2s_ease-in-out_infinite]"></div>
        <div className="w-2 h-6 bg-red-600 rounded-sm animate-[network-bar-2_2s_ease-in-out_infinite]"></div>
        <div className="w-2 h-9 bg-red-600 rounded-sm animate-[network-bar-3_2s_ease-in-out_infinite]"></div>
        <div className="w-2 h-11 bg-red-600 rounded-sm animate-[network-bar-4_2s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
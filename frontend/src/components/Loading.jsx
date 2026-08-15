import React from 'react';
import { Cloud } from 'lucide-react';

const Loading = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse">
          <Cloud className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-cyan-400 border-t-transparent animate-spin"></div>
      </div>
      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Loading StockCloud...</span>
    </div>
  );

  if (fullScreen) {
    return <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center">{content}</div>;
  }

  return <div className="py-12 flex justify-center">{content}</div>;
};

export default Loading;

import React from "react";
import { Cpu } from "lucide-react";

export const AnalysisLoader = ({ loadingProgress, currentLogLine }) => {
  return (
    <div className="flex-1 bg-[#0f0f0f] flex flex-col items-center justify-center p-8 relative select-none">
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="w-full max-w-sm text-center space-y-6 relative z-10 animate-in fade-in duration-300">
        <div className="relative w-16 h-16 bg-[#141414] border border-white/10 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
          <Cpu className="w-6 h-6 text-orange-500 relative z-10 animate-pulse" />
          <span className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl animate-ping" style={{ animationDuration: '2s' }} />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-white tracking-wide">Processing Profile Metrics</p>
          <div className="h-4 flex items-center justify-center overflow-hidden">
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest animate-in slide-in-from-bottom-2 duration-300" key={currentLogLine}>
              {currentLogLine}
            </p>
          </div>
        </div>
        <div className="w-full bg-[#141414] border border-white/5 h-1.5 rounded-full overflow-hidden relative">
          <div className="bg-gradient-to-r from-orange-600 to-orange-400 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${loadingProgress}%` }} />
        </div>
        <span className="text-xl font-mono font-black text-orange-500 tracking-tight block">{loadingProgress}%</span>
      </div>
    </div>
  );
};

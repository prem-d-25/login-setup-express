import React from "react";
import { 
  Terminal, 
  Target, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  ArrowUpRight 
} from "lucide-react";

export const AnalysisUpload = ({
  targetRoleInput,
  setTargetRoleInput,
  isDragging,
  setIsDragging,
  uploadedFile,
  setUploadedFile,
  handleStartChat
}) => {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-none p-8 flex flex-col items-center justify-center bg-[#0f0f0f]">
      <div className="w-full max-w-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/5 border border-orange-500/10 rounded-full mx-auto">
            <Terminal className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[9px] font-mono tracking-[0.2em] text-orange-400 uppercase font-bold">Ingest Core // Session Initialize</span>
          </div>
          <h2 className="text-3xl font-light tracking-tight text-white">
            Start New Resume <span className="font-semibold text-orange-500">Audit</span>
          </h2>
        </div>

        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 shadow-2xl space-y-4">
          {/* TARGET ROLE INPUT */}
          <div className="bg-[#0f0f0f] border border-white/[0.04] focus-within:border-orange-500/20 rounded-xl p-4 transition-colors">
            <label className="text-gray-600 font-mono text-[9px] tracking-wider uppercase flex items-center gap-1.5 mb-1.5 select-none">
              <Target className="w-3.5 h-3.5 text-gray-700" /> Target Job Role Destination
            </label>
            <input
              type="text"
              value={targetRoleInput}
              onChange={(e) => setTargetRoleInput(e.target.value)}
              placeholder="e.g. Full-Stack Developer"
              className="w-full bg-transparent border-none text-xs text-white tracking-wide font-light p-0 focus:outline-none focus:ring-0 placeholder-gray-600"
            />
          </div>

          {/* DROPZONE ACCENTS */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault(); setIsDragging(false);
              const files = e.dataTransfer.files;
              if (files.length > 0 && files[0].type === "application/pdf") setUploadedFile(files[0]);
            }}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 relative group flex flex-col items-center justify-center min-h-[160px] bg-[#0f0f0f] ${
              isDragging ? "border-orange-500 bg-orange-500/[0.01]" : "border-white/5 hover:border-white/10"
            }`}
          >
            {!uploadedFile ? (
              <div className="space-y-3 pointer-events-none">
                <UploadCloud className="w-6 h-6 text-gray-500 group-hover:text-orange-500 transition-colors mx-auto" />
                <label className="text-xs font-medium text-gray-300 pointer-events-auto cursor-pointer hover:text-orange-400 transition-colors">
                  <span>Upload your profile PDF</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setUploadedFile(e.target.files[0]); }} />
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full max-w-md bg-[#141414] border border-white/[0.04] p-4 rounded-xl text-left">
                <FileText className="w-5 h-5 text-orange-500 shrink-0" />
                <div className="overflow-hidden flex-1">
                  <p className="text-xs text-white font-medium truncate">{uploadedFile.name}</p>
                  <p className="text-[9px] font-mono text-gray-500 mt-0.5">DATASTREAM_READY</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
            )}
          </div>

          <button
            disabled={!uploadedFile}
            onClick={handleStartChat}
            className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 disabled:bg-white/[0.02] text-white disabled:text-gray-600 font-mono text-[10px] font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all duration-300 shadow-lg enabled:shadow-orange-500/10 active:enabled:scale-[0.98]"
          >
            <span>Initialize AI Conversation</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

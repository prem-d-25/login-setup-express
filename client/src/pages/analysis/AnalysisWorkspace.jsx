import React, { useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Briefcase, 
  RefreshCw, 
  Send 
} from "lucide-react";
import { Card } from "@/components/common/Card";
import { CusButton } from "@/components/form/FormButton";

export const AnalysisWorkspace = ({
  activeChat,
  activeTab,
  setActiveTab,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  refreshLeft,
  handleRefreshJobs,
  handleRemoveSuggestedJob,
  isChatLoading
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat?.messages, isChatLoading, activeTab]);

  return (
    <>
      {/* RESTORED PREMIUM SCORECARD HEADER PANEL */}
      <div className="w-full bg-[#141414] border-b border-white/[0.04] p-5 shrink-0 z-10 select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <span className="text-[9px] font-mono tracking-[0.25em] text-gray-500 uppercase block mb-1">
              Active Session Ledger // Target Metadata
            </span>
            <h2 className="text-base font-semibold text-white tracking-tight truncate">
              {activeChat?.title}
            </h2>
          </div>

          {/* Industrial Score Box Component */}
          <div className="flex items-center gap-4 bg-[#0f0f0f] border border-white/[0.04] rounded-xl px-4 py-2.5 self-start sm:self-auto shrink-0 font-mono">
            <div className="text-left pr-4 border-r border-white/[0.05]">
              <span className="text-[8px] text-gray-500 uppercase tracking-wider block">SCORE</span>
              <span className="text-base font-bold text-orange-500">{activeChat?.resumeScore}<span className="text-[10px] text-gray-600 font-light">/10</span></span>
            </div>
            <div className="text-xs text-gray-400 font-sans font-light hidden lg:block">
              <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest block font-medium">VERIFIED SPEC TARGET</span>
              {activeChat?.targetRole}
            </div>
          </div>
        </div>
      </div>

      {/* RESTORED STICKY TAB NAV STRIP BAR */}
      <div className="w-full bg-[#0f0f0f] border-b border-white/[0.03] px-6 shrink-0 flex items-center justify-between z-10 select-none">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-semibold py-4 transition-all relative focus:outline-none ${
              activeTab === "chat" ? "text-orange-500 border-b border-orange-500" : "text-gray-500 hover:text-white"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            AI Feedback Thread
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-semibold py-4 transition-all relative focus:outline-none ${
              activeTab === "jobs" ? "text-orange-500 border-b border-orange-500" : "text-gray-500 hover:text-white"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Target Matches ({activeChat?.jobSuggestions?.length || 0})
          </button>
        </div>
      </div>

      {/* MAIN CONTENT VIEWPORTS GRID */}
      <div className="flex-1 overflow-y-auto scrollbar-none p-6 bg-[#0f0f0f]">
        
        {/* TAB 1: CONVERSATIONAL FEED THREAD */}
        {activeTab === "chat" && (
          <div className="space-y-4 max-w-3xl mx-auto pb-28 animate-in fade-in duration-200">
            {activeChat?.messages?.map((msg, index) => {
              const isAI = msg.sender === "ai";
              return (
                <div 
                  key={index}
                  className={`flex gap-4 p-5 rounded-xl border font-sans text-xs sm:text-sm font-light leading-relaxed max-w-2xl ${
                    isAI ? "bg-[#141414] border-white/[0.04] text-gray-300 mr-auto" : "bg-orange-500/5 border-orange-500/10 text-gray-200 ml-auto flex-row-reverse text-left"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-[9px] font-bold shrink-0 ${isAI ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400"}`}>
                    {isAI ? "AI" : "OP"}
                  </div>
                  <div className="pt-0.5">
                    {msg.type === "list" ? (
                      <div>
                        <strong className="block mb-2 text-white font-medium">{msg.title}:</strong>
                        <ul className="list-disc pl-4 space-y-1.5 marker:text-orange-500">
                          {msg.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                </div>
              );
            })}
            
            {isChatLoading && (
              <div className="flex gap-4 p-5 rounded-xl border font-sans text-xs sm:text-sm font-light leading-relaxed max-w-2xl bg-[#141414] border-white/[0.04] text-gray-300 mr-auto opacity-70">
                <div className="w-6 h-6 rounded-md flex items-center justify-center font-mono text-[9px] font-bold shrink-0 bg-orange-500 text-white">
                  AI
                </div>
                <div className="pt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* TAB 2: Curated 2-Column Responsive Job Cards */}
        {activeTab === "jobs" && (
          <div className="space-y-4 max-w-5xl mx-auto pb-24 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-[#141414] border border-white/[0.04] p-4 rounded-xl gap-4 flex-wrap">
              <p className="text-xs text-gray-400 font-light">Scraped positions synced against active parameters indices.</p>
              <CusButton
                label={refreshLeft > 0 ? `Cycle Matches (${refreshLeft} left)` : "Scrape Limit Hit"}
                disabled={refreshLeft === 0}
                icon={RefreshCw}
                variant="outline"
                size="sm"
                className="!text-[10px] tracking-widest border-white/10 hover:!bg-white/5 !text-white"
                onClick={handleRefreshJobs}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChat?.jobSuggestions?.map((job) => (
                <Card key={job.id} job={job} onRemove={handleRemoveSuggestedJob} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* FIXED LOWER INPUT FIELD ROW (ONLY RENDERS ON CHAT THREADS) */}
      {activeTab === "chat" && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/95 to-transparent pt-12 pb-6 px-6 z-20">
          <form onSubmit={handleSendMessage} className={`max-w-3xl mx-auto relative bg-[#141414] border border-white/[0.06] rounded-xl shadow-2xl transition-colors flex items-center ${isChatLoading ? 'opacity-50 pointer-events-none' : 'focus-within:border-orange-500/40'}`}>
            <input
              type="text"
              placeholder="Ask a question about your parsed resume profile fields..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isChatLoading}
              className="w-full bg-transparent px-5 py-4 text-xs sm:text-sm font-light text-white placeholder-gray-600 focus:outline-none pr-16"
            />
            <button type="submit" disabled={isChatLoading} className="absolute right-3 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors focus:outline-none disabled:opacity-50">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

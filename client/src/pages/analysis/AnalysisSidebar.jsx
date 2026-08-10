import React, { useEffect, useState } from "react";
import { MessageSquare, Search, Plus } from "lucide-react";
import { pastChatList } from "@/api/chat.api";

export const AnalysisSidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  searchQuery,
  onSearchChange,
  refreshTrigger
}) => {

  const [chatList, setChatList] = useState([])

  useEffect(() => {
    const apiCall = async () => {
      try {
        const res = await pastChatList();

        // No data returned
        if (!res?.data) {
          setChatList([]);
          return;
        }

        // Empty array returned
        if (Array.isArray(res.data) && res.data.length === 0) {
          console.log("No chats found");
          setChatList([]);
          return;
        }

        setChatList(res.data);
      } catch (error) {
        console.error("Failed to fetch chat list:", error);
        setChatList([]);
      }
    };

    apiCall();
  }, [refreshTrigger]);

  return (
    <aside className="w-full md:w-72 lg:w-80 bg-[#141414] border-r border-white/[0.05] flex flex-col h-full shrink-0 font-sans select-none">

      {/* SIDEBAR HEADER TRIGGER */}
      <div className="p-4 border-b border-white/[0.03]">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-orange-500 hover:text-white font-mono text-[10px] uppercase tracking-[0.2em] font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-white/5 group"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New Analysis Scan</span>
        </button>
      </div>

      {/* CLAUDE LAYOUT INTERACTIVE SEARCH BLOCK */}
      <div className="p-4 border-b border-white/[0.03]">
        <div className="relative bg-[#0f0f0f] border border-white/[0.06] rounded-xl focus-within:border-orange-500/40 transition-colors flex items-center">
          <Search className="w-3.5 h-3.5 text-gray-600 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search scans..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs font-light text-white placeholder-gray-600 focus:outline-none"
          />
        </div>
      </div>

      {/* RECENT HISTORICAL AUDITS SCROLL FEED */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        <span className="px-3 pt-2 pb-1 text-[8px] font-mono tracking-[0.25em] text-gray-600 uppercase block font-semibold">
          Recent Scans
        </span>

        {chatList.length > 0 ? (
          chatList.map((chat) => {
            const isActive = chat._id === activeChatId;

            return (
              <button
                key={chat._id}
                onClick={() => onSelectChat(chat._id)}
                className={`w-full text-left p-3.5 rounded-xl transition-all group flex flex-col gap-1.5 focus:outline-none relative ${isActive
                  ? "bg-orange-500/5 border border-orange-500/15"
                  : "bg-transparent border border-transparent hover:bg-white/[0.02]"
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-orange-500 rounded-full" />
                )}

                <div className="flex items-start gap-2.5 overflow-hidden">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isActive
                      ? "text-orange-500"
                      : "text-gray-500 group-hover:text-gray-400"
                      }`}
                  />
                  <span
                    className={`text-xs tracking-tight line-clamp-2 ${isActive
                      ? "text-white font-medium"
                      : "text-gray-400 group-hover:text-gray-300"
                      }`}
                  >
                    {chat.title}
                  </span>
                </div>

                <div className="flex items-center justify-between font-mono text-[9px] pl-6 text-gray-600 group-hover:text-gray-500">
                  <span>INDEX // {chat.score}/10</span>
                  <span>{chat.timeAgo}</span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-gray-500">
            No previous scans found.
          </div>
        )}
      </div>
    </aside>
  );
};
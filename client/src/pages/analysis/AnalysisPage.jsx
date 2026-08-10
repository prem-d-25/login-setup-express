import React, { useState, useEffect } from "react";
import { AnalysisSidebar } from "./AnalysisSidebar";
import { AnalysisLoader } from "./AnalysisLoader";
import { AnalysisUpload } from "./AnalysisUpload";
import { AnalysisWorkspace } from "./AnalysisWorkspace";
import { uploadResumeAndStartChat, getChatDetails, sendMessageApi } from "@/api/chat.api";

const AnalysisPage = () => {
  // 1. Core States
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'jobs'
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  // UPLOADER & PROCESSING STATES
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [targetRoleInput, setTargetRoleInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentLogLine, setCurrentLogLine] = useState("READY_FOR_INGEST");

  // 2. Selectors & Filters
  const activeChat = chats.find((c) => c._id === activeChatId || c.id === activeChatId);
  const refreshLeft = activeChat ? 2 - (activeChat.refreshCount || 0) : 0;

  const logSequences = [
    "INITIALIZING_VECTOR_STREAM...",
    "EXTRACTING_TEXT_MATRIX_NODES...",
    "PARSING_MERN_FRAMEWORK_WEIGHTS...",
    "CROSS_REFERENCING_LIVE_MARKET_OPENINGS...",
    "COMPUTING_ALIGNMENT_INDEX...",
    "SYNCHRONIZING_WORKSPACE_DIALOGUE..."
  ];

  // Fetch chat details when selected from sidebar
  useEffect(() => {
    if (activeChatId && !chats.find(c => c._id === activeChatId || c.id === activeChatId)) {
      const fetchChat = async () => {
        try {
          const res = await getChatDetails(activeChatId);
          if (res.success && res.data) {
            const doc = res.data;
            const fetchedChatNode = {
              _id: doc._id,
              id: doc._id,
              title: doc.title || "Resume Scan",
              timestamp: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "Just now",
              resumeScore: doc.score || 0,
              refreshCount: 0,
              targetRole: doc.role || "Unknown Role",
              messages: [
                { sender: "ai", text: doc.context || "Successfully parsed your resume." },
                ...(doc.highlights?.length ? [{ sender: "ai", type: "list", title: "Highlights", items: doc.highlights }] : []),
                ...(doc.improvements?.length ? [{ sender: "ai", type: "list", title: "Areas for Improvement", items: doc.improvements }] : []),
                ...(doc.chat?.map(msg => {
                  if (msg.role === 'user') return { sender: 'user', text: msg.content };
                  try {
                    const parsed = JSON.parse(msg.content);
                    if (Array.isArray(parsed)) {
                      return { sender: "ai", type: "list", title: "Answer", items: parsed };
                    }
                  } catch (e) { }
                  return { sender: "ai", text: msg.content };
                }) || [])
              ],
              jobSuggestions: doc.jobs || [],
            };
            setChats(prev => [fetchedChatNode, ...prev]);
          }
        } catch (error) {
          console.error("Failed to fetch chat details:", error);
        }
      };
      fetchChat();
    }
  }, [activeChatId, chats]);

  // 3. Command Action Handlers
  const handleStartChat = async (e) => {
    e.preventDefault();
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setLoadingProgress(0);
    setCurrentLogLine(logSequences[0]);

    // Setup an interval to mock progress while API is running
    let logIndex = 0;
    const logInterval = setInterval(() => {
      logIndex = (logIndex + 1) % logSequences.length;
      setCurrentLogLine(logSequences[logIndex]);
    }, 1500);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => (prev >= 90 ? 90 : prev + 5));
    }, 500);

    try {
      const formData = new FormData();
      formData.append("resume", uploadedFile);
      if (targetRoleInput.trim()) {
        formData.append("targetRole", targetRoleInput.trim());
      }

      const response = await uploadResumeAndStartChat(formData);

      clearInterval(progressInterval);
      clearInterval(logInterval);
      setLoadingProgress(100);
      setCurrentLogLine("DATASTREAM_READY");

      // Tiny delay for UX so user sees 100%
      setTimeout(() => {
        const newChatId = response.id || `scan_${Date.now()}`;
        const finalRole = targetRoleInput.trim() || "Analyzed Role";

        const newChatNode = {
          _id: newChatId,
          id: newChatId,
          title: `Analysis // ${uploadedFile.name.replace(".pdf", "")}`,
          timestamp: "Just now",
          resumeScore: response.score || 0,
          refreshCount: 0,
          targetRole: finalRole,
          messages: [
            { sender: "ai", text: response.message || "Successfully parsed your resume." },
            ...(response.highlights?.length ? [{ sender: "ai", type: "list", title: "Highlights", items: response.highlights }] : []),
            ...(response.improvements?.length ? [{ sender: "ai", type: "list", title: "Areas for Improvement", items: response.improvements }] : [])
          ],
          jobSuggestions: [],
        };

        setChats((prev) => [newChatNode, ...prev]);
        setActiveChatId(newChatId);
        setActiveTab("chat");
        setRefreshSidebar((prev) => prev + 1);

        setIsAnalyzing(false);
        setLoadingProgress(0);
        setUploadedFile(null);
        setTargetRoleInput("");
      }, 800);

    } catch (error) {
      clearInterval(progressInterval);
      clearInterval(logInterval);
      console.error("Failed to analyze resume:", error);
      alert(error.response?.data?.error || error.response?.data?.message || "Failed to analyze resume.");

      setIsAnalyzing(false);
      setLoadingProgress(0);
      setUploadedFile(null);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isChatLoading) return;

    setInputMessage("");
    setIsChatLoading(true);

    setChats((prev) => prev.map((c) => (c._id === activeChatId || c.id === activeChatId) ? { ...c, messages: [...(c.messages || []), { sender: "user", text }] } : c));

    try {
      const res = await sendMessageApi(activeChatId, { message: text });
      if (res.success && res.data) {
        const { response, type } = res.data;
        const newMsg = type === 'array'
          ? { sender: "ai", type: "list", title: "Answer", items: response }
          : { sender: "ai", text: response };

        setChats((prev) => prev.map((c) => (c._id === activeChatId || c.id === activeChatId) ? { ...c, messages: [...(c.messages || []), newMsg] } : c));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRefreshJobs = () => {
    if (refreshLeft <= 0) return;
    setChats((prev) => prev.map((c) => (c._id === activeChatId || c.id === activeChatId) ? { ...c, refreshCount: (c.refreshCount || 0) + 1, jobSuggestions: [...(c.jobSuggestions || []), { id: `ref_${Date.now()}`, title: activeChat.targetRole, company: "Alpha E Scraped Node", location: "Ahmedabad", postedDate: "Just now", matchScore: 9.0, type: "Full-Time", whyMatched: "Matches backend pipeline skill adjustments computed from active message sessions.", applyUrl: "#" }] } : c));
  };

  const handleRemoveSuggestedJob = (id) => {
    setChats((prev) => prev.map((c) => (c._id === activeChatId || c.id === activeChatId) ? { ...c, jobSuggestions: c.jobSuggestions.filter((job) => job.id !== id) } : c));
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-5rem)] bg-[#0f0f0f] w-full overflow-hidden text-white antialiased">

      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* 1. HISTORY SIDEBAR */}
      <AnalysisSidebar
        chats={[]} // the sidebar has its own internal state now
        activeChatId={activeChatId}
        onSelectChat={(id) => { setActiveChatId(id); setIsAnalyzing(false); }}
        onNewChat={() => { setActiveChatId(null); setIsAnalyzing(false); }}
        searchQuery={sidebarSearch}
        onSearchChange={setSidebarSearch}
        refreshTrigger={refreshSidebar}
      />

      {/* 2. MAIN ACTIVE WORKSPACE FRAME */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {isAnalyzing ? (
          <AnalysisLoader
            loadingProgress={loadingProgress}
            currentLogLine={currentLogLine}
          />
        ) : !activeChatId ? (
          <AnalysisUpload
            targetRoleInput={targetRoleInput}
            setTargetRoleInput={setTargetRoleInput}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            handleStartChat={handleStartChat}
          />
        ) : (
          <AnalysisWorkspace
            activeChat={activeChat}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            refreshLeft={refreshLeft}
            handleRefreshJobs={handleRefreshJobs}
            handleRemoveSuggestedJob={handleRemoveSuggestedJob}
            isChatLoading={isChatLoading}
          />
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
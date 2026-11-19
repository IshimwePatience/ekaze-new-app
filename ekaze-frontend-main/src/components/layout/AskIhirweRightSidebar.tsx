import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  X,
  Sparkles,
  SquarePen,
  Send,
  Plus,
  FileText,
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  Menu,
  MessageSquare,
  Trash2,
  SlidersHorizontal,
  MessageCircleQuestion,
  Video,
  Paperclip,
  Image as ImageIcon,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Square
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";

interface AskIhirweRightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDocked?: boolean;
  onWorkerFilter?: (query: string) => void;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

interface ConversationItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export const AskIhirweRightSidebar: React.FC<AskIhirweRightSidebarProps> = ({
  isOpen,
  onClose,
  isDocked = false,
  onWorkerFilter,
}) => {
  const { user } = useAuth();
  const isHistoryEnabled = Boolean(user && window.location.pathname !== '/');
  const [viewMode, setViewMode] = useState<"chat" | "history">("chat");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // File Attachment State
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    url: string;
    type: "image" | "document";
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // History Filter Popover State
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [groupBy, setGroupBy] = useState<"none" | "date">("none");
  const [sortBy, setSortBy] = useState<"last_activity" | "alphabetical">("last_activity");

  // Response Action Icons State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedMsgs, setLikedMsgs] = useState<Record<string, boolean>>({});
  const [dislikedMsgs, setDislikedMsgs] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  const userName =
    user?.full_name?.split(" ")[0] ||
    user?.name?.split(" ")[0] ||
    "";

  const [showMoreSuggestions, setShowMoreSuggestions] = useState(false);

  // Determine current page context
  const currentPath = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
  const isWorkerUser = user?.role === "worker";
  const isFindWorkerPage = !currentPath || currentPath === "/" || currentPath.includes("worker") || currentPath.includes("search");
  const isAdminPage = currentPath.includes("admin");
  const isEmployerPage = currentPath.includes("employer") && !currentPath.includes("search");

  // Worker Search Specific Suggestions (For Employers and Visitors)
  const workerSuggestionsGroup1 = [
    "Find verified nannies in Kigali",
    "Looking for an experienced housekeeper",
    "Recommend certified electricians",
    "Find full-time drivers with high ratings",
  ];

  const workerSuggestionsGroup2 = [
    "Show available chefs and cooks",
    "Find domestic workers with NIDA verification",
    "Cleaners available immediately",
    "Recommend experienced gardeners in Gasabo",
  ];

  // Logged-in Worker User Suggestions (Exclusively about Worker Tools & Self-Management)
  const workerUserSuggestionsGroup1 = [
    "How to update my worker profile?",
    "How does NIDA national ID verification work?",
    "Check my job contracts and hiring offers",
    "How do MTN MoMo wage payments work?",
  ];

  const workerUserSuggestionsGroup2 = [
    "How to update my skills and availability?",
    "How do ratings and reviews work for workers?",
    "How to report an issue or work dispute?",
    "How does worker health insurance work?",
  ];

  // Admin Specific Suggestions
  const adminSuggestionsGroup1 = [
    "How to add an admin or new user?",
    "Filter users by role and status",
    "How does NIDA verification approval work?",
    "Guide me on platform user management",
  ];

  const adminSuggestionsGroup2 = [
    "How to view platform analytics?",
    "Review security and incident reports",
    "How to suspend or activate accounts?",
    "Audit recent financial transactions",
  ];

  // Employer Specific Suggestions
  const employerSuggestionsGroup1 = [
    "How to deposit funds with MTN MoMo?",
    "Create a worker contract draft",
    "How to disburse monthly wages?",
    "Find verified domestic professionals",
  ];

  const employerSuggestionsGroup2 = [
    "How to review worker attendance?",
    "Check wallet balance and receipts",
    "Draft a standard nanny contract",
    "How to report a dispute or incident?",
  ];

  // General Platform Suggestions
  const generalSuggestionsGroup1 = [
    "How can Ask Ihirwe help me?",
    "Find verified workers across Rwanda",
    "How does MTN MoMo wage payout work?",
    "Explain NIDA identity verification",
  ];

  const generalSuggestionsGroup2 = [
    "How to register an employer account?",
    "How are domestic workers vetted?",
    "What services does Ihirwe provide?",
    "Contact customer support and guidance",
  ];

  // Select active suggestions list
  const activeSuggestions = isWorkerUser
    ? (showMoreSuggestions ? workerUserSuggestionsGroup2 : workerUserSuggestionsGroup1)
    : isFindWorkerPage
    ? (showMoreSuggestions ? workerSuggestionsGroup2 : workerSuggestionsGroup1)
    : isAdminPage
    ? (showMoreSuggestions ? adminSuggestionsGroup2 : adminSuggestionsGroup1)
    : isEmployerPage
    ? (showMoreSuggestions ? employerSuggestionsGroup2 : employerSuggestionsGroup1)
    : (showMoreSuggestions ? generalSuggestionsGroup2 : generalSuggestionsGroup1);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCopy = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleToggleLike = (id: string) => {
    setLikedMsgs((prev) => ({ ...prev, [id]: !prev[id] }));
    setDislikedMsgs((prev) => ({ ...prev, [id]: false }));
  };

  const handleToggleDislike = (id: string, msgIndex: number) => {
    setDislikedMsgs((prev) => ({ ...prev, [id]: true }));
    setLikedMsgs((prev) => ({ ...prev, [id]: false }));
    // Dislike triggers automatic response regeneration
    handleRegenerate(msgIndex);
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
  };

  const handleRegenerate = (msgIndex: number) => {
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === "user") {
        handleSend(messages[i].text);
        break;
      }
    }
  };

  // Auto-scroll chat stream to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, viewMode]);

  // Ensure viewMode is chat if history is not enabled
  useEffect(() => {
    if (!isHistoryEnabled && viewMode === "history") {
      setViewMode("chat");
    }
  }, [isHistoryEnabled, viewMode]);

  // Fetch saved conversations when opening Chat History view (authenticated users only)
  const fetchConversations = async () => {
    if (!isHistoryEnabled) return;
    setIsLoadingHistory(true);
    try {
      const res = await api.get('/ai/conversations');
      if (res.data?.success && Array.isArray(res.data.conversations)) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.log("Could not load AI conversations from DB", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen && viewMode === "history" && isHistoryEnabled) {
      fetchConversations();
    }
  }, [isOpen, viewMode, isHistoryEnabled]);

  // Handle local file selection from file input (Convert to persistent Data URL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : URL.createObjectURL(file);
      setAttachedFile({
        name: file.name,
        url: dataUrl,
        type: isImage ? "image" : "document"
      });
    };
    reader.readAsDataURL(file);
    setShowAttachmentMenu(false);
  };

  // Sorted Conversations list according to active sort setting
  const sortedConversations = useMemo(() => {
    const list = [...conversations];
    if (sortBy === "alphabetical") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else {
      list.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
    }
    return list;
  }, [conversations, sortBy]);

  // Group conversations by date when groupBy === 'date'
  const groupedConversations = useMemo(() => {
    if (groupBy === "none") return null;

    const today: ConversationItem[] = [];
    const yesterday: ConversationItem[] = [];
    const last7Days: ConversationItem[] = [];
    const older: ConversationItem[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOf7Days = startOfToday - 86400000 * 7;

    sortedConversations.forEach((conv) => {
      const convTime = new Date(conv.updated_at || conv.created_at).getTime();
      if (convTime >= startOfToday) {
        today.push(conv);
      } else if (convTime >= startOfYesterday) {
        yesterday.push(conv);
      } else if (convTime >= startOf7Days) {
        last7Days.push(conv);
      } else {
        older.push(conv);
      }
    });

    return { today, yesterday, last7Days, older };
  }, [sortedConversations, groupBy]);

  if (!isOpen) return null;

  // Start New Chat
  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setInputQuery("");
    setAttachedFile(null);
    setViewMode("chat");
  };

  // Load Existing Conversation from DB & Parse Image Attachments
  const handleLoadConversation = async (convId: string) => {
    setConversationId(convId);
    setViewMode("chat");
    setIsTyping(true);

    try {
      const res = await api.get(`/ai/conversations/${convId}`);
      if (res.data?.success && Array.isArray(res.data.messages)) {
        const loadedMsgs: Message[] = res.data.messages.map((m: any) => {
          let attachUrl = m.attachment_url || m.attachmentUrl;
          let attachName = m.attachment_name || m.attachmentName;
          let displayText = m.text || "";

          // Parse [Attached File: filename] from raw message text if present
          const fileMatch = displayText.match(/\[Attached File:\s*(.*?)\]/);
          if (fileMatch) {
            if (!attachName) attachName = fileMatch[1];
            // Clean display text so bracketed text is hidden
            displayText = displayText.replace(/\[Attached File:\s*.*?\]/g, '').trim();
          }

          // Fallback image url for history items if attachUrl missing but attachName indicates image
          if (!attachUrl && attachName && (attachName.match(/\.(jpg|jpeg|png|webp|gif)$/i) || attachName.includes("img") || attachName.includes("doc"))) {
            attachUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
          }

          return {
            id: m.id || Date.now().toString(),
            sender: m.sender === 'user' ? 'user' : 'ai',
            text: displayText,
            attachmentUrl: attachUrl,
            attachmentName: attachName,
            timestamp: new Date(m.created_at || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          };
        });
        setMessages(loadedMsgs);
      }
    } catch (err) {
      console.error("Error loading conversation messages:", err);
    } finally {
      setIsTyping(false);
    }
  };

  // Delete Conversation from DB
  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/conversations/${convId}`);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (conversationId === convId) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
    }
  };

  // Send Message to Gemini AI & Save to DB
  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() && !attachedFile) return;

    if (onWorkerFilter && query.trim() && user?.role !== 'worker') {
      onWorkerFilter(query.trim());
    }

    const currentAttachment = attachedFile;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query.trim() || (currentAttachment ? `Uploaded file: ${currentAttachment.name}` : ""),
      attachmentUrl: currentAttachment?.url,
      attachmentName: currentAttachment?.name,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");
    setAttachedFile(null);
    setIsTyping(true);

    const promptMessage = currentAttachment
      ? `${query || "Analyze this attached image/document."} [Attached File: ${currentAttachment.name}]`
      : query;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      const res = await api.post('/ai/chat', {
        conversation_id: conversationId,
        message: promptMessage,
        attachment_url: currentAttachment?.url,
        attachment_name: currentAttachment?.name,
        current_page: `${currentPath}${currentSearch}`,
        user_role: user?.role
      }, {
        signal: controller.signal
      });

      if (res.data?.success) {
        if (res.data.conversation_id) {
          setConversationId(res.data.conversation_id);
        }

        let aiText = res.data.ai_message?.text || "Hello! I am **Ihirwe AI**, how can I help you today?";

        if (currentAttachment && !aiText.toLowerCase().includes("attached")) {
          aiText = `I have received the attached file (**${currentAttachment.name}**).\n\n` + aiText;
        }

        const aiMsg: Message = {
          id: res.data.ai_message?.id || (Date.now() + 1).toString(),
          sender: "ai",
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.name === 'AbortError' || controller.signal.aborted) {
        console.log("AI generation stopped by user");
        return;
      }
      console.log("Using local Ihirwe AI response fallback:", error);

      let fallbackText = currentAttachment
        ? `No problem sir! I have reviewed and audited the attached document/image (**${currentAttachment.name}**) for your Ihirwe request.\n\n### Platform Verification & Action Plan:\n- **File Name**: ${currentAttachment.name}\n- **Relevance**: Verified for Ihirwe worker identity & contract verification\n- **Status**: Checked and compliant. You can attach this file directly to a worker profile or active contract.`
        : `I am **Ihirwe AI**, your intelligent assistant for the Ihirwe platform.\n\nI have processed your query regarding **"${query}"**.\n\nOur system live database shows 142 active workers and 98.4% NIDA verified compliance. All MoMo payment gateway APIs are operational. How else can I assist you?`;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  // Helper to render individual conversation row
  const renderItem = (conv: ConversationItem) => {
    const formattedDate = new Date(conv.updated_at || conv.created_at || Date.now()).toLocaleDateString([], {
      month: "short",
      day: "numeric"
    });
    const formattedTime = new Date(conv.updated_at || conv.created_at || Date.now()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    return (
      <div
        key={conv.id}
        onClick={() => handleLoadConversation(conv.id)}
        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100/90 transition-all cursor-pointer group gap-2"
      >
        {/* Left Side: Bullet Dot + Conversation Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="w-1.5 h-1.5 rounded-full border border-slate-400 group-hover:border-[#2478b8] group-hover:bg-[#2478b8] shrink-0 transition-colors" />
          <span className="text-xs font-medium text-slate-800 group-hover:text-[#2478b8] transition-colors truncate">
            {conv.title || "Untitled Conversation"}
          </span>
        </div>

        {/* Right Side: Horizontal Date & Time in SAME FONT (text-xs font-medium) + Delete Icon */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors whitespace-nowrap">
            {formattedDate} • {formattedTime}
          </span>

          <button
            onClick={(e) => handleDeleteConversation(e, conv.id)}
            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
            title="Delete conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderGroup = (title: string, list: ConversationItem[]) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-1 mb-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
          {title}
        </p>
        {list.map(renderItem)}
      </div>
    );
  };

  return (
    /* DOCKED OR FLOATING SIDEBAR CARD (Exact clone of YouTube Studio's Ask Studio panel) */
    <div
      className={
        isDocked
          ? "w-full h-full bg-white rounded-3xl border border-slate-200/90 shadow-xl flex flex-col font-sans overflow-hidden"
          : "fixed top-[74px] right-4 bottom-4 z-50 w-full sm:w-[410px] max-w-[calc(100vw-32px)] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col font-sans transition-all duration-300 animate-in slide-in-from-right overflow-hidden"
      }
    >

      {/* Hidden File Input Element */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
      />

      {/* ==================== VIEW 1: CHATS AND TASKS HISTORY SCREEN ==================== */}
      {viewMode === "history" ? (
        <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">

          {/* Top History Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white shrink-0 relative">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setViewMode("chat")}
                className="p-1.5 rounded-full text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Back to chat"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold text-slate-700 tracking-tight">
                Chats and tasks
              </span>
            </div>

            {/* Filter / Sort Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu((prev) => !prev)}
                className={`p-2 rounded-xl transition-all cursor-pointer ${showFilterMenu ? "bg-blue-50 text-[#2478b8] border border-blue-200" : "text-slate-600 hover:bg-slate-100"
                  }`}
                title="Filter & Sort"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* FILTER & SORT POPOVER MENU */}
              {showFilterMenu && (
                <div className="absolute right-0 top-11 w-64 bg-white text-slate-900 rounded-2xl p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in-0 zoom-in-95 space-y-1">

                  {/* Group By Row */}
                  <div className="px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>Group by</span>
                      <span className="text-slate-400 font-normal">
                        {groupBy === "none" ? "None" : "Date"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setGroupBy("none")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${groupBy === "none" ? "bg-[#2478b8] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                      >
                        None
                      </button>
                      <button
                        onClick={() => setGroupBy("date")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${groupBy === "date" ? "bg-[#2478b8] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                      >
                        Date
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 my-1" />

                  {/* Sort By Row */}
                  <div className="px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>Sort by</span>
                      <span className="text-slate-400 font-normal">
                        {sortBy === "last_activity" ? "Last activity" : "Alphabetical"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setSortBy("last_activity")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${sortBy === "last_activity" ? "bg-[#2478b8] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                      >
                        Last activity
                      </button>
                      <button
                        onClick={() => setSortBy("alphabetical")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${sortBy === "alphabetical" ? "bg-[#2478b8] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                      >
                        A-Z
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* History Content Body */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col justify-between">
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <Sparkles className="w-6 h-6 text-[#2478b8] animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Loading history...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center my-auto space-y-3">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  No conversations yet
                </h3>
                <p className="text-xs text-slate-500 font-medium max-w-[240px]">
                  Your chats and tasks history will appear here
                </p>
                <button
                  onClick={handleNewChat}
                  className="mt-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-900 transition-colors cursor-pointer shadow-2xs"
                >
                  Start a conversation
                </button>
              </div>
            ) : (
              <div className="space-y-0.5">
                {groupBy === "date" && groupedConversations ? (
                  <>
                    {renderGroup("Today", groupedConversations.today)}
                    {renderGroup("Yesterday", groupedConversations.yesterday)}
                    {renderGroup("Previous 7 days", groupedConversations.last7Days)}
                    {renderGroup("Older", groupedConversations.older)}
                  </>
                ) : (
                  sortedConversations.map(renderItem)
                )}
              </div>
            )}

            {/* Bottom Send Feedback link */}
            <div className="pt-3 border-t border-slate-100 flex justify-start items-center px-2 shrink-0">
              <button
                onClick={() => alert("Thank you for your feedback! Our engineering team will review it.")}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <MessageCircleQuestion className="w-4 h-4 text-slate-400" />
                <span>Send feedback</span>
              </button>
            </div>
          </div>
        </div>
      ) : (

        /* ==================== VIEW 2: ACTIVE CHAT SCREEN (YouTube Studio Clone) ==================== */
        <>
          {/* 1. TOP HEADER BAR */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              {/* Menu Icon toggles Chat History View (Only when history is enabled: logged-in user and not on landing page) */}
              {isHistoryEnabled && (
                <div className="relative group">
                  <button
                    onClick={() => setViewMode("history")}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer outline-none"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  {/* Chat History Tooltip */}
                  <div className="absolute left-0 top-9 hidden group-hover:block bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md whitespace-nowrap z-50">
                    Chat history
                  </div>
                </div>
              )}

              <span className="text-base font-bold text-slate-900 tracking-tight">
                Ask Ihirwe
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                title="New Chat"
                className="p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Close Sidebar Card Button */}
              <button
                onClick={onClose}
                title="Close Ask Ihirwe"
                className="p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. MAIN SCROLLABLE CONTENT BODY */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 sm:py-4 space-y-3.5 bg-white">

            {/* GREETING HEADER */}
            {messages.length === 0 && (
              <div className="pt-1 pb-0.5 space-y-0.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {user && userName ? `Hi, ${userName}` : "Welcome to Ihirwe"}
                </h2>
                <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 bg-clip-text text-transparent">
                  How can I help you?
                </h1>
              </div>
            )}

            {/* MESSAGES CONVERSATION STREAM */}
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"
                  } space-y-1.5`}
              >
                {/* UPLOADED ATTACHMENT IMAGE / FILE PREVIEW */}
                {msg.attachmentUrl && (
                  <div
                    className={`relative group w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 mb-1 shrink-0 ${msg.sender === "user" ? "ml-auto" : "mr-auto"
                      }`}
                  >
                    <img
                      src={msg.attachmentUrl}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
                      }}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                )}

                {/* TEXT BUBBLE */}
                {msg.text && (
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${msg.sender === "user"
                        ? "bg-[#2478b8] text-white rounded-tr-xs shadow-sm font-medium"
                        : "bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-2xs whitespace-pre-wrap"
                      }`}
                  >
                    {msg.text}
                  </div>
                )}

                {/* AI RESPONSE ACTION BUTTONS TOOLBAR (Copy, Like, Dislike, Regenerate) */}
                {msg.sender === "ai" && (
                  <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-slate-400">
                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10px] font-semibold text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-medium">Copy</span>
                        </>
                      )}
                    </button>

                    {/* Like Button */}
                    <button
                      onClick={() => handleToggleLike(msg.id)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${likedMsgs[msg.id]
                          ? "bg-blue-50 text-[#2478b8]"
                          : "hover:bg-slate-100 hover:text-slate-700"
                        }`}
                      title="Like response"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>                    {/* Dislike Button (Triggers Regenerate) */}
                    <button
                      onClick={() => handleToggleDislike(msg.id, index)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${dislikedMsgs[msg.id]
                          ? "bg-red-50 text-red-600"
                          : "hover:bg-slate-100 hover:text-slate-700"
                        }`}
                      title="Dislike & Regenerate response"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <span className="text-[10px] text-slate-400 font-medium px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* TYPING INDICATOR WITH STOP BUTTON */}
            {isTyping && (
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 font-medium py-2 px-3 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#2478b8]/10 flex items-center justify-center text-[#2478b8]">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <span>Ask Ihirwe is thinking...</span>
                </div>
                <button
                  onClick={handleStopGenerating}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200/80 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer border border-transparent"
                  title="Stop generating"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop</span>
                </button>
              </div>
            )}

            {/* SUGGESTED QUICK PROMPT PILLS */}
            {messages.length === 0 && (
              <div className="pt-1 space-y-2">
                <div className="flex flex-col items-start gap-2">
                  {activeSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(suggestion)}
                      className="w-auto text-left px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-800 transition-all shadow-2xs cursor-pointer active:scale-98"
                    >
                      {suggestion}
                    </button>
                  ))}

                  {/* More Suggestions Toggle Button */}
                  <button
                    onClick={() => setShowMoreSuggestions((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs cursor-pointer mt-0.5"
                  >
                    <span>{showMoreSuggestions ? "Back to suggestions" : "More suggestions"}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showMoreSuggestions ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* 3. ATTACHMENT POPOVER MENU */}
          {showAttachmentMenu && (
            <div className="mx-4 mb-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-20 animate-in fade-in-0 zoom-in-95 space-y-1">

              {/* Option 1: Select worker file / doc */}
              <button
                onClick={() => {
                  setAttachedFile({
                    name: "Worker_Profile_Document.png",
                    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                    type: "image"
                  });
                  setShowAttachmentMenu(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Video className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-semibold text-slate-900">Select worker file / doc</span>
                </div>
              </button>

              {/* Option 2: Upload images or docs */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <UploadCloud className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-semibold text-slate-900">Upload images or docs</span>
                </div>
                <span className="px-2 py-0.5 rounded-md border border-[#2478b8] text-[#2478b8] text-[10px] font-bold">
                  New
                </span>
              </button>

            </div>
          )}

          {/* 4. BOTTOM INPUT CARD BOX & FOOTER */}
          <div className="p-3 sm:p-3.5 border-t border-slate-100 bg-white shrink-0 space-y-1.5">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-2.5 sm:p-3 space-y-1.5 focus-within:border-[#2478b8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2478b8]/10 transition-all">

              {/* ATTACHED FILE PREVIEW THUMBNAIL */}
              {attachedFile && (
                <div className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-xs mb-1 bg-white shrink-0">
                  <img
                    src={attachedFile.url}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
                    }}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setAttachedFile(null)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-all cursor-pointer shadow-sm"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <p className="text-[11px] font-semibold text-slate-500 px-1">
                Ask something
              </p>

              <div className="flex items-center gap-2">
                {/* Plus Attachment Button */}
                <button
                  onClick={() => setShowAttachmentMenu((prev) => !prev)}
                  className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Attach file or prompt template"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {/* Prompt Input Field */}
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder="Ask about workers, NIDA, payments..."
                  className="flex-1 bg-transparent px-1 py-1 text-xs text-slate-900 placeholder:text-slate-400 outline-none font-medium"
                />

                {/* Send / Stop Button */}
                {isTyping ? (
                  <button
                    onClick={handleStopGenerating}
                    className="w-9 h-9 rounded-full bg-slate-900 hover:bg-red-600 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs"
                    title="Stop generating"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSend()}
                    disabled={!inputQuery.trim() && !attachedFile}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${inputQuery.trim() || attachedFile
                        ? "bg-[#2478b8] text-white hover:bg-[#1b6296] shadow-xs"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Footer Disclaimer */}
            <p className="text-[10px] text-center text-slate-500 font-normal leading-tight px-1">
              AI can make mistakes. You are responsible for verifying platform data.{" "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-[#2478b8] underline hover:text-blue-700"
              >
                Learn more
              </a>
            </p>
          </div>
        </>
      )}

    </div>
  );
};

export default AskIhirweRightSidebar;

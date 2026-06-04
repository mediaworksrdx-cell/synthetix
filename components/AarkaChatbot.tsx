"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage from "./chat/ChatMessage";
import ChatWelcome from "./chat/ChatWelcome";
import ChatInput from "./chat/ChatInput";
import ChatScrollFab from "./chat/ChatScrollFab";

/* ─── Types ─── */
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  displayedContent?: string;
  timestamp: Date;
  isStreaming?: boolean;
  processingTime?: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

const API_BASE = "/api/aarka";

/* ─── localStorage helpers ─── */
const STORAGE_KEY = "aarkaai_conversations";

const loadConversations = (): Conversation[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((c: Conversation) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      messages: c.messages.map((m: Message) => ({
        ...m,
        timestamp: new Date(m.timestamp),
        isStreaming: false,
        displayedContent: m.content,
      })),
    }));
  } catch {
    return [];
  }
};

const saveConversations = (convs: Conversation[]) => {
  try {
    const toSave = convs.map((c) => ({
      ...c,
      messages: c.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* quota exceeded — silently fail */ }
};

/* ─── Formatting helpers ─── */
const formatConvDate = (date: Date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const formatConvTime = (date: Date) => {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/* ─── Component ─── */
const AarkaChatbot = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [isWaitingForAPI, setIsWaitingForAPI] = useState(false);
  const [isStreamingText, setIsStreamingText] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const streamAbortRef = useRef(false);
  const streamingMsgIdRef = useRef<string | null>(null);
  const apiAbortRef = useRef<AbortController | null>(null);

  // Load conversations and mount
  useEffect(() => {
    const loaded = loadConversations();
    if (loaded.length > 0) {
      setConversations(loaded);
      setActiveConvId(loaded[0].id);
    } else {
      const defaultId = generateId();
      setConversations([
        {
          id: defaultId,
          title: "New conversation",
          messages: [],
          createdAt: new Date(),
        },
      ]);
      setActiveConvId(defaultId);
    }
    setMounted(true);
  }, []);

  const activeConv = conversations.find((c) => c.id === activeConvId) || {
    id: "",
    title: "Loading...",
    messages: [],
    createdAt: new Date(),
  };

  // ─── Migrate default/legacy sessions to random IDs ───
  useEffect(() => {
    if (mounted && activeConvId === "default") {
      const freshId = generateId();
      setConversations((prev) =>
        prev.map((c) => (c.id === "default" ? { ...c, id: freshId } : c))
      );
      setActiveConvId(freshId);
    }
  }, [activeConvId, mounted]);

  // ─── Persist conversations ───
  useEffect(() => {
    if (mounted) {
      saveConversations(conversations);
    }
  }, [conversations, mounted]);

  // ─── Auth ───
  useEffect(() => {
    const fetchToken = async () => {
      const savedToken = localStorage.getItem("aarkaai_token");
      if (savedToken) {
        setToken(savedToken);
        return;
      }

      const defaultUser = {
        email: "visitor@aarkaai.com",
        password: "VisitorSecurePassword123!",
        name: "Web Visitor",
      };

      try {
        let resp = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(defaultUser),
        });

        if (resp.status === 200) {
          const data = await resp.json();
          localStorage.setItem("aarkaai_token", data.access_token);
          setToken(data.access_token);
        } else {
          resp = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(defaultUser),
          });
          if (resp.status === 200) {
            const data = await resp.json();
            localStorage.setItem("aarkaai_token", data.access_token);
            setToken(data.access_token);
          }
        }
      } catch (err) {
        console.error("Failed to authenticate visitor:", err);
      }
    };
    fetchToken();
  }, []);

  // ─── Scroll handling ───
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConv.messages, isStreamingText, scrollToBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollFab(distanceFromBottom > 200);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Streaming simulation ───
  const simulateStreaming = useCallback(
    (msgId: string, fullText: string) => {
      streamAbortRef.current = false;
      streamingMsgIdRef.current = msgId;
      setIsStreamingText(true);

      const words = fullText.split(/(\s+)/);
      let wordIndex = 0;
      const WORDS_PER_TICK = 2;
      const TICK_MS = 30;

      const tick = () => {
        if (streamAbortRef.current || wordIndex >= words.length) {
          // Done: set final content
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConvId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === msgId
                        ? { ...m, displayedContent: m.content, isStreaming: false }
                        : m
                    ),
                  }
                : c
            )
          );
          setIsStreamingText(false);
          streamingMsgIdRef.current = null;
          return;
        }

        wordIndex += WORDS_PER_TICK;
        const displayed = words.slice(0, wordIndex).join("");

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === msgId ? { ...m, displayedContent: displayed } : m
                  ),
                }
              : c
          )
        );

        setTimeout(tick, TICK_MS);
      };

      tick();
    },
    [activeConvId]
  );

  // ─── Stop generating ───
  const stopGenerating = useCallback(() => {
    streamAbortRef.current = true;
    if (apiAbortRef.current) {
      apiAbortRef.current.abort();
      apiAbortRef.current = null;
    }
    setIsWaitingForAPI(false);

    // Finalize any streaming message with whatever was displayed so far
    if (streamingMsgIdRef.current) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === streamingMsgIdRef.current
                    ? {
                        ...m,
                        content: m.displayedContent || m.content,
                        isStreaming: false,
                      }
                    : m
                ),
              }
            : c
        )
      );
      streamingMsgIdRef.current = null;
    }
    setIsStreamingText(false);
  }, [activeConvId]);

  // ─── Send message ───
  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = text || input.trim();
      if (!messageText || isWaitingForAPI || isStreamingText) return;

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: messageText,
        displayedContent: messageText,
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConvId) return c;
          return {
            ...c,
            messages: [...c.messages, userMessage],
            title:
              c.messages.length === 0
                ? messageText.slice(0, 40) + (messageText.length > 40 ? "…" : "")
                : c.title,
          };
        })
      );

      setInput("");
      setIsWaitingForAPI(true);

      const abortCtrl = new AbortController();
      apiAbortRef.current = abortCtrl;

      const makePromptRequest = async (authToken: string) => {
        return fetch(`${API_BASE}/prompt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            query: messageText,
            session_id: activeConvId,
          }),
          signal: abortCtrl.signal,
        });
      };

      const refreshToken = async (): Promise<string | null> => {
        try {
          const defaultUser = {
            email: "visitor@aarkaai.com",
            password: "VisitorSecurePassword123!",
            name: "Web Visitor",
          };
          let resp = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(defaultUser),
          });
          if (resp.status === 200) {
            const data = await resp.json();
            localStorage.setItem("aarkaai_token", data.access_token);
            setToken(data.access_token);
            return data.access_token;
          } else {
            // Self-heal: Try to register if login fails (e.g., database reset)
            resp = await fetch(`${API_BASE}/auth/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(defaultUser),
            });
            if (resp.status === 200) {
              const data = await resp.json();
              localStorage.setItem("aarkaai_token", data.access_token);
              setToken(data.access_token);
              return data.access_token;
            }
          }
        } catch { /* ignore */ }
        return null;
      };

      try {
        const currentToken = token || localStorage.getItem("aarkaai_token") || "";
        let resp = await makePromptRequest(currentToken);

        // If 401/403, refresh token and retry once
        if (resp.status === 401 || resp.status === 403) {
          const newToken = await refreshToken();
          if (newToken) {
            resp = await makePromptRequest(newToken);
          }
        }

        if (resp.status === 200) {
          const data = await resp.json();
          const aiMsgId = generateId();
          const aiMessage: Message = {
            id: aiMsgId,
            role: "assistant",
            content: data.response,
            displayedContent: "",
            timestamp: new Date(),
            isStreaming: true,
            processingTime: data.processing_time || undefined,
          };

          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConvId
                ? { ...c, messages: [...c.messages, aiMessage] }
                : c
            )
          );

          setIsWaitingForAPI(false);
          simulateStreaming(aiMsgId, data.response);
        } else {
          throw new Error(`API returned status ${resp.status}`);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setIsWaitingForAPI(false);
          return;
        }
        console.error("Chat request failed:", err);
        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: "I'm sorry, I'm having trouble connecting to the Aarka AI backend right now. Please try again in a moment.",
          displayedContent: "I'm sorry, I'm having trouble connecting to the Aarka AI backend right now. Please try again in a moment.",
          timestamp: new Date(),
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? { ...c, messages: [...c.messages, errorMessage] }
              : c
          )
        );
        setIsWaitingForAPI(false);
      }
    },
    [input, isWaitingForAPI, isStreamingText, activeConvId, token, simulateStreaming]
  );

  // ─── Regenerate last response ───
  const regenerateLastResponse = useCallback(() => {
    const msgs = activeConv.messages;
    // Find last user message
    let lastUserIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx === -1) return;

    const lastUserText = msgs[lastUserIdx].content;

    // Remove all messages after (and including) last assistant response
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, messages: c.messages.slice(0, lastUserIdx + 1) }
          : c
      )
    );

    // Re-send
    setTimeout(() => sendMessage(lastUserText), 100);
  }, [activeConv, activeConvId, sendMessage]);

  // ─── Conversation management ───
  const newConversation = () => {
    const conv: Conversation = {
      id: generateId(),
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(conv.id);
  };

  const deleteConversation = (id: string) => {
    if (conversations.length <= 1) return;
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveConvId(remaining[0].id);
    }
  };

  // Find the last assistant message id
  const lastAssistantId = (() => {
    for (let i = activeConv.messages.length - 1; i >= 0; i--) {
      if (activeConv.messages[i].role === "assistant") return activeConv.messages[i].id;
    }
    return null;
  })();

  const isBusy = isWaitingForAPI || isStreamingText;

  if (!mounted) {
    return (
      <div className="chat-container">
        <div className="chat-loading-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', color: '#94a3b8' }}>
          Loading Aarka AI...
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* ─── Sidebar ─── */}
      <aside className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="chat-sidebar-header">
          <button className="chat-new-btn" onClick={newConversation}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New chat</span>
          </button>
          <button className="chat-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="chat-sidebar-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chat-sidebar-search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="chat-sidebar-search-input"
            placeholder="Search conversations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="chat-sidebar-search-clear" onClick={() => setSearchQuery("")}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="chat-sidebar-list">
          {conversations
            .filter((conv) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              if (conv.title.toLowerCase().includes(q)) return true;
              return conv.messages.some((m) => m.content.toLowerCase().includes(q));
            })
            .map((conv) => (
            <div
              key={conv.id}
              className={`chat-sidebar-item ${conv.id === activeConvId ? "active" : ""}`}
              onClick={() => setActiveConvId(conv.id)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chat-sidebar-item-icon">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <div className="chat-sidebar-item-info">
                <span className="chat-sidebar-item-title">{conv.title}</span>
                <span className="chat-sidebar-item-meta" suppressHydrationWarning>
                  {formatConvDate(conv.createdAt)} · {formatConvTime(conv.createdAt)}
                </span>
              </div>
              {conversations.length > 1 && (
                <button
                  className="chat-sidebar-item-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="chat-sidebar-footer">
          <div className="chat-sidebar-brand">
            <div className="chat-sidebar-brand-icon">A</div>
            <div>
              <p className="chat-sidebar-brand-name">Aarka AI</p>
              <p className="chat-sidebar-brand-ver">v2.2</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="chat-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Main Chat Area ─── */}
      <div className="chat-main">
        {/* Top bar */}
        <div className="chat-topbar">
          {!sidebarOpen && (
            <button className="chat-sidebar-toggle" onClick={() => setSidebarOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>
          )}
          <div className="chat-topbar-title">
            <span className="chat-topbar-model">Aarka AI</span>
          </div>
          {isBusy && (
            <div className="chat-topbar-status">
              <span className="chat-topbar-status-dot" />
              {isWaitingForAPI ? "Thinking…" : "Generating…"}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="chat-messages" ref={messagesContainerRef}>
          {activeConv.messages.length === 0 && !isBusy ? (
            <ChatWelcome>
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={() => sendMessage()}
                onStop={stopGenerating}
                isStreaming={isBusy}
                disabled={isWaitingForAPI}
              />
            </ChatWelcome>
          ) : (
            <div className="chat-messages-inner">
               {activeConv.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onRegenerate={regenerateLastResponse}
                  isLastAssistant={msg.id === lastAssistantId}
                  token={token}
                  sessionId={activeConvId}
                />
              ))}

              {/* Waiting indicator (before API responds) */}
              {isWaitingForAPI && (
                <div className="cmsg-row assistant">
                  <div className="cmsg-avatar cmsg-avatar-assistant">
                    <span className="cmsg-avatar-letter">A</span>
                  </div>
                  <div className="cmsg-content">
                    <div className="cmsg-header">
                      <span className="cmsg-role-label">Aarka AI</span>
                    </div>
                    <div className="cmsg-body">
                      <div className="typing-dots">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Scroll FAB */}
          <ChatScrollFab visible={showScrollFab} onClick={scrollToBottom} />
        </div>

        {/* Input (only shown when conversation has active messages or generating) */}
        {(activeConv.messages.length > 0 || isBusy) && (
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => sendMessage()}
            onStop={stopGenerating}
            isStreaming={isBusy}
            disabled={isWaitingForAPI}
          />
        )}
      </div>
    </div>
  );
};

export default AarkaChatbot;

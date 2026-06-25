"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage from "./chat/ChatMessage";
import ChatWelcome from "./chat/ChatWelcome";
import ChatInput from "./chat/ChatInput";
import ChatScrollFab from "./chat/ChatScrollFab";
import SkillStudio from "./SkillStudio";

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
  const [statusText, setStatusText] = useState("");

  // New Features State
  const [userInfo, setUserInfo] = useState<{ email: string; name: string; tier: string; queriesUsed: number; windowLimit: number } | null>(null);
  const [showUserPopover, setShowUserPopover] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showSkillStudio, setShowSkillStudio] = useState(false);

  // Form States
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");

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

  // ─── Auth & Features ───
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("aarkaai_theme");
      if (savedTheme === "dark") {
        setTheme("dark");
      }
    }
  }, []);

  const fetchProfile = useCallback(async (authToken: string) => {
    try {
      const resp = await fetch(`${API_BASE}/subscription`, {
        headers: { "Authorization": `Bearer ${authToken}` },
      });
      if (resp.status === 200) {
        const data = await resp.json();
        let name = "Web Visitor";
        let email = "visitor@aarkaai.com";
        try {
          const parts = authToken.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.sub) {
              const savedInfo = localStorage.getItem(`aarkaai_user_info_${payload.sub}`);
              if (savedInfo) {
                const parsed = JSON.parse(savedInfo);
                name = parsed.name || name;
                email = parsed.email || email;
              }
            }
          }
        } catch {}
        setUserInfo({
          email,
          name,
          tier: data.tier,
          queriesUsed: data.queries_used_in_window,
          windowLimit: data.window_limit,
        });
      }
    } catch (err) {
      console.error("Failed to fetch subscription profile:", err);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    }
  }, [token, fetchProfile]);

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

  // Google OAuth Popup Message Listener
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "google_login_success") {
        const googleUser = {
          email: "googleuser@gmail.com",
          password: "GoogleSecurePassword123!",
          name: "Google User",
        };
        try {
          let resp = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(googleUser),
          });
          if (resp.status !== 200) {
            resp = await fetch(`${API_BASE}/auth/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(googleUser),
            });
          }
          if (resp.status === 200) {
            const data = await resp.json();
            localStorage.setItem("aarkaai_token", data.access_token);
            localStorage.setItem(`aarkaai_user_info_${data.user_id}`, JSON.stringify({ name: googleUser.name, email: googleUser.email }));
            setToken(data.access_token);
            setShowAuthModal(false);
          }
        } catch (err) {
          console.error("Google sign in flow failed:", err);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = isLoginView ? "/auth/login" : "/auth/register";
    const payload = isLoginView
      ? { email: authEmail, password: authPassword, name: "" }
      : { email: authEmail, password: authPassword, name: authName };

    try {
      const resp = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (resp.status === 200) {
        const data = await resp.json();
        localStorage.setItem("aarkaai_token", data.access_token);
        localStorage.setItem(`aarkaai_user_info_${data.user_id}`, JSON.stringify({ name: data.name || authName, email: authEmail }));
        setToken(data.access_token);
        setShowAuthModal(false);
        setAuthEmail("");
        setAuthPassword("");
        setAuthName("");
      } else {
        const errData = await resp.json();
        setAuthError(errData.detail || "Authentication failed.");
      }
    } catch (err) {
      setAuthError("Failed to connect to authentication server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("aarkaai_token");
    setToken(null);
    setUserInfo(null);
    setShowUserPopover(false);
    window.location.reload();
  };

  const handleUpgrade = async () => {
    if (!token) return;
    try {
      const resp = await fetch(`${API_BASE}/subscription/upgrade`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (resp.status === 200) {
        fetchProfile(token);
        setShowUpgradeModal(false);
        alert("Success! You are now subscribed to Aarkaa Premium.");
      }
    } catch (err) {
      console.error("Upgrade failed:", err);
    }
  };

  const handleGoogleLogin = () => {
    const popup = window.open("", "Google Login", "width=480,height=550");
    if (popup) {
      popup.document.write(`
        <html>
          <head>
            <title>Sign in with Google</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #ffffff; color: #1e293b; text-align: center; }
              .logo { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
              .logo span { color: #4285F4; }
              .logo span:nth-child(2) { color: #EA4335; }
              .logo span:nth-child(3) { color: #FBBC05; }
              .logo span:nth-child(4) { color: #34A853; }
              .spinner { border: 3px solid #f1f5f9; border-top: 3px solid #3b82f6; border-radius: 50%; width: 32px; height: 32px; animation: spin 0.8s linear infinite; margin-top: 20px; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div>
            <div style="font-size: 14px; color: #64748b;">Signing in to Aarkaa AI</div>
            <div class="spinner"></div>
            <script>
              setTimeout(() => {
                window.opener.postMessage({ type: "google_login_success" }, "*");
                window.close();
              }, 1200);
            </script>
          </body>
        </html>
      `);
    }
  };

  // ─── Scroll handling ───
  const isAtBottomRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior | any = "smooth") => {
    const cleanBehavior = typeof behavior === "string" ? behavior : "smooth";
    messagesEndRef.current?.scrollIntoView({ behavior: cleanBehavior as ScrollBehavior });
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      // If user is within 150px of the bottom, keep auto-scrolling
      isAtBottomRef.current = distanceFromBottom < 150;
      setShowScrollFab(distanceFromBottom > 200);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAtBottomRef.current) {
      // Use instant 'auto' scroll during token streaming to prevent scroll locking
      scrollToBottom(isStreamingText ? "auto" : "smooth");
    }
  }, [activeConv.messages, isStreamingText, scrollToBottom]);

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
    setStatusText("");

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
    async (text?: string, files?: { name: string; path: string }[]) => {
      const rawText = text || input.trim();
      if (!rawText && (!files || files.length === 0)) return;
      if (isWaitingForAPI || isStreamingText) return;

      const displayText = rawText || (files ? `Uploaded: ${files.map(f => f.name).join(", ")}` : "");
      let backendQuery = rawText;
      if (files && files.length > 0) {
        const fileList = files.map(f => f.name).join(", ");
        backendQuery = `${rawText}\n\n[Uploaded Workspace File(s): ${fileList}]`;
      }

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: backendQuery,
        displayedContent: displayText,
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
                ? displayText.slice(0, 40) + (displayText.length > 40 ? "…" : "")
                : c.title,
          };
        })
      );

      setInput("");
      setIsWaitingForAPI(true);
      setStatusText("Thinking...");

      const abortCtrl = new AbortController();
      apiAbortRef.current = abortCtrl;

      const makePromptRequest = async (authToken: string) => {
        return fetch(`${API_BASE}/prompt/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            query: backendQuery,
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
          const reader = resp.body?.getReader();
          if (!reader) {
            throw new Error("Response body is not readable");
          }

          let aiMsgId = "";
          let messageAdded = false;

          const decoder = new TextDecoder("utf-8");
          let buffer = "";
          let fullText = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              
              // Keep the last partial line in the buffer
              buffer = lines.pop() || "";

              for (const line of lines) {
                const cleanLine = line.trim();
                if (!cleanLine.startsWith("data:")) continue;

                const rawJson = cleanLine.substring(5).trim();
                if (!rawJson) continue;

                try {
                  const chunk = JSON.parse(rawJson);
                  if (chunk.type === "status") {
                    setStatusText(chunk.status || "");
                  } else if (chunk.type === "content" && chunk.token) {
                    if (!messageAdded) {
                      aiMsgId = generateId();
                      const aiMessage: Message = {
                        id: aiMsgId,
                        role: "assistant",
                        content: "",
                        displayedContent: "",
                        timestamp: new Date(),
                        isStreaming: true,
                      };

                      setConversations((prev) =>
                        prev.map((c) =>
                          c.id === activeConvId
                            ? { ...c, messages: [...c.messages, aiMessage] }
                            : c
                        )
                      );
                      messageAdded = true;
                      setIsWaitingForAPI(false);
                      setIsStreamingText(true);
                      setStatusText("");
                    }

                    fullText += chunk.token;
                    // Update state with incremental text
                    setConversations((prev) =>
                      prev.map((c) =>
                        c.id === activeConvId
                          ? {
                              ...c,
                              messages: c.messages.map((m) =>
                                m.id === aiMsgId
                                  ? { ...m, content: fullText, displayedContent: fullText }
                                  : m
                              ),
                            }
                          : c
                      )
                    );
                  } else if (chunk.type === "final") {
                    if (messageAdded) {
                      setConversations((prev) =>
                        prev.map((c) =>
                          c.id === activeConvId
                            ? {
                                ...c,
                                messages: c.messages.map((m) =>
                                  m.id === aiMsgId
                                    ? { ...m, processingTime: chunk.processing_time || undefined }
                                    : m
                                ),
                              }
                            : c
                        )
                      );
                    }
                  } else if (chunk.type === "error") {
                    throw new Error(chunk.detail || "Error streaming tokens");
                  }
                } catch (e) {
                  console.error("Error parsing SSE chunk:", e);
                }
              }
            }
          } finally {
            reader.releaseLock();
            
            // Mark streaming as complete ALWAYS in finally, ensuring it clears even if connection closes or throws!
            if (messageAdded && aiMsgId) {
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === activeConvId
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === aiMsgId ? { ...m, isStreaming: false } : m
                        ),
                      }
                    : c
                )
              );
            }
            setIsStreamingText(false);
            setIsWaitingForAPI(false);
            setStatusText("");
          }
        } else {
          throw new Error(`API returned status ${resp.status}`);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setIsWaitingForAPI(false);
          setStatusText("");
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
        setStatusText("");
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
    <div className={`chat-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
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
          <button className="chat-user-menu-btn" onClick={() => setShowUserPopover(!showUserPopover)}>
            <div className="chat-user-avatar">
              {userInfo ? userInfo.name[0].toUpperCase() : "U"}
            </div>
            <div className="chat-user-info">
              <span className="chat-user-name">{userInfo ? userInfo.name : "Loading..."}</span>
              <span className={`chat-user-role ${userInfo?.tier === 'premium' ? 'premium' : ''}`}>
                {userInfo?.tier === 'premium' ? 'Aarkaa Premium' : 'Free Tier'}
              </span>
            </div>
            <svg className="chat-user-more-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>

          {showUserPopover && (
            <div className="chat-user-popover">
              <button className="chat-user-popover-item" onClick={() => { setShowUserPopover(false); setShowUpgradeModal(true); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 22 22 22"/>
                </svg>
                <span>Subscription</span>
              </button>
              <button className="chat-user-popover-item" onClick={() => { setShowUserPopover(false); setShowSkillStudio(true); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span>Skill Studio</span>
              </button>
              <div className="chat-user-popover-divider"/>
              {userInfo && userInfo.email !== 'visitor@aarkaai.com' ? (
                <button className="chat-user-popover-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span>Log out</span>
                </button>
              ) : (
                <button className="chat-user-popover-item" onClick={() => { setShowUserPopover(false); setShowAuthModal(true); }} style={{ color: '#3b82f6' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  <span>Log in</span>
                </button>
              )}
            </div>
          )}
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
              {isWaitingForAPI ? (statusText || "Thinking…") : "Generating…"}
            </div>
          )}
        </div>

        {/* Compact SkillStudio sub-page render */}
        {showSkillStudio ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", borderTop: "1px solid rgba(0, 0, 0, 0.05)" }}>
            <SkillStudio inline={true} onClose={() => setShowSkillStudio(false)} />
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="chat-messages" ref={messagesContainerRef}>
              {activeConv.messages.length === 0 && !isBusy ? (
                <ChatWelcome>
                  <ChatInput
                    value={input}
                    onChange={setInput}
                    onSend={sendMessage}
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
                      onCreateDocument={(type) => sendMessage(`Create a ${type} document of the previous message/report.`)}
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
                          {statusText && (
                            <p className="cmsg-status-text">
                              {statusText}
                            </p>
                          )}
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
                onSend={sendMessage}
                onStop={stopGenerating}
                isStreaming={isBusy}
                disabled={isWaitingForAPI}
              />
            )}
          </>
        )}
      </div>

      {/* ─── Modals ─── */}
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="chat-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <h3 className="chat-modal-title">{isLoginView ? "Sign in to Aarkaa AI" : "Create Account"}</h3>
              <button className="chat-modal-close" onClick={() => setShowAuthModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Google Sign-in */}
            <button className="chat-google-btn" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
                <path d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.76-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.435 1.21 15.62 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', color: '#94a3b8', fontSize: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(226, 232, 240, 0.4)' }}/>
              <span style={{ padding: '0 8px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(226, 232, 240, 0.4)' }}/>
            </div>

            <form onSubmit={handleAuthSubmit}>
              {!isLoginView && (
                <div className="chat-form-group">
                  <label className="chat-form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Enter your name"
                    className="chat-form-input"
                  />
                </div>
              )}
              <div className="chat-form-group">
                <label className="chat-form-label">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="chat-form-input"
                />
              </div>
              <div className="chat-form-group">
                <label className="chat-form-label">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="chat-form-input"
                />
              </div>

              {authError && (
                <div style={{ color: '#ef4444', fontSize: '12px', margin: '8px 0', fontWeight: 500 }}>
                  {authError}
                </div>
              )}

              <button type="submit" className="chat-modal-btn">
                {isLoginView ? "Sign In" : "Register"}
              </button>
            </form>

            <div className="chat-modal-switch-text">
              {isLoginView ? "Don't have an account?" : "Already have an account?"}
              <button className="chat-modal-switch-link" onClick={() => { setIsLoginView(!isLoginView); setAuthError(""); }}>
                {isLoginView ? "Create account" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="chat-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <h3 className="chat-modal-title">Settings</h3>
              <button className="chat-modal-close" onClick={() => setShowSettingsModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="chat-form-group" style={{ marginBottom: '24px' }}>
              <label className="chat-form-label">Interface Theme</label>
              <div className="chat-settings-theme-row">
                <button
                  className={`chat-theme-option-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => { setTheme('light'); localStorage.setItem('aarkaai_theme', 'light'); }}
                >
                  Light Theme
                </button>
                <button
                  className={`chat-theme-option-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => { setTheme('dark'); localStorage.setItem('aarkaai_theme', 'dark'); }}
                >
                  Dark Theme
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(226, 232, 240, 0.4)', paddingTop: '16px' }}>
              <label className="chat-form-label" style={{ marginBottom: '8px', display: 'block' }}>User Account Profile</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                <p style={{ margin: 0, fontWeight: 500 }}>{userInfo?.name || 'Visitor User'}</p>
                <p style={{ margin: 0, color: '#64748b' }}>{userInfo?.email || 'visitor@aarkaai.com'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="chat-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <h3 className="chat-modal-title">Aarkaa AI Premium</h3>
              <button className="chat-modal-close" onClick={() => setShowUpgradeModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {userInfo?.tier === 'premium' ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div className="chat-upgrade-badge" style={{ marginBottom: '8px' }}>Subscribed</div>
                <h4 style={{ margin: '8px 0 4px', fontSize: '16px', fontWeight: 700 }}>You are on Premium!</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Thank you for subscribing to Aarkaa Premium.</p>
              </div>
            ) : (
              <div>
                <div className="chat-upgrade-card">
                  <div className="chat-upgrade-badge" style={{ marginBottom: '8px' }}>Claude Pro Style</div>
                  <div className="chat-upgrade-price">$20 / month</div>
                  <p className="chat-upgrade-desc">Access high-grade technical tools and unlimited financial/options suggestions.</p>
                </div>

                <div className="chat-upgrade-benefits">
                  <div className="chat-upgrade-benefit-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '6px' }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Unlimited options strategies & metrics</span>
                  </div>
                  <div className="chat-upgrade-benefit-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '6px' }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Unlimited daily prompt queries</span>
                  </div>
                  <div className="chat-upgrade-benefit-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '6px' }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Dynamic multi-turn options strategies</span>
                  </div>
                </div>

                <button className="chat-modal-btn" onClick={handleUpgrade}>
                  Upgrade to Premium
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AarkaChatbot;

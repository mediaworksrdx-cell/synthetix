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

/* ─── localStorage & Authentication Storage Policy Helpers ─── */
const STORAGE_KEY = "aarkaai_conversations";

const isAuthTokenValidAndAuthenticated = (authToken: string | null): boolean => {
  if (!authToken) return false;
  try {
    const parts = authToken.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    if (
      payload.sub &&
      payload.sub !== "guest_visitor" &&
      payload.sub !== "service_api_user" &&
      payload.email !== "visitor@aarkaai.com"
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};

const loadConversations = (authToken: string | null): Conversation[] => {
  if (typeof window === "undefined") return [];
  if (!isAuthTokenValidAndAuthenticated(authToken)) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return [];
  }
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

const saveConversations = (convs: Conversation[], authToken: string | null) => {
  if (typeof window === "undefined") return;
  if (!isAuthTokenValidAndAuthenticated(authToken)) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return;
  }
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
  const [selectedModel, setSelectedModel] = useState<string>("aarkaa-2.0-high");

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

  // Interactive GitHub Prompt dialog configuration
  const [showGitCredentialsPrompt, setShowGitCredentialsPrompt] = useState(false);
  const [gitUserField, setGitUserField] = useState("");
  const [gitTokenField, setGitTokenField] = useState("");
  const [pendingQueryStr, setPendingQueryStr] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const streamAbortRef = useRef(false);
  const streamingMsgIdRef = useRef<string | null>(null);
  const apiAbortRef = useRef<AbortController | null>(null);

  // Load conversations and mount
  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("aarkaai_token") : null;
    const loaded = loadConversations(savedToken);
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
      saveConversations(conversations, token);
    }
  }, [conversations, mounted, token]);

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
      if (savedToken && isAuthTokenValidAndAuthenticated(savedToken)) {
        setToken(savedToken);
        return;
      }

      // Guest / Visitor mode: Purge persistent storage to prevent guest browser tracking
      try {
        localStorage.removeItem("aarkaai_token");
        localStorage.removeItem("aarkaai_conversations");
      } catch {}

      try {
        const resp = await fetch("/api/auth/visitor", {
          method: "POST",
        });

        if (resp.status === 200) {
          const data = await resp.json();
          // Keep visitor token strictly in React memory state — NEVER persist to localStorage
          setToken(data.access_token);
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
      // Security: Only accept messages from our own origin
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "google_login_success") {
        try {
          const resp = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: event.data.email, name: event.data.name }),
          });
          if (resp.status === 200) {
            const data = await resp.json();
            localStorage.setItem("aarkaai_token", data.access_token);
            localStorage.setItem(`aarkaai_user_info_${data.user_id}`, JSON.stringify({ name: event.data.name || "Google User", email: event.data.email || "googleuser@gmail.com" }));
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
    } catch {
      setAuthError("Failed to connect to authentication server.");
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("aarkaai_token");
      localStorage.removeItem("aarkaai_conversations");
      if (typeof window !== "undefined" && window.localStorage) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith("aarkaai_")) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch {}
    setToken(null);
    setUserInfo(null);
    setConversations([]);
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
    // Google OAuth requires proper server-side integration with Google Identity Services.
    // This is a placeholder — do NOT ship a simulated flow in production.
    alert("Google Sign-In is not yet configured. Please use email login or contact support.");
  };

  // ─── Scroll handling ───
  const isAtBottomRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
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

  // ─── Claude-style token queue + rAF drain loop ───
  // SSE tokens arrive in network bursts (TCP batches multiple events).
  // The queue absorbs bursts; a rAF loop drains them at a smooth adaptive rate.
  const tokenQueueRef = useRef<string[]>([]);
  const drainRafRef = useRef<number | null>(null);
  const drainMsgIdRef = useRef<string | null>(null);
  const drainedTextRef = useRef("");
  const streamDoneRef = useRef(false);

  const startTokenDrain = useCallback(
    (msgId: string) => {
      if (drainRafRef.current !== null) return; // already running
      drainMsgIdRef.current = msgId;
      drainedTextRef.current = "";
      streamDoneRef.current = false;

      const drain = () => {
        if (streamAbortRef.current) {
          tokenQueueRef.current = [];
          drainRafRef.current = null;
          drainMsgIdRef.current = null;
          setIsStreamingText(false);
          return;
        }

        const queue = tokenQueueRef.current;
        if (queue.length > 0) {
          // Adaptive drain: pull more tokens per frame when queue is deep (catches up),
          // pull fewer when shallow (smooth, natural pacing)
          const pullCount = Math.max(1, Math.min(4, Math.ceil(queue.length / 3)));
          const batch = queue.splice(0, pullCount).join("");
          drainedTextRef.current += batch;
          const displayed = drainedTextRef.current;
          const id = drainMsgIdRef.current;

          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConvId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === id
                        ? { ...m, content: displayed, displayedContent: displayed }
                        : m
                    ),
                  }
                : c
            )
          );
          drainRafRef.current = requestAnimationFrame(drain);
        } else if (streamDoneRef.current) {
          // Queue empty and SSE finished — finalize
          const finalText = drainedTextRef.current;
          const id = drainMsgIdRef.current;
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConvId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === id
                        ? { ...m, content: finalText, displayedContent: finalText, isStreaming: false }
                        : m
                    ),
                  }
                : c
            )
          );
          drainRafRef.current = null;
          drainMsgIdRef.current = null;
          streamingMsgIdRef.current = null;
          setIsStreamingText(false);
        } else {
          // Queue empty but SSE still sending — wait for next frame
          drainRafRef.current = requestAnimationFrame(drain);
        }
      };

      drainRafRef.current = requestAnimationFrame(drain);
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
    // Cancel the rAF drain loop and flush queue
    if (drainRafRef.current) {
      cancelAnimationFrame(drainRafRef.current);
      drainRafRef.current = null;
    }
    tokenQueueRef.current = [];
    streamDoneRef.current = false;
    setIsWaitingForAPI(false);
    setStatusText("");

    // Finalize any streaming message with whatever was displayed so far
    if (streamingMsgIdRef.current) {
      const displayedSoFar = drainedTextRef.current;
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === streamingMsgIdRef.current
                    ? {
                        ...m,
                        content: displayedSoFar || m.displayedContent || m.content,
                        isStreaming: false,
                      }
                    : m
                ),
              }
            : c
        )
      );
      streamingMsgIdRef.current = null;
      drainMsgIdRef.current = null;
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
            model_override: selectedModel,
          }),
          signal: abortCtrl.signal,
        });
      };

      const refreshToken = async (): Promise<string | null> => {
        try {
          const resp = await fetch("/api/auth/visitor", {
            method: "POST",
          });
          if (resp.status === 200) {
            const data = await resp.json();
            // Only persist to localStorage if user is authenticated (not a visitor)
            if (isAuthTokenValidAndAuthenticated(data.access_token)) {
              localStorage.setItem("aarkaai_token", data.access_token);
            }
            setToken(data.access_token);
            return data.access_token;
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
                    if (chunk.token.includes("INTERACTIVE_INPUT_REQUEST")) {
                      // Trigger credential capture dialog modal
                      setPendingQueryStr(backendQuery);
                      setShowGitCredentialsPrompt(true);
                      // Gracefully terminate request to prevent error states
                      abortCtrl.abort();
                      setIsWaitingForAPI(false);
                      setStatusText("");
                      return;
                    }
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
                      streamingMsgIdRef.current = aiMsgId;
                      setIsWaitingForAPI(false);
                      setIsStreamingText(true);
                      setStatusText("");
                    }

                    // ── Push token into the drain queue for smooth rAF rendering ──
                    fullText += chunk.token;
                    tokenQueueRef.current.push(chunk.token);
                    if (aiMsgId && !drainRafRef.current) {
                      startTokenDrain(aiMsgId);
                    }
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
                    if (chunk.detail && chunk.detail.includes("GIT_CREDENTIALS_REQUIRED")) {
                      // Trigger credential capture dialog modal
                      setPendingQueryStr(backendQuery);
                      setShowGitCredentialsPrompt(true);
                      abortCtrl.abort();
                      setIsWaitingForAPI(false);
                      setStatusText("");
                      return;
                    }
                    throw new Error(chunk.detail || "Error streaming tokens");
                  }
                } catch (e) {
                  console.error("Error parsing SSE chunk:", e);
                }
              }
            }
          } finally {
            reader.releaseLock();
            
            // Signal the rAF drain loop that the SSE stream is done.
            // The drain loop will finalize the message once it empties the queue,
            // ensuring every queued token is rendered before marking isStreaming=false.
            streamDoneRef.current = true;
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
          content: "I'm sorry, I'm having trouble connecting to the Aarka AI 2.0 backend right now. Please try again in a moment.",
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
    [input, isWaitingForAPI, isStreamingText, activeConvId, token, startTokenDrain]
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
          Loading Aarka AI 2.0...
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
          <div className="chat-topbar-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em" }}>Aarka AI 2.0</span>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#d97706", background: "rgba(245,158,11,0.12)", padding: "2px 8px", borderRadius: "12px", border: "1px solid rgba(245,158,11,0.25)" }}>
              {selectedModel.startsWith("aarkaa") ? "⚡ Aarka 2.0 Engine" : selectedModel.includes("gemini") ? "✨ Google Gemini" : selectedModel.includes("claude") ? "🧠 Anthropic Claude" : "🤖 GPT-OSS"}
            </span>
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
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
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
                          <span className="cmsg-role-label">Aarka AI 2.0</span>
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
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
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

            {/* GitHub Sign-in */}
            <button
              type="button"
              className="chat-google-btn"
              style={{ backgroundColor: '#24292e', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}
              onClick={() => { window.location.href = "http://3.223.192.194:5000/auth/github/login"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>Continue with GitHub</span>
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

      {/* GitHub Credentials Pop-up Dialog Modal */}
      {showGitCredentialsPrompt && (
        <div className="chat-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="chat-modal-container" style={{ maxWidth: '400px' }}>
            <div className="chat-modal-header">
              <h3 className="chat-modal-title">Git Credentials Required</h3>
              <button className="chat-modal-close" onClick={() => setShowGitCredentialsPrompt(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
              The active workspace requires authentication details to execute secure git tasks. Please enter your parameters below.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setShowGitCredentialsPrompt(false);
              
              // Temporarily inject username and token parameters into query so backend parses them
              const authArgs = `\n\n[AuthParams: username="${gitUserField}" token="${gitTokenField}"]`;
              const queryWithAuth = pendingQueryStr + authArgs;
              
              // Trigger message processing
              sendMessage(queryWithAuth);
            }}>
              <div className="chat-form-group" style={{ marginBottom: '12px' }}>
                <label className="chat-form-label">GitHub Username</label>
                <input
                  type="text"
                  required
                  value={gitUserField}
                  onChange={(e) => setGitUserField(e.target.value)}
                  placeholder="e.g. john-doe"
                  className="chat-form-input"
                />
              </div>

              <div className="chat-form-group" style={{ marginBottom: '20px' }}>
                <label className="chat-form-label">Personal Access Token (PAT)</label>
                <input
                  type="password"
                  required
                  value={gitTokenField}
                  onChange={(e) => setGitTokenField(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="chat-form-input"
                />
              </div>

              <button type="submit" className="chat-modal-btn">
                Authenticate & Run Command
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AarkaChatbot;

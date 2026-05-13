"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const WELCOME_SUGGESTIONS = [
  { icon: "M13 10V3L4 14h7v7l9-11h-7z", label: "Explain Aarka AI capabilities" },
  { icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", label: "How does enterprise AI integration work?" },
  { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m8 0V9a2 2 0 012-2h2a2 2 0 012 2v10m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4", label: "Show me analytics dashboard options" },
  { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label: "What security features are built-in?" },
];

const AI_RESPONSES = [
  "Aarka AI is our proprietary intelligence engine designed for enterprise-scale operations. It features **Neural Orchestration** for coordinating multiple LLM agents, **Contextual Memory** for long-term knowledge retention, and **Deterministic Output** for mission-critical reliability.\n\nWould you like me to dive deeper into any of these capabilities?",
  "Enterprise AI integration with Aarka follows a three-phase approach:\n\n1. **Discovery** — We map your existing workflows and identify automation opportunities\n2. **Integration** — Our API-first architecture connects seamlessly with your tech stack\n3. **Optimization** — Continuous learning loops refine performance over time\n\nThe entire process typically takes 4-8 weeks depending on complexity.",
  "Our analytics dashboards provide real-time visibility into:\n\n- **System Performance** — Latency, throughput, and error rates\n- **AI Agent Activity** — Decision paths, confidence scores, and audit trails\n- **Business Metrics** — Custom KPIs with predictive trend analysis\n\nEach dashboard is fully customizable and supports role-based access control.",
  "Security is at the core of Aarka AI. Here's what's built in:\n\n- **End-to-end encryption** (AES-256 at rest, TLS 1.3 in transit)\n- **Regional data isolation** for compliance with GDPR, SOC 2, HIPAA\n- **Zero-trust architecture** with fine-grained access controls\n- **Full audit logging** with immutable records\n\nWe also support bringing your own encryption keys (BYOK).",
  "Great question! Aarka AI supports multiple deployment models:\n\n- **Cloud-native** — Fully managed SaaS on our infrastructure\n- **Hybrid** — Processing at the edge with cloud orchestration\n- **On-premise** — Complete air-gapped deployment for regulated industries\n\nAll options include 99.99% uptime SLA and 24/7 enterprise support.",
];

const generateId = () => Math.random().toString(36).substring(2, 10);

const AarkaChatbot = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "default",
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
    },
  ]);
  const [activeConvId, setActiveConvId] = useState("default");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId)!;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConv.messages, isTyping, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const sendMessage = useCallback(
    (text?: string) => {
      const messageText = text || input.trim();
      if (!messageText || isTyping) return;

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConvId) return c;
          const updatedMessages = [...c.messages, userMessage];
          return {
            ...c,
            messages: updatedMessages,
            title:
              c.messages.length === 0
                ? messageText.slice(0, 40) + (messageText.length > 40 ? "…" : "")
                : c.title,
          };
        })
      );

      setInput("");
      setIsTyping(true);

      // Simulate AI response
      const responseDelay = 1200 + Math.random() * 1500;
      setTimeout(() => {
        const aiMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
          timestamp: new Date(),
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? { ...c, messages: [...c.messages, aiMessage] }
              : c
          )
        );
        setIsTyping(false);
      }, responseDelay);
    },
    [input, isTyping, activeConvId]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="chat-inline-code">$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n- /g, '</p><li>')
      .replace(/\n(\d+)\. /g, '</p><li class="chat-ol">')
      .replace(/\n/g, '<br/>');

    if (html.includes('<li>') || html.includes('<li class="chat-ol">')) {
      html = '<p>' + html + '</p>';
    } else {
      html = '<p>' + html + '</p>';
    }

    return html;
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <aside className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="chat-sidebar-header">
          <button className="chat-new-btn" onClick={newConversation}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New chat</span>
          </button>
          <button
            className="chat-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        </div>

        <div className="chat-sidebar-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`chat-sidebar-item ${conv.id === activeConvId ? "active" : ""}`}
              onClick={() => setActiveConvId(conv.id)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chat-sidebar-item-icon">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <span className="chat-sidebar-item-title">{conv.title}</span>
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
              <p className="chat-sidebar-brand-ver">v2.4 • Enterprise</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="chat-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Top bar */}
        <div className="chat-topbar">
          {!sidebarOpen && (
            <button
              className="chat-sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>
          )}
          <div className="chat-topbar-title">
            <span className="chat-topbar-model">Aarka AI</span>
            <span className="chat-topbar-badge">Enterprise</span>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {activeConv.messages.length === 0 && !isTyping ? (
            <div className="chat-welcome">
              <div className="chat-welcome-logo">
                <div className="chat-welcome-logo-inner">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 110 20 10 10 0 010-20z" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <div className="chat-welcome-pulse" />
              </div>
              <h2 className="chat-welcome-title">How can I help you today?</h2>
              <p className="chat-welcome-sub">
                I&apos;m Aarka AI — your enterprise intelligence assistant. Ask me about AI integration, analytics, security, or anything else.
              </p>
              <div className="chat-suggestions">
                {WELCOME_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="chat-suggestion-card"
                    onClick={() => sendMessage(s.label)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.icon} />
                    </svg>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-messages-inner">
              {activeConv.messages.map((msg) => (
                <div key={msg.id} className={`chat-bubble-row ${msg.role}`}>
                  {msg.role === "assistant" && (
                    <div className="chat-avatar-ai">
                      <span>A</span>
                    </div>
                  )}
                  <div className={`chat-bubble chat-bubble-${msg.role}`}>
                    {msg.role === "assistant" ? (
                      <div
                        className="chat-bubble-content"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(msg.content),
                        }}
                      />
                    ) : (
                      <p className="chat-bubble-content">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chat-bubble-row assistant">
                  <div className="chat-avatar-ai">
                    <span>A</span>
                  </div>
                  <div className="chat-bubble chat-bubble-assistant">
                    <div className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="chat-input-wrapper">
          <div className="chat-input-bar">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Aarka anything…"
              rows={1}
              className="chat-input"
              disabled={isTyping}
            />
            <button
              className={`chat-send-btn ${input.trim() && !isTyping ? "active" : ""}`}
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="chat-disclaimer">Aarka AI may produce inaccurate information. Verify critical outputs.</p>
        </div>
      </div>
    </div>
  );
};

export default AarkaChatbot;

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  model?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

export default function ClaudeAarkaaAI() {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "session-default",
      title: "Financial & Quantitative Analysis",
      updatedAt: "Just now",
      messages: [
        {
          id: "welcome-msg",
          sender: "assistant",
          text: `Welcome to **Aarkaa AI 2.0**.\n\nI am your specialized intelligence assistant for institutional financial analysis, quantitative modeling, capital markets, and algorithmic research.\n\n### Core Capabilities:\n• **Intrinsic Valuation**: Multi-stage DCF, FCFF projections, WACC sensitivity matrices.\n• **Financial Statements**: 3-statement linking, Dupont ROE decomposition, working capital analysis.\n• **Portfolio Theory**: Markowitz efficient frontier, Sharpe ratio optimization, and beta risk hedging.\n• **Market Research**: Cross-asset analysis, inflation mechanics, and capital structure models.`,
          timestamp: "12:00 AM",
          model: "Aarkaa 2.0 Engine",
        }
      ]
    }
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>("session-default");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState("Aarkaa 2.0 (High)");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    document.title = "Aarkaa AI 2.0 — Advanced Financial Intelligence";
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isTyping]);

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...activeSession.messages, userMsg];
    
    let sessionTitle = activeSession.title;
    if (activeSession.messages.length <= 1) {
      sessionTitle = text.slice(0, 32) + (text.length > 32 ? "..." : "");
    }

    setSessions(prev => prev.map(s => s.id === activeSessionId ? {
      ...s,
      title: sessionTitle,
      messages: updatedMessages,
      updatedAt: "Just now",
    } : s));

    if (!customPrompt) setInputText("");
    setIsTyping(true);

    // Placeholder bot message for live streaming
    const botMsgId = `b-${Date.now()}`;
    let accumulatedText = "";

    try {
      // Connect to SSE streaming endpoint (/prompt/stream)
      const res = await fetch("/prompt/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          session_id: activeSessionId,
        }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        // Initialize bot message in state
        setSessions(prev => prev.map(s => s.id === activeSessionId ? {
          ...s,
          messages: [...updatedMessages, {
            id: botMsgId,
            sender: "assistant",
            text: "",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            model: selectedModel,
          }],
        } : s));

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === "content" && data.token) {
                    accumulatedText += data.token;
                    setSessions(prev => prev.map(s => s.id === activeSessionId ? {
                      ...s,
                      messages: s.messages.map(m => m.id === botMsgId ? { ...m, text: accumulatedText } : m),
                    } : s));
                  }
                } catch {}
              }
            }
          }
        }
      }

      // Fallback if stream was empty
      if (!accumulatedText.trim()) {
        accumulatedText = getFallbackResponse(text);
        setSessions(prev => prev.map(s => s.id === activeSessionId ? {
          ...s,
          messages: s.messages.some(m => m.id === botMsgId)
            ? s.messages.map(m => m.id === botMsgId ? { ...m, text: accumulatedText } : m)
            : [...updatedMessages, {
                id: botMsgId,
                sender: "assistant",
                text: accumulatedText,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                model: selectedModel,
              }],
        } : s));
      }
    } catch {
      accumulatedText = getFallbackResponse(text);
      setSessions(prev => prev.map(s => s.id === activeSessionId ? {
        ...s,
        messages: s.messages.some(m => m.id === botMsgId)
          ? s.messages.map(m => m.id === botMsgId ? { ...m, text: accumulatedText } : m)
          : [...updatedMessages, {
              id: botMsgId,
              sender: "assistant",
              text: accumulatedText,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              model: selectedModel,
            }],
      } : s));
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New Conversation",
      updatedAt: "Just now",
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: "assistant",
          text: `How can I assist you with financial research, valuation models, or algorithmic analysis today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          model: "Aarkaa 2.0 Engine",
        }
      ]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const getFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("dcf") || q.includes("valuation") || q.includes("discounted cash flow")) {
      return `### Discounted Cash Flow (DCF) Valuation Framework\n\nDCF calculates the intrinsic enterprise value of an asset by forecasting Free Cash Flow to Firm (FCFF) and discounting to present value using WACC:\n\n$$\\text{Enterprise Value} = \\sum_{t=1}^{n} \\frac{\\text{FCFF}_t}{(1 + \\text{WACC})^t} + \\frac{\\text{Terminal Value}}{(1 + \\text{WACC})^n}$$\n\n• **Unlevered Free Cash Flow**:\n  $$\\text{FCFF} = \\text{EBIT}(1 - t) + \\text{D\\&A} - \\Delta\\text{NWC} - \\text{CapEx}$$\n• **Weighted Average Cost of Capital**:\n  $$\\text{WACC} = \\left(\\frac{E}{V} \\times K_e\\right) + \\left(\\frac{D}{V} \\times K_d(1 - t)\\right)$$\n• **Terminal Value (Gordon Growth)**:\n  $$\\text{TV} = \\frac{\\text{FCFF}_{n+1}}{\\text{WACC} - g}$$`;
    }

    if (q.includes("pe") || q.includes("ratio") || q.includes("multiple")) {
      return `### Price-to-Earnings (P/E) & Relative Multiples\n\n$$\\text{P/E} = \\frac{\\text{Price per Share}}{\\text{Earnings per Share (EPS)}}$$\n\n• **Trailing vs Forward P/E**: Trailing reflects past 12-month audited earnings; Forward incorporates consensus FY forward projections.\n• **EV/EBITDA**: Capital-structure neutral metric ideal for cross-border peer benchmarking.\n• **PEG Ratio**: $\\text{PEG} = \\frac{\\text{P/E}}{\\text{Earnings Growth Rate (\\%)}}$. A PEG $< 1.0$ typically signals undervaluation relative to growth rate.`;
    }

    return `I have analyzed your query regarding **"${query}"**.\n\nAarkaa AI 2.0 provides institutional precision across:\n1. **Equity & Asset Valuation**: DCF modeling, Comparable Company Analysis (CCA), Precedent Transactions.\n2. **Financial Statement Rigor**: Balance sheet health checks, cash conversion cycles, liquidity ratios.\n3. **Macro & Sector Research**: Interest rate term structures, inflation pass-through, and risk premia.\n\nFeel free to ask for detailed formulas, Python/Excel models, or sector breakdowns!`;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1F1E1B",
      color: "#EFEFE9",
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: "flex",
      flexDirection: "row",
      overflow: "hidden",
      position: "fixed",
      inset: 0,
      zIndex: 99999,
    }}>
      
      {/* ─── CLAUDE THEME SIDEBAR ────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? 280 : 0,
        minWidth: sidebarOpen ? 280 : 0,
        background: "#181715",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={handleNewChat}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "0.625rem",
              background: "#2B2A27",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#EFEFE9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "#CC785C", fontSize: "1.1rem" }}>+</span> New chat
            </span>
            <span style={{ fontSize: "0.75rem", color: "#87867F", background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: "4px" }}>
              ⌘K
            </span>
          </button>
        </div>

        {/* Chat Sessions List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#87867F", textTransform: "uppercase", letterSpacing: "0.05em", padding: "0.5rem 0.5rem 0.25rem" }}>
            Conversations
          </div>
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.6rem 0.75rem",
                borderRadius: "0.5rem",
                background: s.id === activeSessionId ? "#2B2A27" : "transparent",
                border: s.id === activeSessionId ? "1px solid rgba(204,120,92,0.3)" : "1px solid transparent",
                color: s.id === activeSessionId ? "#EFEFE9" : "#B4B3AB",
                fontSize: "0.825rem",
                cursor: "pointer",
                marginBottom: "2px",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: s.id === activeSessionId ? "#CC785C" : "#87867F", fontSize: "0.9rem" }}>💬</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {s.title}
              </span>
            </button>
          ))}
        </div>

        {/* User & Model Footer */}
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#141311" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #CC785C, #9B4F35)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}>
              A
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#EFEFE9" }}>aarka-ai.com</div>
              <div style={{ fontSize: "0.7rem", color: "#87867F" }}>Aarkaa AI 2.0 Engine</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── CHAT MAIN CANVAS ────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", position: "relative" }}>
        
        {/* Top Bar */}
        <div style={{
          padding: "0.75rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(31,30,27,0.85)",
          backdropFilter: "blur(10px)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "transparent",
                border: "none",
                color: "#87867F",
                cursor: "pointer",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
              }}
              title="Toggle Sidebar"
            >
              ☰
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", fontWeight: 600, color: "#EFEFE9" }}>
                Aarkaa AI
              </span>
              <span style={{ fontSize: "0.65rem", background: "rgba(204,120,92,0.15)", color: "#CC785C", border: "1px solid rgba(204,120,92,0.3)", padding: "2px 8px", borderRadius: "9999px", fontWeight: 600 }}>
                2.0 Pro
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              style={{
                background: "#2B2A27",
                color: "#EFEFE9",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.5rem",
                padding: "4px 10px",
                fontSize: "0.75rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="Aarkaa 2.0 (High)">Aarkaa 2.0 (High Precision)</option>
              <option value="Aarkaa Coder 3B">Aarkaa Coder 3B</option>
              <option value="Aarkaa 7B Reasoning">Aarkaa 7B Reasoning</option>
            </select>
          </div>
        </div>

        {/* Messages Stream */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 780, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {activeSession.messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                  gap: "0.35rem",
                }}
              >
                {msg.sender === "assistant" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "#87867F", marginBottom: "0.1rem" }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#CC785C", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: "0.55rem", fontWeight: 800 }}>A</span>
                    <span>Aarkaa AI 2.0</span>
                  </div>
                )}

                <div style={{
                  maxWidth: msg.sender === "user" ? "82%" : "100%",
                  padding: msg.sender === "user" ? "0.85rem 1.15rem" : "1.25rem 1.5rem",
                  borderRadius: msg.sender === "user" ? "1.25rem 1.25rem 0.25rem 1.25rem" : "1rem",
                  background: msg.sender === "user" ? "#CC785C" : "#2B2A27",
                  color: msg.sender === "user" ? "#FFFFFF" : "#EFEFE9",
                  border: msg.sender === "user" ? "none" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  fontSize: "0.925rem",
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.text}
                </div>

                <span style={{ fontSize: "0.65rem", color: "#6A6963", padding: "0 4px" }}>
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", background: "#2B2A27", borderRadius: "1rem", width: "fit-content", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#CC785C", animation: "pulse 1s infinite" }} />
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#CC785C", animation: "pulse 1s infinite 0.2s" }} />
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#CC785C", animation: "pulse 1s infinite 0.4s" }} />
                <span style={{ fontSize: "0.75rem", color: "#87867F", marginLeft: "0.25rem" }}>Aarkaa is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Suggestions (if new chat) */}
        {activeSession.messages.length <= 1 && (
          <div style={{ width: "100%", maxWidth: 780, margin: "0 auto", padding: "0 1rem 0.75rem", display: "flex", gap: "0.5rem", overflowX: "auto", scrollbarWidth: "none" }}>
            {[
              "📈 Explain DCF formula with WACC",
              "📊 Compare P/E, EV/EBITDA and PEG Multiples",
              "💡 Walk through a 3-Statement Financial Model",
              "🛡️ Explain Portfolio Beta & Value at Risk (VaR)",
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                style={{
                  background: "#2B2A27",
                  color: "#B4B3AB",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* ─── CLAUDE THEMED PROMPT INPUT DOCK ─────────────────────────────── */}
        <div style={{ width: "100%", maxWidth: 800, margin: "0 auto", padding: "0.5rem 1rem 1.25rem" }}>
          <div style={{
            background: "#2B2A27",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "1.25rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            padding: "0.75rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Aarkaa AI 2.0 on aarka-ai.com..."
              rows={2}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#EFEFE9",
                fontSize: "0.9rem",
                resize: "none",
                fontFamily: "inherit",
                lineHeight: 1.5,
              }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.7rem", color: "#6A6963" }}>
                  Aarkaa AI 2.0 Engine (:5000)
                </span>
              </div>

              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isTyping}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: inputText.trim() && !isTyping ? "#CC785C" : "#3A3935",
                  color: inputText.trim() && !isTyping ? "#FFFFFF" : "#6A6963",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  cursor: inputText.trim() && !isTyping ? "pointer" : "default",
                  transition: "all 0.2s",
                }}
              >
                ↑
              </button>
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: "0.65rem", color: "#6A6963", marginTop: "0.5rem" }}>
            Aarkaa AI 2.0 can produce inaccurate information about financial assets. Verify critical outputs.
          </div>
        </div>

      </main>
    </div>
  );
}

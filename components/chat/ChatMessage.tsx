"use client";

import { useState, useCallback } from "react";
import ChatMarkdown from "./ChatMarkdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  displayedContent?: string;
  timestamp: Date;
  isStreaming?: boolean;
  processingTime?: number;
}

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  onCopy?: () => void;
  isLastAssistant?: boolean;
  isTyping?: boolean;
  token?: string | null;
  sessionId?: string;
}

type Feedback = "up" | "down" | null;

const ChatMessage = ({ message, onRegenerate, onCopy, isLastAssistant, token, sessionId }: ChatMessageProps) => {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const formatProcessingTime = (seconds: number): string => {
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
    return `${seconds.toFixed(1)}s`;
  };

  const handleCopy = useCallback(() => {
    const text = message.displayedContent || message.content;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message, onCopy]);

  const handleFeedback = useCallback(async (type: "up" | "down") => {
    const newFeedback = feedback === type ? null : type;
    setFeedback(newFeedback);

    if (newFeedback && token) {
      try {
        await fetch("/api/aarka/rlhf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Use x-auth-token to bypass Vercel edge stripping Authorization header
            "x-auth-token": `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: "web_visitor",
            rating: newFeedback === "up" ? 1 : -1,
            conversation_id: sessionId || null,
          }),
        });
        setFeedbackSent(true);
        setTimeout(() => setFeedbackSent(false), 2000);
      } catch (err) {
        console.error("Failed to send feedback:", err);
      }
    }
  }, [feedback, token, sessionId]);

  const displayContent = message.displayedContent ?? message.content;

  return (
    <div
      className={`cmsg-row ${message.role}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className={`cmsg-avatar cmsg-avatar-${message.role}`}>
        {message.role === "assistant" ? (
          <span className="cmsg-avatar-letter">A</span>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="cmsg-content">
        <div className="cmsg-header">
          <span className="cmsg-role-label">
            {message.role === "assistant" ? "Aarka AI" : "You"}
          </span>
          <span className="cmsg-time" suppressHydrationWarning>
            {formatDate(message.timestamp)} · {formatTime(message.timestamp)}
          </span>
          {message.role === "assistant" && message.processingTime && !message.isStreaming && (
            <span className="cmsg-processing-time" title="Response generation time">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              {formatProcessingTime(message.processingTime)}
            </span>
          )}
        </div>

        <div className="cmsg-body">
          {message.role === "assistant" ? (
            <ChatMarkdown
              content={displayContent}
              isStreaming={message.isStreaming}
            />
          ) : (
            <p className="cmsg-user-text">{displayContent}</p>
          )}
        </div>

        {/* Action bar — visible on hover, only for assistant, not while streaming */}
        {!message.isStreaming && message.role === "assistant" && (
          <div className={`cmsg-actions ${showActions || feedback ? "visible" : ""}`}>
            {/* Copy */}
            <button
              className="cmsg-action-btn"
              onClick={handleCopy}
              title="Copy message"
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              )}
            </button>

            {/* Thumbs Up */}
            <button
              className={`cmsg-action-btn${feedback === "up" ? " cmsg-feedback-active" : ""}`}
              onClick={() => handleFeedback("up")}
              title="Good response"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={feedback === "up" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
              </svg>
            </button>

            {/* Thumbs Down */}
            <button
              className={`cmsg-action-btn${feedback === "down" ? " cmsg-feedback-active" : ""}`}
              onClick={() => handleFeedback("down")}
              title="Bad response"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={feedback === "down" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
                <path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" />
              </svg>
            </button>

            {/* Regenerate */}
            {isLastAssistant && onRegenerate && (
              <button
                className="cmsg-action-btn"
                onClick={onRegenerate}
                title="Regenerate response"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
              </button>
            )}

            {/* Feedback sent toast */}
            {feedbackSent && (
              <span className="cmsg-feedback-toast">Thanks!</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

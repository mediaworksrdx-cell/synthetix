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
}

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  onCopy?: () => void;
  isLastAssistant?: boolean;
  isTyping?: boolean;
}

const ChatMessage = ({ message, onRegenerate, onCopy, isLastAssistant }: ChatMessageProps) => {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopy = useCallback(() => {
    const text = message.displayedContent || message.content;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message, onCopy]);

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
          <span className="cmsg-time">
            {formatDate(message.timestamp)} · {formatTime(message.timestamp)}
          </span>
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

        {/* Action bar — visible on hover, only when not streaming */}
        {!message.isStreaming && message.role === "assistant" && (
          <div className={`cmsg-actions ${showActions ? "visible" : ""}`}>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

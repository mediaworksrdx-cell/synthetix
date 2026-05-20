"use client";

import { useRef, useEffect } from "react";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
}

const ChatInput = ({ value, onChange, onSend, onStop, isStreaming, disabled }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 180) + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isStreaming) return;
      onSend();
    }
    if (e.key === "Escape" && isStreaming) {
      onStop();
    }
  };

  const charCount = value.length;

  return (
    <div className="cinput-wrapper">
      <div className="cinput-bar">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Aarka anything…"
          rows={1}
          className="cinput-textarea"
          disabled={disabled && !isStreaming}
        />

        {isStreaming ? (
          <button
            className="cinput-stop-btn"
            onClick={onStop}
            title="Stop generating (Esc)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            className={`cinput-send-btn ${value.trim() ? "active" : ""}`}
            onClick={onSend}
            disabled={!value.trim() || disabled}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </div>

      <div className="cinput-footer">
        <p className="cinput-disclaimer">
          Aarka AI may produce inaccurate information. Verify critical outputs.
        </p>
        {charCount > 500 && (
          <span className="cinput-charcount">{charCount}</span>
        )}
      </div>
    </div>
  );
};

export default ChatInput;

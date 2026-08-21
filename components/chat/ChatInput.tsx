"use client";

import { useRef, useEffect, useState } from "react";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: (text?: string, files?: { name: string; path: string }[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

const MODELS = [
  { group: "Aarka AI", items: [
    { id: "aarkaa-2.0-high", label: "Aarka 2.0 (High)", tag: "Deep Reasoning", icon: "⚡" },
    { id: "aarkaa-2.0-medium", label: "Aarka 2.0 (Medium)", tag: "Balanced", icon: "⚡" },
    { id: "aarkaa-2.0-low", label: "Aarka 2.0 (Low)", tag: "Fast Response", icon: "⚡" },
  ]},
  { group: "Google Gemini", items: [
    { id: "gemini-3.5-flash-high", label: "Gemini 3.5 Flash (High)", tag: "Fast", icon: "✨" },
    { id: "gemini-3.5-flash-medium", label: "Gemini 3.5 Flash (Medium)", tag: "Fast", icon: "✨" },
    { id: "gemini-3.5-flash-low", label: "Gemini 3.5 Flash (Low)", tag: "Fast", icon: "✨" },
  ]},
  { group: "Anthropic Claude", items: [
    { id: "claude-sonnet-4.6", label: "Claude Sonnet 4.6", tag: "Thinking", icon: "🧠" },
    { id: "claude-opus-4.6", label: "Claude Opus 4.6", tag: "Thinking", icon: "🧠" },
  ]},
  { group: "OpenAI / OSS", items: [
    { id: "gpt-oss-120b", label: "GPT-OSS 120B", tag: "Medium", icon: "🤖" },
  ]},
];

function getModelLabel(id: string): string {
  for (const group of MODELS) {
    for (const m of group.items) {
      if (m.id === id) return `${m.icon} ${m.label}`;
    }
  }
  return "⚡ Aarka 2.0 (High)";
}

const ChatInput = ({ value, onChange, onSend, onStop, isStreaming, disabled, selectedModel = "aarkaa-7b", onModelChange }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  const [stagedFiles, setStagedFiles] = useState<{ name: string; path: string }[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  // Close menus on click outside
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (showAttachMenu) setShowAttachMenu(false);
      if (showModelMenu && modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener("click", clickOutside);
    return () => document.removeEventListener("click", clickOutside);
  }, [showAttachMenu, showModelMenu]);

  // Auto-resize textarea as user types (up to max-h-52)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 208)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && !disabled && (value.trim() || stagedFiles.length > 0)) {
        onSend(value, stagedFiles);
        setStagedFiles([]);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    }
    if (e.key === "Escape" && isStreaming) {
      onStop();
    }
  };

  const handleSend = () => {
    if (!value.trim() && stagedFiles.length === 0) return;
    onSend(value, stagedFiles);
    setStagedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const triggerFileInput = (accept: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
    setShowAttachMenu(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/aarka/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setStagedFiles((prev) => [
            ...prev,
            { name: data.filename || file.name, path: data.path || "" },
          ]);
        } else {
          console.error("File upload failed:", file.name);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      setShowAttachMenu(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleListening = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const windowObj = window as unknown as {
      SpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onstart: () => void;
        onerror: (ev: { error: string }) => void;
        onend: () => void;
        onresult: (ev: { resultIndex: number; results: Array<Array<{ transcript: string; isFinal?: boolean }>> }) => void;
        start: () => void;
        stop: () => void;
      };
      webkitSpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onstart: () => void;
        onerror: (ev: { error: string }) => void;
        onend: () => void;
        onresult: (ev: { resultIndex: number; results: Array<Array<{ transcript: string; isFinal?: boolean }>> }) => void;
        start: () => void;
        stop: () => void;
      };
    };

    const SpeechRecognitionClass = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => { setIsListening(true); };
    recognition.onerror = (event) => { console.error("Speech recognition error", event.error); setIsListening(false); };
    recognition.onend = () => { setIsListening(false); };
    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i][0] && event.results[i][0].transcript) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) onChange((value ? value + " " : "") + finalTranscript.trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const charCount = value.length;

  return (
    <div className="cinput-wrapper">
      {/* Staged files preview */}
      {stagedFiles.length > 0 && (
        <div className="cinput-staged-bar">
          {stagedFiles.map((file, idx) => (
            <div key={idx} className="cinput-staged-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#F59E0B" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="cinput-staged-name" title={file.name}>{file.name}</span>
              <button className="cinput-staged-remove" onClick={() => removeStagedFile(idx)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
          {isUploading && (
            <div className="cinput-staged-item" style={{ color: "#94a3b8" }}>
              <span>Uploading...</span>
            </div>
          )}
        </div>
      )}

      <div className="cinput-bar">
        {/* Left actions: Attach + Model Selector */}
        <div className="cinput-actions-left">

          {/* ── Model Selector Button ── */}
          <div style={{ position: "relative" }} ref={modelMenuRef}>
            <button
              className="cinput-model-btn"
              onClick={(e) => { e.stopPropagation(); setShowModelMenu(!showModelMenu); setShowAttachMenu(false); }}
              title="Select AI Model"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.35)",
                borderRadius: "20px",
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#d97706",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                marginRight: "4px"
              }}
            >
              <span>{getModelLabel(selectedModel)}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showModelMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 12px)",
                  left: 0,
                  width: "min(290px, calc(100vw - 32px))",
                  maxWidth: "calc(100vw - 32px)",
                  background: "rgba(255, 255, 255, 0.90)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  borderRadius: "16px",
                  padding: "10px 0",
                  boxShadow: "0 20px 50px rgba(15, 23, 42, 0.16), 0 0 20px rgba(245, 158, 11, 0.08)",
                  zIndex: 1000,
                  maxHeight: "360px",
                  overflowY: "auto"
                }}
              >
                {MODELS.map((group) => (
                  <div key={group.group}>
                    <div style={{ padding: "8px 16px 4px", fontSize: "10px", fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {group.group}
                    </div>
                    {group.items.map((model) => {
                      const isSelected = selectedModel === model.id;
                      return (
                        <button
                          key={model.id}
                          onClick={() => { if (onModelChange) onModelChange(model.id); setShowModelMenu(false); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            padding: "9px 16px",
                            background: isSelected ? "rgba(245, 158, 11, 0.18)" : "transparent",
                            border: "none",
                            color: isSelected ? "#b45309" : "#1e293b",
                            fontSize: "13px",
                            fontWeight: isSelected ? 700 : 500,
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.15s ease",
                            gap: "8px"
                          }}
                          onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "rgba(245, 158, 11, 0.08)"; }}
                          onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span>{model.icon}</span>
                            <span>{model.label}</span>
                          </span>
                          {model.tag && (
                            <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: isSelected ? "rgba(245, 158, 11, 0.25)" : "rgba(241, 245, 249, 0.8)", color: isSelected ? "#92400e" : "#475569", fontWeight: 600 }}>
                              {model.tag}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    <div style={{ height: "1px", background: "rgba(0, 0, 0, 0.06)", margin: "6px 0" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Attachment Button ── */}
          <button
            className={`cinput-attach-btn ${showAttachMenu ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowAttachMenu(!showAttachMenu);
              setShowModelMenu(false);
            }}
            title="Attach files"
            disabled={disabled}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          {showAttachMenu && (
            <div className="cinput-attach-menu" onClick={(e) => e.stopPropagation()}>
              <button className="cinput-attach-item" onClick={(e) => triggerFileInput("image/*", e)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Add Image</span>
              </button>
              <button className="cinput-attach-item" onClick={(e) => triggerFileInput("*", e)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                <span>Add Files</span>
              </button>
              <button className="cinput-attach-item" onClick={(e) => triggerFileInput(".pdf,.docx,.xlsx,.xls,.pptx,.txt,.csv,.json", e)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>Documents</span>
              </button>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          multiple
        />

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

        <div className="cinput-right-actions">
          {/* Mic Button */}
          {!isStreaming && (
            <button
              className={`cinput-mic-btn ${isListening ? "listening" : ""}`}
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Voice input"}
              disabled={disabled}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}

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
              className={`cinput-send-btn ${value.trim() || stagedFiles.length > 0 ? "active" : ""}`}
              onClick={handleSend}
              disabled={(!value.trim() && stagedFiles.length === 0) || disabled}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="cinput-footer">
        <p className="cinput-disclaimer">
          Aarka AI 2.0 may produce inaccurate information. Verify critical outputs.
        </p>
        {charCount > 500 && (
          <span className="cinput-charcount">{charCount}</span>
        )}
      </div>
    </div>
  );
};

export default ChatInput;

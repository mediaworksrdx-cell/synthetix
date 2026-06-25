"use client";

import { useRef, useEffect, useState } from "react";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: (text?: string, files?: { name: string; path: string }[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
}

const ChatInput = ({ value, onChange, onSend, onStop, isStreaming, disabled }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [stagedFiles, setStagedFiles] = useState<{ name: string; path: string }[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Close attach menu on click outside
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (showAttachMenu) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("click", clickOutside);
    return () => document.removeEventListener("click", clickOutside);
  }, [showAttachMenu]);

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
      handleSend();
    }
    if (e.key === "Escape" && isStreaming) {
      onStop();
    }
  };

  const handleSend = () => {
    if (!value.trim() && stagedFiles.length === 0) return;
    onSend(value, stagedFiles);
    setStagedFiles([]);
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
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const resp = await fetch("/api/aarka/upload", {
          method: "POST",
          body: formData,
        });
        if (resp.status === 200) {
          const data = await resp.json();
          setStagedFiles((prev) => [...prev, { name: data.filename, path: data.path }]);
        } else {
          console.error("Failed to upload file", file.name);
        }
      } catch (err) {
        console.error("Error uploading file", err);
      }
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onChange((value ? value + " " : "") + finalTranscript.trim());
      }
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
        {/* Attachment menu */}
        <div className="cinput-actions-left">
          <button
            className={`cinput-attach-btn ${showAttachMenu ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowAttachMenu(!showAttachMenu);
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

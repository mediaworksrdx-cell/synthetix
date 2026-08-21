"use client";

import React, { useState } from "react";

interface SkillTestPanelProps {
  skill: {
    name: string;
    is_core: boolean;
  };
}

export default function SkillTestPanel({ skill }: SkillTestPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [assertions, setAssertions] = useState<{ id: number; check: string; pass: boolean | null }[]>([]);
  const [newAssertionVal, setNewAssertionVal] = useState("");

  const handleAddAssertion = () => {
    if (!newAssertionVal.trim()) return;
    setAssertions((prev) => [
      ...prev,
      { id: Date.now(), check: newAssertionVal.trim(), pass: null }
    ]);
    setNewAssertionVal("");
  };

  const handleRemoveAssertion = (id: number) => {
    setAssertions((prev) => prev.filter((a) => a.id !== id));
  };

  const runTest = async () => {
    if (!prompt.trim()) return;
    setIsRunning(true);
    setTerminalOutput(`Initializing coordinator sandbox environment with skill '${skill.name}'...\n`);
    
    const token = localStorage.getItem("aarkaai_token") || "";

    try {
      const response = await fetch(`/api/aarka/skills/${skill.name}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`Execution error status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let done = false;
      let fullText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkStr = decoder.decode(value);
          const lines = chunkStr.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.substring(6));
                if (parsed.type === "status") {
                  setTerminalOutput((prev) => prev + `[STATUS] ${parsed.data}\n`);
                } else if (parsed.type === "final") {
                  fullText = parsed.data;
                  setTerminalOutput((prev) => prev + `\n[FINAL RESPONSE]\n${parsed.data}\n`);
                }
              } catch {
                // ignore parsing failures on partial streams
              }
            }
          }
        }
      }

      // Check Assertions
      setAssertions((prev) =>
        prev.map((a) => {
          const pass = fullText.toLowerCase().includes(a.check.toLowerCase());
          return { ...a, pass };
        })
      );
    } catch {
      setTerminalOutput((prev) => prev + `\n[ERROR] Network or execution failure.\n`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", height: "100%", overflowY: "auto" }}>
      <div>
        <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: "700" }}>Live Test Sandbox</h4>
        <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
          Run your active skill draft against live model inference to evaluate responses and verify custom rules.
        </p>
      </div>

      <div>
        <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>Test Query</label>
        <textarea
          style={{ width: "100%", height: "80px", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt that should activate this skill..."
        />
      </div>

      <button
        style={{
          background: isRunning ? "#94a3b8" : "#2563eb",
          color: "#fff",
          border: "none",
          padding: "10px 16px",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: isRunning ? "not-allowed" : "pointer"
        }}
        onClick={runTest}
        disabled={isRunning}
      >
        {isRunning ? "Executing Pipeline..." : "Run Validation Test"}
      </button>

      {/* Assertions Manager */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
        <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>Assertion Checks</label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <input
            style={{ flex: 1, padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
            value={newAssertionVal}
            onChange={(e) => setNewAssertionVal(e.target.value)}
            placeholder="Expected text in response..."
          />
          <button style={{ padding: "6px 12px", borderRadius: "6px", background: "#f1f5f9", border: "1px solid #cbd5e1", fontSize: "12px", cursor: "pointer" }} onClick={handleAddAssertion}>
            Add
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {assertions.length === 0 && <span style={{ fontSize: "12.5px", color: "#64748b" }}>No active assertions defined.</span>}
          {assertions.map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.03)", padding: "6px 10px", borderRadius: "6px" }}>
              <span style={{ fontSize: "13px" }}>Contains: &quot;{a.check}&quot;</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {a.pass !== null && (
                  <span style={{ color: a.pass ? "#10b981" : "#ef4444", fontWeight: "bold", fontSize: "12px" }}>
                    {a.pass ? "PASS" : "FAIL"}
                  </span>
                )}
                <button style={{ border: "none", background: "transparent", color: "#ef4444", cursor: "pointer" }} onClick={() => handleRemoveAssertion(a.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
      { id: Date.now(), check: newAssertionVal, pass: null }
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
              } catch (e) {
                // ignore parsing failures on partial streams
              }
            }
          }
        }
      }

      // Check Assertions
      setAssertions((prev) =>
        prev.map((a) => ({
          ...a,
          pass: fullText.toLowerCase().includes(a.check.toLowerCase())
        }))
      );

    } catch (err) {
      setTerminalOutput((prev) => prev + `\n[ERROR] Test run failed: ${(err as Error).message}\n`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="skill-test-panel">
      <h3>Skill Tester & Evaluator: {skill.name}</h3>

      <div className="skill-test-input-bar">
        <input
          type="text"
          className="skill-test-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a test prompt (e.g. Generate Q4 Chennai startups report)..."
          disabled={isRunning}
        />
        <button className="skill-test-btn" onClick={runTest} disabled={isRunning}>
          {isRunning ? "Running..." : "Execute"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginTop: "16px" }}>
        <div>
          <h4>Execution Output Sandbox Terminal</h4>
          <div className="skill-terminal">{terminalOutput || "Sandbox inactive. Run execute to stream steps."}</div>
        </div>

        <div>
          <h4>Evals & Assertions Checklist</h4>
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
            <input
              type="text"
              className="skill-test-input"
              value={newAssertionVal}
              onChange={(e) => setNewAssertionVal(e.target.value)}
              placeholder="e.g. startup, table..."
              style={{ padding: "6px 10px" }}
            />
            <button className="skill-test-btn" style={{ padding: "6px 12px" }} onClick={handleAddAssertion}>
              Add
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {assertions.length === 0 && <span style={{ fontSize: "12.5px", color: "#64748b" }}>No active assertions defined.</span>}
            {assertions.map((a) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.03)", padding: "6px 10px", borderRadius: "6px" }}>
                <span style={{ fontSize: "13px" }}>Contains: "{a.check}"</span>
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
    </div>
  );
}

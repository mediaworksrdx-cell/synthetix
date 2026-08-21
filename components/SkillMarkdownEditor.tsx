"use client";

import React, { useState } from "react";

interface SkillMarkdownEditorProps {
  skill: {
    name: string;
    description: string;
    is_core: boolean;
    content?: string;
  } | null;
  onSave: (name: string, content: string) => void;
  onClose: () => void;
  onDelete?: (name: string) => void;
}

const TEMPLATES = {
  document: `---
name: document-creator
description: Generates professional formatted business documents.
---
# Document Creator Skill
Guidelines:
1. Always outline the structure first.
2. Embed data points inside clean visual tables.
3. Keep headers visually distinct.
`,
  data: `---
name: data-analyzer
description: Process and calculate statistics from raw datasets.
---
# Data Analyzer Skill
Guidelines:
1. Parse CSV/JSON tables cleanly.
2. Execute computations using calculations tools.
3. Outline step-by-step math explanations.
`
};

export default function SkillMarkdownEditor({ skill, onSave, onClose, onDelete }: SkillMarkdownEditorProps) {
  const defaultContent = skill
    ? (skill.content || `---\nname: ${skill.name}\ndescription: ${skill.description}\n---\n# ${skill.name}`)
    : TEMPLATES.document;

  const [content, setContent] = useState(defaultContent);
  const [name, setName] = useState(skill ? skill.name : "");
  const [validationMsg, setValidationMsg] = useState("");
  const [prevSkill, setPrevSkill] = useState(skill);

  if (skill !== prevSkill) {
    setPrevSkill(skill);
    setName(skill ? skill.name : "");
    setContent(defaultContent);
    setValidationMsg("");
  }

  const handleValidate = () => {
    if (!content.startsWith("---")) {
      setValidationMsg("Error: Must start with frontmatter '---'");
      return;
    }
    const parts = content.split("---");
    if (parts.length < 3) {
      setValidationMsg("Error: Missing trailing frontmatter '---'");
      return;
    }
    setValidationMsg("✓ Content syntax is valid");
  };

  const handleSaveClick = () => {
    if (skill?.is_core) return;
    onSave(name || "new-skill", content);
  };

  return (
    <div className="skill-editor">
      <div className="skill-editor-pane">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <h3 style={{ margin: 0 }}>Editor {skill?.is_core && "(Read Only)"}</h3>
          {!skill && (
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="skill-nav-btn" onClick={() => setContent(TEMPLATES.document)}>Doc Template</button>
              <button className="skill-nav-btn" onClick={() => setContent(TEMPLATES.data)}>Data Template</button>
            </div>
          )}
        </div>

        <textarea
          className="skill-editor-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={skill?.is_core}
          placeholder="Enter skill instructions in Markdown format..."
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", color: validationMsg.startsWith("Error") ? "#ef4444" : "#10b981" }}>
            {validationMsg}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="skill-nav-btn" onClick={handleValidate}>Validate</button>
            {!skill?.is_core && (
              <button className="skill-test-btn" style={{ padding: "8px 16px" }} onClick={handleSaveClick}>
                Save Skill
              </button>
            )}
            {skill && !skill.is_core && onDelete && (
              <button className="skill-nav-btn" style={{ color: "#ef4444", borderColor: "#ef4444" }} onClick={() => onDelete(skill.name)}>
                Delete
              </button>
            )}
            <button className="skill-nav-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      <div className="skill-editor-pane">
        <h3 style={{ margin: 0 }}>Rendered Preview</h3>
        <div className="skill-preview" style={{ whiteSpace: "pre-wrap" }}>
          {content}
        </div>
      </div>
    </div>
  );
}

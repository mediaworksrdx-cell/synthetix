"use client";

import React, { useState, useEffect, useCallback } from "react";
import SkillCard from "./SkillCard";
import SkillMarkdownEditor from "./SkillMarkdownEditor";
import SkillTestPanel from "./SkillTestPanel";

interface Skill {
  name: string;
  description: string;
  is_core: boolean;
  content?: string;
}

interface SkillStudioProps {
  inline?: boolean;
  onClose?: () => void;
}

export default function SkillStudio({ inline, onClose }: SkillStudioProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [view, setView] = useState<"library" | "editor" | "tester">("library");
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [theme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aarkaai_theme") || "light";
    }
    return "light";
  });

  const fetchSkills = useCallback(async () => {
    const token = localStorage.getItem("aarkaai_token") || "";
    try {
      const res = await fetch("/api/aarka/skills", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch (e) {
      console.error("Failed fetching skills library:", e);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("aarkaai_token") || "";
    fetch("/api/aarka/skills", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) {
          setSkills(data);
        }
      })
      .catch((err) => {
        console.error("Failed fetching skills library:", err);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSaveSkill = async (name: string, content: string) => {
    const token = localStorage.getItem("aarkaai_token") || "";
    try {
      const isEdit = activeSkill && !activeSkill.is_core;
      const url = isEdit ? `/api/aarka/skills/${activeSkill.name}` : "/api/aarka/skills";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, content })
      });

      if (res.ok) {
        fetchSkills();
        setView("library");
        setActiveSkill(null);
      }
    } catch (e) {
      console.error("Failed saving custom skill:", e);
    }
  };

  const handleDeleteSkill = async (name: string) => {
    const token = localStorage.getItem("aarkaai_token") || "";
    try {
      const res = await fetch(`/api/aarka/skills/${name}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSkills();
        setView("library");
        setActiveSkill(null);
      }
    } catch (e) {
      console.error("Failed deleting custom skill:", e);
    }
  };

  const handleOpenSkill = async (skill: Skill) => {
    const token = localStorage.getItem("aarkaai_token") || "";
    try {
      const res = await fetch(`/api/aarka/skills/${skill.name}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const detail = await res.json();
        setActiveSkill({ ...skill, content: detail.content });
        setView("editor");
      }
    } catch (e) {
      setActiveSkill(skill);
      setView("editor");
    }
  };

  return (
    <div className={`skill-studio ${theme === "dark" ? "dark-theme" : ""}`} style={inline ? { height: "100%", maxHeight: "100%" } : {}}>
      <header className="skill-header" style={inline ? { padding: "10px 16px" } : {}}>
        <div className="skill-header-title" style={inline ? { fontSize: "16px" } : {}}>
          <span style={{ fontSize: "18px" }}>⚡</span>
          Skill Studio
        </div>
        <div className="skill-header-nav">
          <button className={`skill-nav-btn ${view === "library" ? "active" : ""}`} onClick={() => setView("library")} style={inline ? { padding: "4px 8px", fontSize: "12px" } : {}}>
            Library
          </button>
          {activeSkill && (
            <>
              <button className={`skill-nav-btn ${view === "editor" ? "active" : ""}`} onClick={() => setView("editor")} style={inline ? { padding: "4px 8px", fontSize: "12px" } : {}}>
                Editor
              </button>
              <button className={`skill-nav-btn ${view === "tester" ? "active" : ""}`} onClick={() => setView("tester")} style={inline ? { padding: "4px 8px", fontSize: "12px" } : {}}>
                Test
              </button>
            </>
          )}
          <button className="skill-nav-btn" onClick={onClose || (() => window.location.href = "/")} style={inline ? { padding: "4px 8px", fontSize: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" } : {}}>
            Close
          </button>
        </div>
      </header>

      <div className="skill-body">
        {view === "library" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", opacity: 0.7 }}>Browse, validate and test Aarkaa capabilities</span>
              <button className="skill-test-btn" onClick={() => { setActiveSkill(null); setView("editor"); }}>
                + Create Custom Skill
              </button>
            </div>
            <div className="skill-grid">
              {skills.map((s) => (
                <SkillCard key={s.name} skill={s} onClick={() => handleOpenSkill(s)} />
              ))}
            </div>
          </div>
        )}

        {view === "editor" && (
          <SkillMarkdownEditor
            skill={activeSkill}
            onSave={handleSaveSkill}
            onClose={() => setView("library")}
            onDelete={handleDeleteSkill}
          />
        )}

        {view === "tester" && activeSkill && (
          <SkillTestPanel skill={activeSkill} />
        )}
      </div>
    </div>
  );
}

import React from "react";

interface SkillCardProps {
  skill: {
    name: string;
    description: string;
    is_core: boolean;
  };
  onClick: () => void;
}

export default function SkillCard({ skill, onClick }: SkillCardProps) {
  return (
    <div className="skill-card" onClick={onClick}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="skill-card-title">{skill.name}</h3>
        <span className={`skill-badge ${skill.is_core ? "core" : "user"}`}>
          {skill.is_core ? "Core" : "Custom"}
        </span>
      </div>
      <p className="skill-card-desc">{skill.description}</p>
      <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", gap: "6px", marginTop: "auto" }}>
        <span>Read-only: {skill.is_core ? "Yes" : "No"}</span>
      </div>
    </div>
  );
}

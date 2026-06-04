"use client";

import { ReactNode } from "react";

interface ChatWelcomeProps {
  children?: ReactNode;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const ChatWelcome = ({ children }: ChatWelcomeProps) => {
  return (
    <div className="cwelcome">
      {/* Animated logo */}
      <div className="cwelcome-logo-wrap">
        <div className="cwelcome-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
        </div>
        <div className="cwelcome-orbit" />
        <div className="cwelcome-orbit cwelcome-orbit-2" />
      </div>

      <h2 className="cwelcome-title">{getGreeting()}</h2>
      <p className="cwelcome-sub">
        I&apos;m Aarka AI — your enterprise intelligence assistant. Ask me anything about coding, finance, logic, or general knowledge.
      </p>

      {/* Centered input container */}
      <div className="cwelcome-input-container">
        {children}
      </div>

      <p className="cwelcome-powered">Powered by Aarka Intelligence Engine</p>
    </div>
  );
};

export default ChatWelcome;

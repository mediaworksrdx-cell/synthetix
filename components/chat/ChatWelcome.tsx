"use client";

interface Suggestion {
  icon: string;
  label: string;
  category: string;
}

interface ChatWelcomeProps {
  onSendMessage: (text: string) => void;
}

const SUGGESTIONS: Suggestion[] = [
  {
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    label: "Write a Python function to find two numbers that sum to a target",
    category: "Coding",
  },
  {
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    label: "What's the current stock price of Reliance Industries?",
    category: "Finance",
  },
  {
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    label: "A stock falls 75%. What percentage gain is needed to recover?",
    category: "Reasoning",
  },
  {
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    label: "Explain the difference between TCP and UDP",
    category: "Knowledge",
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const ChatWelcome = ({ onSendMessage }: ChatWelcomeProps) => {
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
        I&apos;m Aarka AI — I can write code, analyze stocks, solve logic puzzles, and answer questions across science, math, and technology.
      </p>

      {/* Suggestion cards */}
      <div className="cwelcome-grid">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            className="cwelcome-card"
            onClick={() => onSendMessage(s.label)}
          >
            <div className="cwelcome-card-top">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cwelcome-card-icon">
                <path d={s.icon} />
              </svg>
              <span className="cwelcome-card-category">{s.category}</span>
            </div>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <p className="cwelcome-powered">Powered by Aarka Intelligence Engine</p>
    </div>
  );
};

export default ChatWelcome;

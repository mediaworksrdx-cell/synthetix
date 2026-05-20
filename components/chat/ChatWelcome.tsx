"use client";

interface Suggestion {
  icon: string;
  label: string;
}

interface ChatWelcomeProps {
  onSendMessage: (text: string) => void;
}

const SUGGESTIONS: Suggestion[] = [
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    label: "Explain Aarka AI capabilities",
  },
  {
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    label: "How does enterprise AI integration work?",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m8 0V9a2 2 0 012-2h2a2 2 0 012 2v10m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4",
    label: "Show me analytics dashboard options",
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    label: "What security features are built-in?",
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
        I&apos;m Aarka AI — your enterprise intelligence assistant. Ask me about AI integration, analytics, security, or anything else.
      </p>

      {/* Suggestion cards */}
      <div className="cwelcome-grid">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            className="cwelcome-card"
            onClick={() => onSendMessage(s.label)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cwelcome-card-icon">
              <path d={s.icon} />
            </svg>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <p className="cwelcome-powered">Powered by Aarka Intelligence Engine</p>
    </div>
  );
};

export default ChatWelcome;

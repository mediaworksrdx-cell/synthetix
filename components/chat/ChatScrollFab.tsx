"use client";

interface ChatScrollFabProps {
  visible: boolean;
  onClick: () => void;
}

const ChatScrollFab = ({ visible, onClick }: ChatScrollFabProps) => {
  return (
    <button
      className={`cscroll-fab ${visible ? "visible" : ""}`}
      onClick={onClick}
      title="Scroll to bottom"
      aria-label="Scroll to bottom"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
};

export default ChatScrollFab;

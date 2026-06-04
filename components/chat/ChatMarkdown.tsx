"use client";

import { useState, useCallback } from "react";
import { Highlight, themes } from "prism-react-renderer";
import katex from "katex";
import "katex/dist/katex.min.css";

interface ChatMarkdownProps {
  content: string;
  isStreaming?: boolean;
}

const ChatMarkdown = ({ content, isStreaming }: ChatMarkdownProps) => {
  const [copiedBlock, setCopiedBlock] = useState<number | null>(null);

  const copyCode = useCallback((code: string, index: number) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedBlock(index);
      setTimeout(() => setCopiedBlock(null), 2000);
    });
  }, []);

  const renderContent = () => {
    // Split by code blocks first
    // Handle \r\n and any trailing whitespace after the language identifier
    const codeBlockRegex = /```([a-zA-Z0-9_+-]*)[^\n]*\n([\s\S]*?)```/g;
    const parts: { type: "text" | "code"; content: string; lang?: string }[] = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: "code", content: match[2], lang: match[1] || "text" });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push({ type: "text", content: content.slice(lastIndex) });
    }

    return parts.map((part, i) => {
      if (part.type === "code") {
        const idx = blockIndex++;
        const code = part.content.trimEnd();
        const lang = part.lang || "text";
        return (
          <div key={i} className="cmark-codeblock">
            <div className="cmark-codeblock-header">
              <span className="cmark-codeblock-lang">{lang}</span>
              <button
                className="cmark-copy-btn"
                onClick={() => copyCode(code, idx)}
              >
                {copiedBlock === idx ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <Highlight
              theme={themes.nightOwl}
              code={code}
              language={lang}
            >
              {({ style, tokens, getLineProps, getTokenProps }) => (
                <pre className="cmark-pre" style={{ ...style, background: "transparent", margin: 0 }}>
                  {tokens.map((line, lineIdx) => (
                    <div key={lineIdx} {...getLineProps({ line })}>
                      {line.map((token, tokenIdx) => (
                        <span key={tokenIdx} {...getTokenProps({ token })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          </div>
        );
      }

      return <span key={i}>{renderInlineMarkdown(part.content)}</span>;
    });
  };

  /**
   * Merge consecutive paragraphs that are each a single ordered-list item
   * (e.g. "1. Foo", "2. Bar") into one combined paragraph so the ordered
   * list renderer can produce a single <ol> with correct numbering.
   */
  const mergeParagraphs = (paragraphs: string[]): string[] => {
    const merged: string[] = [];
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      const lines = trimmed.split("\n");
      const isSingleOl =
        lines.length === 1 && /^\s*\d+[.)]\s/.test(lines[0]);
      // Also handle multi-line list items where continuation lines are indented
      const isMultiLineOlItem =
        lines.length > 1 &&
        /^\s*\d+[.)]\s/.test(lines[0]) &&
        lines.slice(1).every((l) => /^\s{2,}/.test(l) || l.trim() === "");
      if (
        (isSingleOl || isMultiLineOlItem) &&
        merged.length > 0
      ) {
        const prevTrimmed = merged[merged.length - 1].trim();
        const prevLines = prevTrimmed.split("\n");
        const prevIsOl = prevLines.every(
          (l) => /^\s*\d+[.)]\s/.test(l) || /^\s{2,}/.test(l) || l.trim() === ""
        ) && /^\s*\d+[.)]\s/.test(prevLines[0]);
        if (prevIsOl) {
          merged[merged.length - 1] = prevTrimmed + "\n" + trimmed;
          continue;
        }
      }
      merged.push(trimmed);
    }
    return merged;
  };

  const renderInlineMarkdown = (text: string) => {
    // Split into paragraphs, then merge consecutive ordered-list items
    const rawParagraphs = text.split(/\n\n+/);
    const paragraphs = mergeParagraphs(rawParagraphs);

    return paragraphs.map((para, pIdx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // Check for blockquote
      if (trimmed.startsWith("> ")) {
        const quoteContent = trimmed
          .split("\n")
          .map((l) => l.replace(/^>\s?/, ""))
          .join("\n");
        return (
          <blockquote key={pIdx} className="cmark-blockquote">
            {renderInline(quoteContent)}
          </blockquote>
        );
      }

      // Check for unordered list
      const ulLines = trimmed.split("\n");
      if (ulLines.every((l) => /^\s*[-*]\s/.test(l) || l.trim() === "")) {
        return (
          <ul key={pIdx} className="cmark-ul">
            {ulLines
              .filter((l) => l.trim())
              .map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\s*[-*]\s/, ""))}</li>
              ))}
          </ul>
        );
      }

      // Check for ordered list
      if (ulLines.every((l) => /^\s*\d+[.)]\s/.test(l) || l.trim() === "")) {
        return (
          <ol key={pIdx} className="cmark-ol">
            {ulLines
              .filter((l) => l.trim())
              .map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\s*\d+[.)]\s/, ""))}</li>
              ))}
          </ol>
        );
      }

      // Check for heading
      const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const Tag = `h${level + 2}` as "h3" | "h4" | "h5";
        return <Tag key={pIdx} className="cmark-heading">{renderInline(headingMatch[2])}</Tag>;
      }

      // Regular paragraph — handle single newlines as <br/>
      const lines = trimmed.split("\n");
      return (
        <p key={pIdx} className="cmark-p">
          {lines.map((line, li) => (
            <span key={li}>
              {li > 0 && <br />}
              {renderInline(line)}
            </span>
          ))}
        </p>
      );
    });
  };

  const renderInline = (text: string): React.ReactNode[] => {
    // Process inline markdown: bold, italic, inline code, links, block/inline LaTeX math
    const tokens: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|\[(.+?)\]\((.+?)\)|(\\?\$\$[\s\S]*?\$\$)|(\\?\$[^$]+?\$)|(\\\[[\s\S]*?\\\])|(\\?\([\s\S]*?\\\))/g;
    let lastIdx = 0;
    let m;

    while ((m = regex.exec(text)) !== null) {
      if (m.index > lastIdx) {
        tokens.push(text.slice(lastIdx, m.index));
      }

      if (m[1]) {
        // Bold
        tokens.push(<strong key={m.index}>{m[2]}</strong>);
      } else if (m[3]) {
        // Italic
        tokens.push(<em key={m.index}>{m[4]}</em>);
      } else if (m[5]) {
        // Inline code
        tokens.push(<code key={m.index} className="cmark-inline-code">{m[6]}</code>);
      } else if (m[7]) {
        // Link
        tokens.push(
          <a key={m.index} href={m[8]} target="_blank" rel="noopener noreferrer" className="cmark-link">
            {m[7]}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", marginLeft: 2, verticalAlign: "middle" }}>
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        );
      } else if (m[9]) {
        // Block LaTeX math $$ ... $$ or \[ ... \]
        const mathContent = m[9].replace(/^\$\$|\$\$$/g, "").replace(/^\\\[|\\\]$/g, "").trim();
        try {
          const html = katex.renderToString(mathContent, { displayMode: true, throwOnError: false });
          tokens.push(
            <span
              key={m.index}
              className="cmark-block-math"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (err) {
          console.error("KaTeX block render error:", err);
          tokens.push(<span key={m.index} style={{ color: "#ef4444" }}>{m[9]}</span>);
        }
      } else if (m[10]) {
        // Inline LaTeX math $ ... $ or \( ... \)
        const mathContent = m[10].replace(/^\$|\$$/g, "").replace(/^\\\(|\\\)$/g, "").trim();
        try {
          const html = katex.renderToString(mathContent, { displayMode: false, throwOnError: false });
          tokens.push(
            <span
              key={m.index}
              className="cmark-inline-math"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (err) {
          console.error("KaTeX inline render error:", err);
          tokens.push(<span key={m.index} style={{ color: "#ef4444" }}>{m[10]}</span>);
        }
      } else if (m[11]) {
        // Block LaTeX \[ ... \]
        const mathContent = m[11].replace(/^\\\[|\\\]$/g, "").trim();
        try {
          const html = katex.renderToString(mathContent, { displayMode: true, throwOnError: false });
          tokens.push(
            <span key={m.index} className="cmark-block-math" dangerouslySetInnerHTML={{ __html: html }} />
          );
        } catch (err) {
          console.error("KaTeX block render error:", err);
          tokens.push(<span key={m.index} style={{ color: "#ef4444" }}>{m[11]}</span>);
        }
      } else if (m[12]) {
        // Inline LaTeX \( ... \)
        const mathContent = m[12].replace(/^\\\(|\\\)$/g, "").trim();
        try {
          const html = katex.renderToString(mathContent, { displayMode: false, throwOnError: false });
          tokens.push(
            <span key={m.index} className="cmark-inline-math" dangerouslySetInnerHTML={{ __html: html }} />
          );
        } catch (err) {
          console.error("KaTeX inline render error:", err);
          tokens.push(<span key={m.index} style={{ color: "#ef4444" }}>{m[12]}</span>);
        }
      }

      lastIdx = m.index + m[0].length;
    }

    if (lastIdx < text.length) {
      tokens.push(text.slice(lastIdx));
    }

    return tokens;
  };

  return (
    <div className="cmark-root">
      {renderContent()}
      {isStreaming && <span className="cmark-cursor" />}
    </div>
  );
};

export default ChatMarkdown;

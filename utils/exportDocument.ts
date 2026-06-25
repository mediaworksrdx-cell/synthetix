/**
 * Premium HTML-based document export utility for Aarka AI chat messages.
 * Converts markdown content to beautifully styled PDF and DOCX documents
 * entirely client-side using HTML rendering — no heavy dependencies needed.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Inline Markdown → HTML ─────────────────────────────────────────────────

function processInline(text: string): string {
  // First escape HTML in the raw text
  let result = escapeHtml(text);

  // Images ![alt](url) - must run before links to prevent !<a href="...">...</a>
  result = result.replace(
    /!\[([^\]]+)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="export-inline-img" style="max-width:100%; height:auto; display:block; margin:16px auto; border-radius:6px;" />'
  );

  // Inline code `...`
  result = result.replace(/`([^`]+)`/g, '<code class="export-inline-code">$1</code>');

  // Bold **...**
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic *...*
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links [text](url)
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" style="color:#d97706; text-decoration:underline;">$1</a>'
  );

  // Inline math $...$
  result = result.replace(/\$([^$]+)\$/g, '<span class="export-math-inline">$1</span>');

  return result;
}

// ─── Table Processing ───────────────────────────────────────────────────────

function processTable(lines: string[]): string {
  const parseRow = (row: string) =>
    row.split("|").map((c) => c.trim()).filter(Boolean);

  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).filter((l) => l.includes("|")).map(parseRow);

  let html = '<table class="export-table"><thead><tr>';
  headers.forEach((h) => { html += `<th>${processInline(h)}</th>`; });
  html += "</tr></thead><tbody>";
  rows.forEach((row) => {
    html += "<tr>";
    row.forEach((cell) => { html += `<td>${processInline(cell)}</td>`; });
    html += "</tr>";
  });
  html += "</tbody></table>";
  return html;
}

// ─── Markdown → HTML Converter ──────────────────────────────────────────────

function markdownToHTML(md: string): string {
  // Normalize line endings
  let text = md.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Extract code blocks first, replace with placeholders
  const codeBlocks: string[] = [];
  text = text.replace(/```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const langLabel = lang || "code";
    const escapedCode = escapeHtml(code.trimEnd());
    const html = `<div class="export-codeblock"><div class="export-codeblock-header">${langLabel}</div><pre><code>${escapedCode}</code></pre></div>`;
    codeBlocks.push(html);
    return `\n\n__CODEBLOCK_${codeBlocks.length - 1}__\n\n`;
  });

  // Extract block math $$...$$
  const mathBlocks: string[] = [];
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_m, math) => {
    const html = `<div class="export-math-block">${escapeHtml(math.trim())}</div>`;
    mathBlocks.push(html);
    return `\n\n__MATHBLOCK_${mathBlocks.length - 1}__\n\n`;
  });

  // Split into paragraphs by double newlines
  const paragraphs = text.split(/\n\n+/);
  const outputParts: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Restore code block placeholders
    const codeMatch = trimmed.match(/^__CODEBLOCK_(\d+)__$/);
    if (codeMatch) {
      outputParts.push(codeBlocks[parseInt(codeMatch[1])]);
      continue;
    }

    // Restore math block placeholders
    const mathMatch = trimmed.match(/^__MATHBLOCK_(\d+)__$/);
    if (mathMatch) {
      outputParts.push(mathBlocks[parseInt(mathMatch[1])]);
      continue;
    }

    // Headings
    const h1Match = trimmed.match(/^# (.+)$/);
    if (h1Match) { outputParts.push(`<h1>${processInline(h1Match[1])}</h1>`); continue; }
    const h2Match = trimmed.match(/^## (.+)$/);
    if (h2Match) { outputParts.push(`<h2>${processInline(h2Match[1])}</h2>`); continue; }
    const h3Match = trimmed.match(/^### (.+)$/);
    if (h3Match) { outputParts.push(`<h3>${processInline(h3Match[1])}</h3>`); continue; }
    const h4Match = trimmed.match(/^#### (.+)$/);
    if (h4Match) { outputParts.push(`<h4>${processInline(h4Match[1])}</h4>`); continue; }

    // Blockquote (> ...)
    if (trimmed.startsWith("> ") || trimmed === ">") {
      const content = trimmed.split("\n")
        .map((l) => l.replace(/^>\s?/, ""))
        .map((l) => processInline(l))
        .join("<br/>");
      outputParts.push(`<blockquote>${content}</blockquote>`);
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      outputParts.push("<hr/>");
      continue;
    }

    const lines = trimmed.split("\n");

    // Unordered list
    if (lines.length > 0 && lines.every((l) => /^\s*[-*+]\s/.test(l) || !l.trim())) {
      const items = lines
        .filter((l) => l.trim())
        .map((l) => `<li>${processInline(l.replace(/^\s*[-*+]\s/, ""))}</li>`)
        .join("\n");
      outputParts.push(`<ul>${items}</ul>`);
      continue;
    }

    // Ordered list
    if (lines.length > 0 && lines.every((l) => /^\s*\d+[.)]\s/.test(l) || !l.trim())) {
      const items = lines
        .filter((l) => l.trim())
        .map((l) => `<li>${processInline(l.replace(/^\s*\d+[.)]\s/, ""))}</li>`)
        .join("\n");
      outputParts.push(`<ol>${items}</ol>`);
      continue;
    }

    // Table (line with |, followed by separator line)
    if (lines.length >= 2 && lines[0].includes("|") && /^\|?[\s\-:|]+\|?$/.test(lines[1])) {
      outputParts.push(processTable(lines));
      continue;
    }

    // Regular paragraph — handle single newlines as <br/>
    const content = lines.map((l) => processInline(l)).join("<br/>");
    outputParts.push(`<p>${content}</p>`);
  }

  return outputParts.join("\n");
}

// ─── Premium CSS ────────────────────────────────────────────────────────────

const PREMIUM_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11pt;
    line-height: 1.7;
    color: #1e293b;
    background: #ffffff;
    padding: 0;
  }

  .export-container {
    max-width: 700px;
    margin: 0 auto;
    padding: 48px 40px;
  }

  .export-header {
    margin-bottom: 36px;
    padding-bottom: 24px;
    border-bottom: 2px solid #f59e0b;
    position: relative;
  }
  .export-header::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 80px;
    height: 2px;
    background: linear-gradient(90deg, #d97706, #f59e0b);
  }
  .export-header-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .export-brand-icon {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 14px;
  }
  .export-brand-name {
    font-size: 16px;
    font-weight: 600;
    color: #d97706;
    letter-spacing: -0.3px;
  }
  .export-header-meta {
    font-size: 9pt;
    color: #94a3b8;
    letter-spacing: 0.02em;
  }

  .export-content h1 {
    font-size: 20pt;
    font-weight: 700;
    color: #0f172a;
    margin: 28px 0 14px;
    letter-spacing: -0.5px;
    line-height: 1.3;
  }
  .export-content h2 {
    font-size: 15pt;
    font-weight: 600;
    color: #1e293b;
    margin: 24px 0 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #f1f5f9;
    letter-spacing: -0.3px;
  }
  .export-content h3 {
    font-size: 12pt;
    font-weight: 600;
    color: #334155;
    margin: 18px 0 8px;
  }
  .export-content h4 {
    font-size: 11pt;
    font-weight: 600;
    color: #475569;
    margin: 14px 0 6px;
  }
  .export-content p {
    margin: 0 0 12px;
    text-align: justify;
    hyphens: auto;
  }
  .export-content strong {
    font-weight: 600;
    color: #0f172a;
  }
  .export-content em {
    font-style: italic;
    color: #475569;
  }
  .export-content hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 20px 0;
  }
  .export-content ul, .export-content ol {
    margin: 0 0 14px 0;
    padding-left: 24px;
  }
  .export-content ul li, .export-content ol li {
    margin: 4px 0;
    padding-left: 4px;
  }
  .export-content ul li { list-style-type: disc; }
  .export-content ul li::marker { color: #f59e0b; }
  .export-content ol li::marker { color: #d97706; font-weight: 600; }

  .export-content blockquote {
    border-left: 3px solid #f59e0b;
    background: #fffbeb;
    padding: 12px 16px;
    margin: 12px 0;
    border-radius: 0 6px 6px 0;
    font-style: italic;
    color: #92400e;
  }

  .export-codeblock {
    margin: 14px 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }
  .export-codeblock-header {
    background: #1e293b;
    color: #94a3b8;
    font-size: 8pt;
    font-family: 'JetBrains Mono', monospace;
    padding: 6px 14px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .export-codeblock pre {
    background: #0f172a;
    padding: 14px 16px;
    overflow-x: auto;
    margin: 0;
  }
  .export-codeblock code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 9pt;
    line-height: 1.6;
    color: #e2e8f0;
    white-space: pre;
  }
  .export-inline-code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9pt;
    background: #f1f5f9;
    color: #d97706;
    padding: 1px 5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }

  .export-table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 10pt;
  }
  .export-table th {
    background: #fef3c7;
    color: #92400e;
    font-weight: 600;
    padding: 8px 12px;
    text-align: left;
    border-bottom: 2px solid #f59e0b;
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .export-table td {
    padding: 8px 12px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }
  .export-table tr:nth-child(even) td { background: #fefce8; }

  .export-math-block {
    text-align: center;
    margin: 14px 0;
    padding: 12px;
    background: #f8fafc;
    border-radius: 6px;
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
  }
  .export-math-inline {
    font-family: 'Times New Roman', serif;
    font-style: italic;
  }

  .export-footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8pt;
    color: #94a3b8;
  }

  @media print {
    body { padding: 0; }
    .export-container { max-width: none; padding: 20px; }
    .export-codeblock { page-break-inside: avoid; }
    .export-table { page-break-inside: avoid; }
  }
`;

// ─── Extract HTML Document Helper ───────────────────────────────────────────

function extractHTMLContent(markdownContent: string): string | null {
  const trimmed = markdownContent.trim();
  
  // Check for ```html ... ``` block
  const htmlBlockRegex = /```html\s*\n([\s\S]*?)```/i;
  const htmlMatch = markdownContent.match(htmlBlockRegex);
  if (htmlMatch) {
    return htmlMatch[1].trim();
  }

  // Check if it's raw HTML
  if (trimmed.toLowerCase().startsWith("<!doctype html") || trimmed.toLowerCase().startsWith("<html")) {
    return trimmed;
  }
  
  // Also check if it has <html>...</html> tags inside it
  if (trimmed.toLowerCase().includes("<html") && trimmed.toLowerCase().includes("</html>")) {
    const htmlStart = trimmed.toLowerCase().indexOf("<html");
    const htmlEnd = trimmed.toLowerCase().lastIndexOf("</html>") + 7;
    return trimmed.substring(htmlStart, htmlEnd);
  }

  return null;
}

// ─── Build Full HTML Document ───────────────────────────────────────────────

function buildHTMLDocument(markdownContent: string, title?: string): string {
  const htmlBody = markdownToHTML(markdownContent);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const titleMatch = markdownContent.match(/^#{1,3}\s+(.+)$/m);
  const docTitle = title || (titleMatch ? titleMatch[1] : "Aarka AI Export");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(docTitle)}</title>
  <style>${PREMIUM_STYLES}</style>
</head>
<body>
  <div class="export-container">
    <div class="export-header">
      <div class="export-header-brand">
        <div class="export-brand-icon">A</div>
        <span class="export-brand-name">Aarka AI</span>
      </div>
      <div class="export-header-meta">
        Generated on ${dateStr} at ${timeStr}
      </div>
    </div>
    <div class="export-content">
      ${htmlBody}
    </div>
    <div class="export-footer">
      <div class="export-footer-brand">
        <div class="export-footer-icon">A</div>
        <span>Generated by Aarka AI</span>
      </div>
      <span>${dateStr}</span>
    </div>
  </div>
</body>
</html>`;
}

// ─── Export: PDF ─────────────────────────────────────────────────────────────

export function exportAsPDF(markdownContent: string, title?: string): void {
  // Check if the markdown content contains a rendered HTML document (e.g. from skills)
  const extractedHTML = extractHTMLContent(markdownContent);
  const htmlDoc = extractedHTML || buildHTMLDocument(markdownContent, title);

  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) {
    alert("Please allow popups to export PDF.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlDoc);
  printWindow.document.close();

  // Use setTimeout after document.close() — onload is unreliable with document.write
  setTimeout(() => {
    try { printWindow.print(); } catch (_e) { /* user may close window */ }
  }, 800);
}

// ─── Export: DOCX (HTML-based .doc) ─────────────────────────────────────────

export function exportAsDOCX(markdownContent: string, title?: string): void {
  const extractedHTML = extractHTMLContent(markdownContent);
  let wordHTML = "";

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const titleMatch = markdownContent.match(/^#{1,3}\s+(.+)$/m);
  const docTitle = title || (titleMatch ? titleMatch[1] : "Aarka AI Export");

  if (extractedHTML) {
    wordHTML = extractedHTML;
  } else {
    const htmlBody = markdownToHTML(markdownContent);
    wordHTML = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(docTitle)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page { size: A4; margin: 2.5cm; }
    body {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1e293b;
    }
    h1 { font-size: 20pt; font-weight: bold; color: #0f172a; margin: 24pt 0 10pt; }
    h2 { font-size: 15pt; font-weight: bold; color: #1e293b; margin: 18pt 0 8pt; padding-bottom: 4pt; border-bottom: 1pt solid #e2e8f0; }
    h3 { font-size: 12pt; font-weight: bold; color: #334155; margin: 14pt 0 6pt; }
    h4 { font-size: 11pt; font-weight: bold; color: #475569; margin: 10pt 0 4pt; }
    p { margin: 0 0 8pt; text-align: justify; }
    strong { font-weight: bold; color: #0f172a; }
    em { font-style: italic; }
    ul, ol { margin: 0 0 10pt 0; padding-left: 18pt; }
    li { margin: 3pt 0; }
    hr { border: none; border-top: 1pt solid #e2e8f0; margin: 14pt 0; }
    blockquote {
      border-left: 3pt solid #f59e0b;
      background: #fffbeb;
      padding: 8pt 12pt;
      margin: 10pt 0;
      font-style: italic;
      color: #92400e;
    }
    .export-codeblock { margin: 10pt 0; border: 1pt solid #e2e8f0; }
    .export-codeblock-header {
      background: #1e293b;
      color: #94a3b8;
      font-size: 8pt;
      font-family: Consolas, monospace;
      padding: 4pt 10pt;
    }
    .export-codeblock pre { background: #0f172a; padding: 10pt 12pt; margin: 0; }
    .export-codeblock code {
      font-family: Consolas, 'Courier New', monospace;
      font-size: 9pt;
      color: #e2e8f0;
      white-space: pre;
    }
    .export-inline-code {
      font-family: Consolas, monospace;
      font-size: 9pt;
      background: #f1f5f9;
      color: #d97706;
      padding: 1pt 4pt;
      border: 1pt solid #e2e8f0;
    }
    .export-table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 10pt; }
    .export-table th {
      background: #fef3c7;
      color: #92400e;
      font-weight: bold;
      padding: 6pt 10pt;
      text-align: left;
      border-bottom: 2pt solid #f59e0b;
    }
    .export-table td { padding: 6pt 10pt; border-bottom: 1pt solid #f1f5f9; }
    .export-header { margin-bottom: 24pt; padding-bottom: 14pt; border-bottom: 2pt solid #f59e0b; }
    .export-brand-name { font-size: 14pt; font-weight: bold; color: #d97706; }
    .export-header-meta { font-size: 9pt; color: #94a3b8; margin-top: 4pt; }
    .export-footer { margin-top: 30pt; padding-top: 10pt; border-top: 1pt solid #e2e8f0; font-size: 8pt; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="export-header">
    <div class="export-brand-name">Aarka AI</div>
    <div class="export-header-meta">Generated on ${dateStr} at ${timeStr}</div>
  </div>
  ${htmlBody}
  <div class="export-footer">
    Generated by Aarka AI &mdash; ${dateStr}
  </div>
</body>
</html>`;
  }

  const blob = new Blob(["\ufeff", wordHTML], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeTitle = docTitle.replace(/[^a-zA-Z0-9\s-]/g, "").trim().replace(/\s+/g, "_");
  a.download = `${safeTitle || "Aarka_Export"}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

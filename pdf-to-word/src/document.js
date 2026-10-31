export function parsePages(input, total) {
  if (!input.trim()) return Array.from({ length: total }, (_, i) => i + 1);
  const normalized = input.replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632)).replace(/،/g, ',');
  const pages = new Set();
  for (const token of normalized.split(',')) {
    const match = token.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error('range');
    const start = Number(match[1]), end = Number(match[2] ?? match[1]);
    if (start < 1 || end > total || start > end) throw new Error('range');
    for (let n = start; n <= end; n++) pages.add(n);
  }
  return [...pages].sort((a, b) => a - b);
}

export function textLines(items) {
  const lines = [];
  let current = [], y;
  const flush = () => { if (current.length) lines.push(current.map(x => x.str).join(' ').replace(/ +/g, ' ').trim()); current = []; };
  for (const item of items) {
    if (typeof item.str !== 'string') continue;
    const nextY = item.transform?.[5];
    if (current.length && Number.isFinite(y) && Number.isFinite(nextY) && Math.abs(nextY - y) > Math.max(3, (item.height || 10) * 0.5)) flush();
    current.push(item); y = nextY;
    if (item.hasEOL) flush();
  }
  flush();
  return lines.filter(Boolean);
}

export const isRTL = text => /[\u0590-\u08ff]/.test(text);

export async function makeWord(pages) {
  const { Document, Paragraph, TextRun, Packer, AlignmentType } = await import('docx');
  const children = pages.flatMap((page, i) => (page.lines.length ? page.lines : ['']).map((line, j) => new Paragraph({
    bidirectional: isRTL(line), alignment: isRTL(line) ? AlignmentType.RIGHT : AlignmentType.LEFT,
    pageBreakBefore: i > 0 && j === 0,
    spacing: { after: 100 },
    children: [new TextRun({ text: line, rightToLeft: isRTL(line), font: 'Arial', size: 24 })],
  })));
  return Packer.toBlob(new Document({ sections: [{ children }] }));
}

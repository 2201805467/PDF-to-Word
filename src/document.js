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
  const flush = () => { if (current.length) lines.push(readLine(current)); current = []; };
  for (const item of items) {
    if (typeof item.str !== 'string') continue;
    const nextY = item.transform?.[5];
    if (current.length && Number.isFinite(y) && Number.isFinite(nextY) && Math.abs(nextY - y) > Math.max(3, (item.height || 10) * 0.5)) flush();
    if (item.str) current.push({ ...item, str: normalizeArabic(item.str) });
    y = nextY;
    if (item.hasEOL) flush();
  }
  flush();
  return lines.filter(Boolean);
}

// Presentation forms encode the *shape* of Arabic glyphs, not editable letters.
// Normalize these only; preserve unrelated compatibility characters in the PDF.
export const normalizeArabic = text => text.replace(/[\uFB50-\uFDFF\uFE70-\uFEFF]+/g, value => value.normalize('NFKC'));
export const isRTL = text => [...text].some(c => /[\p{Script=Arabic}\p{Script=Hebrew}]/u.test(c) && /\p{L}/u.test(c));
const strongLTR = text => !isRTL(text) && /[\p{L}\p{N}]/u.test(text);

function joinItems(items, rtl) {
  let text = '';
  for (let i = 0; i < items.length; i++) {
    const item = items[i], previous = items[i - 1];
    if (previous && !/\s$/.test(text) && !/^\s/.test(item.str)) {
      const located = [previous.width, item.width, previous.transform?.[4], item.transform?.[4]].every(Number.isFinite);
      const gap = rtl ? previous.transform[4] - item.transform[4] - item.width : item.transform?.[4] - previous.transform?.[4] - previous.width;
      const threshold = Math.max(1, Math.max(previous.height || 10, item.height || 10) * 0.15);
      if (!located || gap > threshold) text += ' ';
    }
    text += item.str;
  }
  return text.replace(/ +/g, ' ').trim();
}

function readLine(items) {
  // PDF content streams may paint individual Arabic letters from left to right.
  // Their coordinates determine reading order; strings within each item are
  // already in logical order, so never reverse their characters.
  if (!items.every(item => Number.isFinite(item.transform?.[4]) && Number.isFinite(item.width))) return joinItems(items, false);
  const physical = [...items].sort((a, b) => a.transform[4] - b.transform[4]);
  if (!items.some(item => isRTL(item.str))) return joinItems(physical, false);
  const groups = [];
  for (let i = 0; i < physical.length;) {
    if (!strongLTR(physical[i].str)) { groups.push(physical[i++]); continue; }
    const start = i;
    let end = i++;
    while (i < physical.length && !isRTL(physical[i].str)) {
      if (strongLTR(physical[i].str)) end = i;
      i++;
    }
    const run = physical.slice(start, end + 1);
    const left = run[0].transform[4];
    const right = Math.max(...run.map(item => item.transform[4] + item.width));
    groups.push({ ...run[0], str: joinItems(run, false), width: right - left });
    i = end + 1;
  }
  return joinItems(groups.reverse(), true);
}

export function directionalRuns(text) {
  const rtl = isRTL(text);
  const graphemes = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map(item => item.segment);
  const directions = graphemes.map(char => isRTL(char) ? true : /[\p{L}\p{N}]/u.test(char) ? false : null);
  // Neutral punctuation belongs to the surrounding run when both sides agree;
  // otherwise it follows the paragraph. Dates and English phrases remain LTR.
  for (let i = 0; i < directions.length;) {
    if (directions[i] !== null) { i++; continue; }
    const start = i, left = directions[i - 1];
    while (i < directions.length && directions[i] === null) i++;
    const right = directions[i];
    const direction = left !== undefined && left === right ? left : rtl;
    directions.fill(direction, start, i);
  }
  const runs = [];
  graphemes.forEach((char, i) => {
    if (runs.at(-1)?.rtl === directions[i]) runs.at(-1).text += char;
    else runs.push({ text: char, rtl: directions[i] });
  });
  return runs;
}

export async function makeWord(pages) {
  const { Document, Paragraph, TextRun, Packer, AlignmentType } = await import('docx');
  const children = pages.flatMap((page, i) => (page.lines.length ? page.lines : ['']).map((line, j) => new Paragraph({
    bidirectional: isRTL(line), alignment: isRTL(line) ? AlignmentType.RIGHT : AlignmentType.LEFT,
    pageBreakBefore: i > 0 && j === 0,
    spacing: { after: 100 },
    children: directionalRuns(line).map(run => new TextRun({
      text: run.text, rightToLeft: run.rtl,
      font: { ascii: 'Arial', hAnsi: 'Arial', cs: 'Arial' },
      size: 24, sizeComplexScript: 24,
      language: { value: run.rtl ? 'ar-SA' : 'en-US', bidirectional: 'ar-SA' },
    })),
  })));
  return Packer.toBlob(new Document({ sections: [{ children }] }));
}

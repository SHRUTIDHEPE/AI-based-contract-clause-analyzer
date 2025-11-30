// server/utils/clauseSplitter.js
function normalizeText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/\t+/g, ' ')
    .replace(/\n[ \t]*/g, '\n')
    .trim();
}

function splitByParagraphs(text) {
  return text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
}

function splitByNumberedHeadings(para) {
  return para.split(/(?=\n?\s*\d+[\.\)]\s+)/).map(p => p.trim()).filter(Boolean);
}

function sentenceSplit(paragraph) {
  const sentences = paragraph.match(/[^\.!\?]+[\.!\?]+/g) || [paragraph];
  return sentences.map(s => s.trim()).filter(Boolean);
}

function mergeShortFragments(fragments, minWords = 6) {
  const out = [];
  let buffer = '';
  for (const f of fragments) {
    const words = f.split(/\s+/).filter(Boolean).length;
    if (!buffer) {
      buffer = f;
    } else if (words < minWords) {
      buffer = buffer + ' ' + f;
    } else {
      out.push(buffer);
      buffer = f;
    }
  }
  if (buffer) out.push(buffer);
  return out;
}

function splitIntoClauses(text) {
  const norm = normalizeText(text);
  const paras = splitByParagraphs(norm);
  let clauses = [];

  for (const p of paras) {
    const parts = splitByNumberedHeadings(p);
    for (const part of parts) {
      if (part.split(/\s+/).length > 300) {
        const sents = sentenceSplit(part);
        const merged = mergeShortFragments(sents, 8);
        clauses.push(...merged);
      } else {
        clauses.push(part);
      }
    }
  }

  clauses = clauses.map(c => c.replace(/\s+/g, ' ').trim())
                   .filter(c => {
                     const words = c.split(/\s+/).filter(Boolean).length;
                     return words >= 3 && words <= 1200;
                   });

  return clauses;
}

module.exports = { splitIntoClauses };

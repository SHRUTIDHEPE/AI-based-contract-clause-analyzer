/**
 * FINAL — Highly Accurate Contract Clause Splitter
 * Handles:
 *  - Markdown headings: ### 1. Title
 *  - Numbered sections: 1., 2., 3.
 *  - HR separators: ---
 *  - Long clause fallback splitting
 */

function normalizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/\t+/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .trim();
}

/**
 * Split at reliable major boundaries:
 *   - "---"
 *   - headings like "### 1. Title"
 *   - top-level "1." etc.
 */
function hardSplit(text) {
  return text
    .split(
      /(?=^---$)|(?=^###\s*\d+)|(?=^\d+\.)/gm
    )
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Fallback splitting for extremely long blocks
 */
function sentenceSplit(text) {
  const s = text.match(/[^.!?]+[.!?]+/g) || [text];
  return s.map(t => t.trim()).filter(Boolean);
}

/**
 * Merge short fragments into meaningful clauses
 */
function mergeShort(fragments, minWords = 20) {
  const out = [];
  let buf = "";

  for (const f of fragments) {
    const wc = f.split(/\s+/).length;

    if (!buf) {
      buf = f;
    } else if (wc < minWords) {
      buf += " " + f;
    } else {
      out.push(buf);
      buf = f;
    }
  }
  if (buf) out.push(buf);
  return out;
}

/**
 * MAIN CLAUSE SPLITTER
 */
export function splitIntoClauses(text) {
  const norm = normalizeText(text);

  // 1) Hard split by headings + rules + numbering
  let blocks = hardSplit(norm);

  // 2) Deep clean-up
  let clauses = [];

  for (let block of blocks) {
    const wc = block.split(/\s+/).length;

    if (wc > 250) {
      // break long blocks into smaller clauses
      const sents = sentenceSplit(block);
      const merged = mergeShort(sents, 25);
      clauses.push(...merged);
    } else {
      clauses.push(block);
    }
  }

  // 3) Final filtering
  // return clauses
  //   .map(c => c.replace(/\s+/g, " ").trim())
  //   .filter(c => c.length > 15);

  return clauses
  .map(c =>
    c
      .replace(/^---+/g, "")
      .replace(/^###\s*/g, "")
      .trim()
  )
  .filter(c => c.length > 10);

}

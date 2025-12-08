# this code is not used in the final version

"""
pdf_clause_predictor.py

Utilities to:
 - extract text from a PDF
 - split the text into clause-like blocks
 - chunk long blocks to model-safe windows using the tokenizer from predictor.py
 - run predict_clause() on chunks and aggregate results into clause-level predictions
 - save predictions to a JSON file

Usage:
    from pdf_clause_predictor import process_pdf
    results = process_pdf(Path("uploads/uploaded.pdf"), Path("uploads/out.json"))
"""

from predictor import predict_clause, tokenizer
from pathlib import Path
from typing import List, Dict, Optional
import json
import re
import os
import sys

# Import predictor functions
here = os.path.dirname(os.path.realpath(__file__))
if here not in sys.path:
    sys.path.insert(0, here)

# External libs
try:
    import pdfplumber
except Exception as e:
    raise ImportError(
        "pdfplumber is required. Install with `pip install pdfplumber`") from e

# ---------- PDF extraction ----------


def extract_text_from_pdf(pdf_path: Path) -> str:
    """
    Extract text from a PDF using pdfplumber and perform cleaning to improve
    clause-splitting. The function:
      - Extracts page text and joins pages with two newlines
      - Fixes hyphenation broken across lines ("deliv-\nery" -> "delivery")
      - Joins single newlines that are likely soft line-wraps into spaces
      - Inserts paragraph breaks (two newlines) when a line ends a sentence
        and the next line starts with a capital letter (common paragraph start)
      - Normalizes repeated newlines to at most two

    Returns:
        full_text (str): cleaned text suitable for downstream splitting.
    """
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    pages: List[str] = []
    try:
        with pdfplumber.open(str(pdf_path)) as pdf:
            for page in pdf.pages:
                try:
                    page_text = page.extract_text()
                except Exception:
                    page_text = None
                # Ensure we always append something (empty string if None) to preserve page breaks
                if page_text:
                    # Normalize CRLF to LF and strip
                    page_text = page_text.replace("\r\n", "\n").strip()
                    pages.append(page_text)
                else:
                    # append empty string to preserve page structure
                    pages.append("")
    except Exception as e:
        # Re-raise with helpful message
        raise RuntimeError(f"Failed to open/extract PDF '{pdf_path}': {e}")

    # Join pages using two newlines (page boundary)
    full_text = "\n\n".join(pages)

    # === Preprocessing fixes ===
    # 1) Fix hyphenation at line ends: "deliv-\nery" -> "delivery"
    full_text = re.sub(r"-\n\s*", "", full_text)

    # 2) Replace single newlines that are likely soft line wraps with a space.
    #    We only convert single newlines (not paragraphs with two+ newlines).
    #    Heuristic: if line break is followed by lowercase letter, digit, or opening bracket,
    #    it's probably a continuation of the same sentence/line.
    full_text = re.sub(r"(?<!\n)\n(?=[a-z0-9\(\[\-\"'`])", " ", full_text)

    # 3) Insert paragraph break when a line ends with sentence-ending punctuation
    #    and the next line starts with a capital letter or digit (likely a new paragraph/clause).
    #    Example: "agreement.\nAt the Effective Date" -> "agreement.\n\nAt the Effective Date"
    full_text = re.sub(r"([\.!\?\"'])\n(?=[A-Z0-9])", r"\1\n\n", full_text)

    # 4) Normalize multiple (>2) newlines down to exactly two (consistent paragraph break)
    full_text = re.sub(r"\n{3,}", "\n\n", full_text)

    # Final strip
    full_text = full_text.strip()

    return full_text


# ---------- Clause splitting heuristics ----------
def split_into_clauses(full_text: str, min_len: int = 20) -> List[str]:
    """
    Split extracted text into clause-like blocks using heuristics.
    - Paragraphs separated by 2+ newlines.
    - Numbered subclauses like "1.", "1.1", "(a)", "a)".
    - All-caps headings detection.
    Returns list of cleaned blocks.
    """
    if not full_text:
        return []

    # Normalize newlines and trim leading spaces
    text = re.sub(r"\r\n?", "\n", full_text)
    text = re.sub(r"\n[ \t]+", "\n", text)

    # Split into paragraphs first
    paragraphs = re.split(r"\n{2,}", text)

    candidate_blocks: List[str] = []
    for p in paragraphs:
        if not p:
            continue
        # Further split paragraphs that contain numbered subclauses or lines starting with numbering
        # Use non-capturing groups so re.split doesn't insert group captures (which can be None)
        subparts = re.split(
            r"(?=\n?\s*(?:\d+(?:\.\d+)*|\([a-z0-9]+\)|[a-z0-9]+\))\s+)", p)
        for s in subparts:
            if not s:
                # skip None or empty strings returned by re.split
                continue
            s_clean = s.strip()
            if len(s_clean) >= min_len:
                candidate_blocks.append(s_clean)

    # If some blocks are extremely long, split at sentence-like boundaries
    refined: List[str] = []
    for b in candidate_blocks:
        if len(b) > 2000:
            # Naive sentence split: break on punctuation followed by whitespace/newline
            parts = re.split(r"(?<=[\.\;\:\?])\s+", b)
            cur = ""
            for part in parts:
                if len(cur) + len(part) < 1200:
                    cur = (cur + " " + part).strip()
                else:
                    if len(cur) >= min_len:
                        refined.append(cur.strip())
                    cur = part
            if len(cur) >= min_len:
                refined.append(cur.strip())
        else:
            refined.append(b)

    # Deduplicate and preserve order
    seen = set()
    cleaned: List[str] = []
    for r in refined:
        rr = r.strip()
        if rr and rr not in seen:
            cleaned.append(rr)
            seen.add(rr)
    return cleaned


# ---------- Chunking long clauses into model-safe windows ----------

def chunk_text_for_model(text: str, tokenizer, max_len: int = 256, stride: int = 64) -> List[str]:
    """
    Split text into overlapping chunks according to tokenizer token lengths.
    Returns a list of text chunks suitable for passing to the model (to avoid silent truncation).

    - tokenizer: the tokenizer object imported from predictor.py
    - max_len: number of tokens per chunk (should match your model's encoding in predict_clause)
    - stride: overlap between chunks (tokens) to avoid missing boundaries
    """
    # Tokenize without adding special tokens to measure tokens
    enc = tokenizer(text, add_special_tokens=False, return_tensors="pt")
    ids = enc["input_ids"][0].tolist()
    total = len(ids)
    if total <= max_len:
        return [text.strip()]

    chunks: List[str] = []
    start = 0
    while start < total:
        end = min(start + max_len, total)
        slice_ids = ids[start:end]
        # Decode back to text chunk
        chunk_text = tokenizer.decode(
            slice_ids, skip_special_tokens=True, clean_up_tokenization_spaces=True)
        chunks.append(chunk_text.strip())
        if end == total:
            break
        start = max(0, end - stride)

    # Remove near-duplicate consecutive chunks
    final_chunks: List[str] = []
    last = None
    for c in chunks:
        if c != last:
            final_chunks.append(c)
            last = c
    return final_chunks


# ---------- Aggregation logic ----------

def aggregate_chunk_predictions(chunk_preds: List[Dict]) -> Dict:
    """
    Given a list of chunk predictions (each a dict with keys: clause_type, confidence, risk_score),
    aggregate into a single clause-level prediction.

    Conservative approach used here:
      - Choose the chunk with the highest risk_score.
      - If tie on risk_score, choose the one with lower confidence (more uncertainty).
    """
    if not chunk_preds:
        return {"clause_type": "Unknown", "confidence": 0.0, "risk_score": 0.0}

    best = chunk_preds[0]
    for p in chunk_preds[1:]:
        if p["risk_score"] > best["risk_score"]:
            best = p
        elif p["risk_score"] == best["risk_score"] and p["confidence"] < best["confidence"]:
            best = p
    return best


# ---------- Main processing function ----------

def process_pdf(pdf_path: Path, out_json: Optional[Path] = None, max_chunk_tokens: int = 256, stride: int = 64) -> List[Dict]:
    """
    Extract clauses from pdf_path, run predictions, save results to out_json (if provided), and return list of results.

    Each result is a dict:
      {
        "text": <clause_text>,
        "clause_type": <predicted type>,
        "confidence": <confidence float>,
        "risk_score": <risk float>,
        "num_chunks": <int>
      }
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"{pdf_path} does not exist")

    full_text = extract_text_from_pdf(pdf_path)
    clauses = split_into_clauses(full_text)

    results: List[Dict] = []
    for clause in clauses:
        chunks = chunk_text_for_model(
            clause, tokenizer, max_len=max_chunk_tokens, stride=stride)

        chunk_preds: List[Dict] = []
        for chunk in chunks:
            try:
                pred = predict_clause(chunk)
            except Exception as e:
                # If a chunk fails, log minimal info and continue with a safe fallback
                pred = {"clause_type": "Unknown",
                        "risk_score": 0.0, "confidence": 0.0}
            chunk_preds.append(pred)

        best = aggregate_chunk_predictions(chunk_preds)

        record = {
            "text": clause,
            "clause_type": best.get("clause_type", "Unknown"),
            "confidence": round(float(best.get("confidence", 0.0)), 4),
            "risk_score": round(float(best.get("risk_score", 0.0)), 4),
            "num_chunks": len(chunks),
        }
        results.append(record)

    # Save results if path provided
    if out_json is not None:
        out_json = Path(out_json)
        out_json.parent.mkdir(parents=True, exist_ok=True)
        with out_json.open("w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

    return results


# ---------- If run as script for quick testing ----------
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Extract clauses from PDF and predict clause types + risk.")
    parser.add_argument("pdf", type=Path, help="Path to input PDF")
    parser.add_argument(
        "--out", type=Path, default=Path("predictions.json"), help="Output JSON file")
    args = parser.parse_args()

    print(f"Extracting and predicting for: {args.pdf}")
    res = process_pdf(args.pdf, args.out)
    print(f"Processed {len(res)} clauses. Saved to {args.out}")

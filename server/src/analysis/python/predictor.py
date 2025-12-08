import json
from pathlib import Path
import torch
import traceback
import sys
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# -----------------------
# Paths (adjusted to project layout)
# -----------------------
DATA_DIR = Path(__file__).parent
MODEL_DIR = Path(__file__).parent / "deberta_clause_type"

# -----------------------
# Load label maps (normalize keys to int)
# -----------------------
id2label_path = DATA_DIR / "id2label.json"
if id2label_path.exists():
    with open(id2label_path, "r", encoding="utf-8") as f:
        raw_id2label = json.load(f)

    # Normalize to int keys for robust lookup
    id2label = {}
    for k, v in raw_id2label.items():
        try:
            id2label[int(k)] = v
        except Exception:
            # fallback: keep original key if not int-like
            id2label[k] = v
else:
    id2label = {}

label2id_path = DATA_DIR / "label2id.json"
if label2id_path.exists():
    with open(label2id_path, "r", encoding="utf-8") as f:
        label2id = json.load(f)
else:
    label2id = {}

# -----------------------
# Load tokenizer and model
# -----------------------
tokenizer = AutoTokenizer.from_pretrained(
    "microsoft/deberta-v3-small", use_fast=False)

# Try to load model from pickle file first, then fallback to directory
model = None
model_pkl_path = DATA_DIR / "model.pkl"
if model_pkl_path.exists():
    try:
        import pickle
        with open(model_pkl_path, 'rb') as f:
            loaded_obj = pickle.load(f)

        # Check if it's a dictionary containing the model
        if isinstance(loaded_obj, dict):
            print(
                f"[predictor] Loaded dict from pickle file: {model_pkl_path}", file=sys.stderr)
            print(
                f"[predictor] Dict keys: {list(loaded_obj.keys())}", file=sys.stderr)

            # Check for HuggingFace model first
            if 'model' in loaded_obj and hasattr(loaded_obj['model'], 'eval'):
                model = loaded_obj['model']
                print(
                    f"[predictor] Found HuggingFace model in dict key: 'model'", file=sys.stderr)
            else:
                # Try to find sklearn model
                possible_keys = ['model', 'classifier', 'estimator', 'clf']
                for key in possible_keys:
                    if key in loaded_obj and hasattr(loaded_obj[key], 'predict_proba'):
                        model = loaded_obj[key]
                        print(
                            f"[predictor] Found sklearn model in dict key: {key}", file=sys.stderr)
                        break
                else:
                    # If no standard key found, try the first value that looks like a model
                    for key, value in loaded_obj.items():
                        if hasattr(value, 'predict_proba') or hasattr(value, 'eval'):
                            model = value
                            print(
                                f"[predictor] Found model in dict key: {key} (type: {type(value)})", file=sys.stderr)
                            break
                    else:
                        print(
                            f"[predictor] No model found in dict keys: {list(loaded_obj.keys())}", file=sys.stderr)
        else:
            # Direct model object
            model = loaded_obj
            print(
                f"[predictor] Loaded direct model from pickle file: {model_pkl_path}", file=sys.stderr)
            print(f"[predictor] Model type: {type(model)}", file=sys.stderr)

        if model and hasattr(model, 'predict_proba'):
            print(f"[predictor] Model has predict_proba method", file=sys.stderr)
        elif model and hasattr(model, '__call__'):
            print(f"[predictor] Model is callable", file=sys.stderr)

    except Exception as e:
        print(
            f"[predictor] Failed to load model from pickle: {e}", file=sys.stderr)
        model = None
elif MODEL_DIR.exists():
    try:
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
        print(
            f"[predictor] Loaded model from directory: {MODEL_DIR}", file=sys.stderr)
    except Exception as e:
        print(
            f"[predictor] Failed to load model from directory: {e}", file=sys.stderr)
        model = None
else:
    print(
        f"[predictor] No model found in {model_pkl_path} or {MODEL_DIR}", file=sys.stderr)

if model:
    # Check if it's a HuggingFace model or sklearn model
    if hasattr(model, 'eval'):
        model.eval()
        # Move model to CPU or GPU if available
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        print(
            f"[predictor] HuggingFace model loaded on device: {device}", file=sys.stderr)
    else:
        print(
            f"[predictor] Non-HuggingFace model loaded: {type(model)}", file=sys.stderr)
else:
    print("[predictor] WARNING: No model loaded - predictions will return Unknown", file=sys.stderr)

# -----------------------
# Risk scoring helpers (copy your existing logic here)
# -----------------------
HIGH_RISK_TYPES = {
    "Uncapped Liability",
    "Indemnification",
    "Non_Compete",
    "Termination",
    "Ip Ownership Assignment",
    "Unlimited/All-You-Can-Eat-License",
    "Change Of Control",
}

MEDIUM_RISK_TYPES = {
    "Cap On Liability",
    "Confidentiality",
    "Payment Terms",
    "Governing Law",
    "Warranty Duration",
    "Exclusivity",
    "License Grant",
    "Irrevocable Or Perpetual License",
}

LOW_RISK_TYPES = {
    "Headings",
    "WHEREAS",
    "NOW",
    "Document Name",
    "Parties",
    "Definitions",
    "Entire",
    "Miscellaneous",
    "Counterparts",
}

RISKY_KEYWORDS = [
    r"\bunlimited\b",
    r"\buncapped\b",
    r"\bperpetual\b",
    r"\birrevocable\b",
    r"\bsole discretion\b",
    r"\bwaive\b",
    r"\bwaiver\b",
    r"\bindemnif(y|ies|ication)\b",
    r"\bno liability\b",
    r"\bhold harmless\b",
]


def base_risk_from_clause_type(clause_type: str) -> float:
    if clause_type in HIGH_RISK_TYPES:
        return 0.8
    if clause_type in MEDIUM_RISK_TYPES:
        return 0.55
    if clause_type in LOW_RISK_TYPES:
        return 0.25
    return 0.4


def keyword_risk_from_text(text: str) -> float:
    text_l = (text or "").lower()
    hits = 0
    for pattern in RISKY_KEYWORDS:
        if __import__("re").search(pattern, text_l):
            hits += 1
    return min(0.6, 0.15 * hits)


def calculate_risk(clause_type: str, text: str, confidence: float) -> float:
    base = base_risk_from_clause_type(clause_type)
    kw_risk = keyword_risk_from_text(text)
    uncertainty = 1.0 - confidence
    risk = 0.6 * base + 0.25 * kw_risk + 0.15 * uncertainty
    return round(max(0.0, min(1.0, risk)), 4)

# -----------------------
# Robust predict_clause
# -----------------------


def _safe_map_label(pred_id: int) -> str:
    # try integer key first, fallback to string key
    if isinstance(pred_id, int) and pred_id in id2label:
        return id2label[pred_id]
    if str(pred_id) in id2label:
        return id2label[str(pred_id)]
    # last fallback: try label2id reverse lookup (rare)
    for lbl, idx in label2id.items():
        try:
            if int(idx) == int(pred_id):
                return lbl
        except Exception:
            continue
    return "Unknown"


def predict_clause(text: str) -> dict:
    """
    Defensive prediction wrapper.
    Returns dict: {"clause_type", "risk_score", "confidence"}.
    Never raises; logs errors to stderr.
    """
    if not model:
        return {"clause_type": "Unknown", "risk_score": 0.0, "confidence": 0.0}

    try:
        if not text or not text.strip():
            return {"clause_type": "Unknown", "risk_score": 0.0, "confidence": 0.0}

        # Check if model is HuggingFace or sklearn
        if hasattr(model, 'eval'):  # HuggingFace model
            inputs = tokenizer(
                text,
                truncation=True,
                padding="max_length",
                max_length=256,
                return_tensors="pt",
            )

            # Move inputs to device
            inputs = {k: v.to(device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = model(**inputs)

            logits = getattr(outputs, "logits", None)
            if logits is None:
                print("[predict_clause] WARNING: logits is None", file=sys.stderr)
                return {"clause_type": "Unknown", "risk_score": 0.0, "confidence": 0.0}

            probs = torch.softmax(logits, dim=1)
            confidence_tensor, pred_label_id_tensor = torch.max(probs, dim=1)
            confidence_val = float(confidence_tensor.cpu().item())
            pred_id = int(pred_label_id_tensor.cpu().item())

        elif hasattr(model, 'predict_proba'):  # sklearn model
            # For sklearn models, we need to tokenize and convert to features
            # This is a simplified approach - may need adjustment based on actual model
            inputs = tokenizer(
                text,
                truncation=True,
                padding="max_length",
                max_length=256,
                return_tensors="pt",
            )

            # Convert to numpy for sklearn
            import numpy as np
            input_ids = inputs['input_ids'].cpu().numpy().flatten()
            attention_mask = inputs['attention_mask'].cpu().numpy().flatten()

            # Simple feature extraction - may need to match training features
            features = np.concatenate([input_ids, attention_mask])

            # Get predictions
            probs = model.predict_proba([features])[0]
            pred_id = int(np.argmax(probs))
            confidence_val = float(np.max(probs))

        else:  # Unknown model type
            print(
                f"[predict_clause] Unknown model type: {type(model)}", file=sys.stderr)
            return {"clause_type": "Unknown", "risk_score": 0.0, "confidence": 0.0}

        clause_type = _safe_map_label(pred_id)
        risk_score = calculate_risk(clause_type, text, confidence_val)

        return {
            "clause_type": clause_type,
            "risk_score": round(float(risk_score), 4),
            "confidence": round(float(confidence_val), 4),
        }

    except Exception as e:
        print("[predict_clause] Exception:", e, file=sys.stderr)
        traceback.print_exc()
        return {"clause_type": "Unknown", "risk_score": 0.0, "confidence": 0.0}


# Optional: simple test when run directly
if __name__ == "__main__":
    sample = "The supplier shall indemnify the Company for any and all claims."
    print(predict_clause(sample))

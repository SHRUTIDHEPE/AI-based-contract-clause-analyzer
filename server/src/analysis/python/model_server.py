# server/src/analysis/python/model_server.py
import joblib
import torch
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from pathlib import Path

MODEL_PATH = Path(__file__).parent / "model.pkl"

print("🔄 Loading clause classifier model...")

try:
    package = joblib.load(MODEL_PATH)
    model = package["model"]
    tokenizer = package["tokenizer"]
    print("✅ Model loaded successfully.")
    MODEL_READY = True
except Exception as e:
    print("❌ Failed to load model:", e)
    print("🔄 Using mock predictions for development...")
    MODEL_READY = False

app = FastAPI(title="Clause Classification API")


class PredictRequest(BaseModel):
    text: str


class PredictBatchRequest(BaseModel):
    texts: List[str]


def predict_clause_texts(texts: List[str]):
    if MODEL_READY:
        encodings = tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=256,
            return_tensors="pt",
        )

        with torch.no_grad():
            outputs = model(**encodings)
            logits = outputs.logits

        probs = logits.softmax(dim=1).tolist()
        preds = logits.argmax(dim=1).tolist()
    else:
        # Mock predictions for development
        import random
        preds = []
        probs = []
        for _ in texts:
            # Random label from 0-99 (matching the LABEL_MAPPING)
            pred = random.randint(0, 99)
            # Random probabilities that sum to 1
            prob = [random.random() for _ in range(100)]
            total = sum(prob)
            prob = [p/total for p in prob]
            preds.append(pred)
            probs.append(prob)

    return preds, probs


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": MODEL_READY}


@app.post("/predict")
def predict(req: PredictRequest):
    preds, probs = predict_clause_texts([req.text])
    return {"label": int(preds[0]), "probabilities": probs[0]}


@app.post("/predict-batch")
def predict_batch(req: PredictBatchRequest):
    preds, probs = predict_clause_texts(req.texts)
    results = [
        {"label": int(p), "probabilities": prob}
        for p, prob in zip(preds, probs)
    ]
    return {"results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

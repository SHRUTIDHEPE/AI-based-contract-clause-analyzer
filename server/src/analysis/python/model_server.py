from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from pathlib import Path
import shutil
import uuid
import uvicorn
import traceback

# IMPORT THE PREDICTOR AND PDF PROCESSING FUNCTIONS
try:
    from predictor import predict_clause
    from pdf_clause_predictor import process_pdf
except Exception as e:
    # helpful error message if import fails
    print("Failed to import predictor functions")
    traceback.print_exc()
    raise

app = FastAPI(title="Clause Predictor API")

# Allow local dev from the frontend (change in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


class PredictBatchRequest(BaseModel):
    texts: List[str]


@app.post("/predict-batch")
async def predict_batch(request: PredictBatchRequest):
    """Predict clause types for a batch of text clauses."""
    try:
        results = []
        for text in request.texts:
            if not text or not text.strip():
                results.append({
                    "clause_type": "Unknown",
                    "confidence": 0.0,
                    "risk_score": 0.0
                })
                continue

            prediction = predict_clause(text)
            results.append({
                "clause_type": prediction["clause_type"],
                "confidence": prediction["confidence"],
                "risk_score": prediction["risk_score"]
            })

        return {"results": results}

    except Exception as e:
        tb = traceback.format_exc()
        raise HTTPException(
            status_code=500, detail=f"Batch prediction failed: {e}\n\n{tb}")


@app.post("/predict")
async def predict_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400, detail="Only PDF files are accepted.")

    # Save uploaded file
    file_id = uuid.uuid4().hex
    dest = UPLOAD_DIR / f"{file_id}.pdf"
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    out_json = UPLOAD_DIR / f"{file_id}_predictions.json"
    try:
        results = process_pdf(dest, out_json)
    except Exception as e:
        # return a helpful error for dev; in production log and return generic message
        tb = traceback.format_exc()
        raise HTTPException(
            status_code=500, detail=f"Processing failed: {e}\n\n{tb}")

    return {"status": "ok", "file_id": file_id, "predictions": results}

if __name__ == "__main__":
    # Run directly for development
    uvicorn.run("model_server:app", host="0.0.0.0", port=8000, reload=True)

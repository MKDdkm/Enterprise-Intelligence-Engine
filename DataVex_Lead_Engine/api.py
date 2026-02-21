from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import traceback

from main import run

app = FastAPI(
    title="DataVex Lead Intelligence API",
    version="1.0.0"
)

# ==============================
# Updated Request Model
# ==============================

class AnalysisRequest(BaseModel):
    domain: str
    service_catalog: str


# ==============================
# Health Check
# ==============================

@app.get("/")
def root():
    return {
        "status": "running",
        "message": "DataVex Lead Engine API is active"
    }


# ==============================
# Main Endpoint
# ==============================

@app.post("/run-analysis")
def run_analysis(request: AnalysisRequest):

    try:
        result = run(request.domain, request.service_catalog)

        if result is None:
            raise HTTPException(
                status_code=500,
                detail="Analysis failed."
            )

        return {
            "status": "completed",
            "domain": request.domain,
            "result": result
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "trace": traceback.format_exc()
        }
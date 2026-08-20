from fastapi import APIRouter, HTTPException, status
from app.models.schemas import ExtractionRequest, ExtractedProfileResponse, HealthCheckResponse
from app.services.extractor import extract_profile_intelligence

router = APIRouter()

@router.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    return HealthCheckResponse(
        status="healthy",
        service="PathForge AI Intelligence Service",
        version="0.1.0"
    )

@router.post("/profile/extract", response_model=ExtractedProfileResponse, tags=["Profile Intelligence"])
async def extract_profile(payload: ExtractionRequest):
    try:
        result = extract_profile_intelligence(payload.text, payload.context)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI profile extraction failed: {str(e)}"
        )

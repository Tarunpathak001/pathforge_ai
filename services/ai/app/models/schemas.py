from typing import List, Optional
from pydantic import BaseModel, Field

class ExtractionRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Natural language profile or skills input")
    context: Optional[str] = Field(None, max_length=1000, description="Optional extra context or step tag")

class ExtractedSkill(BaseModel):
    name: str = Field(..., min_length=1, description="Standard canonical skill name")
    level: int = Field(..., ge=1, le=5, description="Inferred proficiency level (1-5)")
    evidence: Optional[str] = Field(None, description="Contextual snippet indicating skill usage or experience")
    years_experience: Optional[float] = Field(None, ge=0, description="Estimated years of experience if mentioned")

class ExtractedProject(BaseModel):
    name: str = Field(..., min_length=1, description="Extracted project title or summary")
    description: str = Field("", description="Project description or technologies used")
    technologies: List[str] = Field(default_factory=list, description="List of technologies associated with project")

class ExtractedProfileResponse(BaseModel):
    target_role: Optional[str] = Field(None, description="Identified target career role")
    skills: List[ExtractedSkill] = Field(default_factory=list, description="Extracted and normalized skills")
    interests: List[str] = Field(default_factory=list, description="Extracted domain or career interests")
    projects: List[ExtractedProject] = Field(default_factory=list, description="Extracted projects and learning work")
    experience_level: Optional[str] = Field(None, description="Overall technical experience level")
    weekly_availability: Optional[str] = Field(None, description="Extracted weekly availability hours")
    summary: Optional[str] = Field(None, description="Brief summary of extracted profile context")

class HealthCheckResponse(BaseModel):
    status: str
    service: str
    version: str

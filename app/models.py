from typing import List, Literal, Optional

from pydantic import BaseModel


RiskLevel = Literal["low", "mid", "high"]


class SentenceScore(BaseModel):
    index: int
    text: str
    score: float
    level: RiskLevel
    reason: Optional[str] = None


class DetectionRequest(BaseModel):
    text: str
    target_ratio: float
    style: str
    detail_level: Literal["summary", "detail"]


class DetectionSummary(BaseModel):
    total_sentences: int
    overall_ratio: float
    low_count: int
    mid_count: int
    high_count: int


class DetectionResult(BaseModel):
    request: DetectionRequest
    summary: DetectionSummary
    sentences: List[SentenceScore]


if __name__ == "__main__":
    sample_request = DetectionRequest(
        text="Example content to score.",
        target_ratio=0.3,
        style="academic",
        detail_level="summary",
    )
    print(sample_request)

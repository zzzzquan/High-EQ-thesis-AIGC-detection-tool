"""AIGC detection package shortcuts."""

from app.cli_detect import main as cli_main
from app.deepseek_client import get_deepseek_client, score_sentences_with_deepseek
from app.detector import run_detection
from app.models import (
    DetectionRequest,
    DetectionResult,
    DetectionSummary,
    RiskLevel,
    SentenceScore,
)
from app.segmenter import split_text

__all__ = [
    "cli_main",
    "get_deepseek_client",
    "score_sentences_with_deepseek",
    "run_detection",
    "DetectionRequest",
    "DetectionResult",
    "DetectionSummary",
    "RiskLevel",
    "SentenceScore",
    "split_text",
]

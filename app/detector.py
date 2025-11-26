import os
import sys
from typing import Any, List

# Allow running as a script: `python app/detector.py`
if __name__ == "__main__" and __package__ is None:
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.deepseek_client import score_sentences_with_deepseek
from app.models import DetectionRequest, DetectionResult, DetectionSummary, SentenceScore
from app.segmenter import split_text


def run_detection(request: DetectionRequest) -> DetectionResult:
    sentences_raw = split_text(request.text)
    if not sentences_raw:
        summary = DetectionSummary(
            total_sentences=0,
            overall_ratio=0.0,
            low_count=0,
            mid_count=0,
            high_count=0,
        )
        return DetectionResult(request=request, summary=summary, sentences=[])

    data = score_sentences_with_deepseek(
        sentences_raw, request.target_ratio, language="zh"
    )

    scores: List[SentenceScore] = []
    for i, item in enumerate[Any](data.get("sentences", []), start=1):
        scores.append(
            SentenceScore(
                index=int(item.get("index", i)),
                text=str(item.get("text", sentences_raw[i - 1] if i - 1 < len(sentences_raw) else "")),
                score=float(item.get("score", 0.0)),
                level=str(item.get("level", "low")),  # type: ignore[arg-type]
                reason=item.get("reason") or None,
            )
        )

    total_sentences = len(scores)
    low_count = sum(1 for s in scores if s.level == "low")
    mid_count = sum(1 for s in scores if s.level == "mid")
    high_count = sum(1 for s in scores if s.level == "high")

    overall_ratio = data.get("overall_ratio")
    if overall_ratio is None:
        overall_ratio = (high_count + 0.5 * mid_count) / total_sentences if total_sentences else 0.0

    summary = DetectionSummary(
        total_sentences=total_sentences,
        overall_ratio=float(overall_ratio),
        low_count=low_count,
        mid_count=mid_count,
        high_count=high_count,
    )

    return DetectionResult(request=request, summary=summary, sentences=scores)


if __name__ == "__main__":
    sample_request = DetectionRequest(
        text="这是第一句话。这里是第二句话，包含更多细节。\n最后一句混合 English words.",
        target_ratio=0.3,
        style="style_a",
        detail_level="summary",
    )
    result = run_detection(sample_request)
    print("Summary:", result.summary)
    for s in result.sentences[:3]:
        print(f"{s.index}: level={s.level}, score={s.score}, text={s.text}")

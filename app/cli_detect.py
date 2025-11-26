import argparse
import os
import sys
from typing import Optional

# Allow running as a script: `python app/cli_detect.py`
if __name__ == "__main__" and __package__ is None:
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.detector import run_detection
from app.models import DetectionRequest


def _read_text_from_file(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _truncate(text: str, max_len: int = 80) -> str:
    return text if len(text) <= max_len else text[: max_len - 3] + "..."


def main(argv: Optional[list[str]] = None) -> None:
    parser = argparse.ArgumentParser(description="AIGC detection CLI")
    parser.add_argument("--text", type=str, help="Text to detect")
    parser.add_argument("--file", type=str, help="Path to a text file to detect")
    parser.add_argument("--target-ratio", type=float, default=0.3, help="Target ratio threshold")
    args = parser.parse_args(argv)

    input_text = args.text
    if not input_text and args.file:
        input_text = _read_text_from_file(args.file)

    if not input_text:
        parser.print_help()
        sys.exit(1)

    request = DetectionRequest(
        text=input_text,
        target_ratio=args.target_ratio,
        style="style_a",
        detail_level="summary",
    )

    result = run_detection(request)

    summary = result.summary
    print(
        f"Summary: total={summary.total_sentences}, overall_ratio={summary.overall_ratio:.3f}, "
        f"low={summary.low_count}, mid={summary.mid_count}, high={summary.high_count}"
    )

    for s in result.sentences[:10]:
        print(
            f"[{s.index}] level={s.level.upper()} score={s.score:.3f} "
            f"text={_truncate(s.text)}"
        )


if __name__ == "__main__":
    main()

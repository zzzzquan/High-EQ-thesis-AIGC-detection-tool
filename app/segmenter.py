import re


def split_text(text: str) -> list[str]:
    """
    Split mixed Chinese/English text into sentences by punctuation and newlines.
    Short fragments (<5 chars after strip) are discarded. Falls back to the
    stripped original text if nothing remains.
    """
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    parts = re.split(r"[。！？.!?\n]+", text)
    sentences = [part.strip() for part in parts if part and len(part.strip()) >= 5]

    if not sentences and text.strip():
        return [text.strip()]
    return sentences


if __name__ == "__main__":
    sample = (
        "这是第一句，用中文。Here is a short line!\n"
        "中英混合 second line? 最后一行包含多个标点!!!\n"
        "短句。 but this one is definitely longer than five chars."
    )
    for idx, s in enumerate(split_text(sample), start=1):
        print(f"{idx}: {s} (len={len(s)})")

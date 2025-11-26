import json
import os
from openai import OpenAI


def _get_api_key() -> str:
    """Fetch DeepSeek API key from environment."""
    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("环境变量 DEEPSEEK_API_KEY 未设置或为空，请在 .env 中配置后重试。")
    return api_key


def get_deepseek_client() -> OpenAI:
    """Return an OpenAI client configured for DeepSeek."""
    return OpenAI(api_key=_get_api_key(), base_url="https://api.deepseek.com")


def test_hello() -> None:
    """Send a minimal chat completion to verify connectivity."""
    client = get_deepseek_client()
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": "你是一个调试助手"},
            {"role": "user", "content": "请用一句中文告诉我：DeepSeek API 已经打通"},
        ],
    )
    print(response.choices[0].message.content)


def score_sentences_with_deepseek(
    sentences: list[str],
    target_ratio: float,
    language: str = "zh",
) -> dict:
    """Score AIGC risk for a list of sentences via DeepSeek."""
    system_prompt = (
        "你是一个“学术文本原创性分析器”。"
        "输入是一个 JSON，包含 target_ratio, language, sentences（句子数组）。"
        "输出必须是一个合法 JSON，结构为："
        '{ "overall_ratio": <float 0~1>, "sentences": [ { "index": <int 从 1 开始>, '
        '"text": "<原句文本>", "score": <float 0~1>, "level": "<low|mid|high>", '
        '"reason": "<可选简短中文说明>" } ] }。'
        "只输出 JSON，不要解释，不要代码块。"
    )
    user_content = json.dumps(
        {"target_ratio": target_ratio, "language": language, "sentences": sentences},
        ensure_ascii=False,
    )
    client = get_deepseek_client()
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
    )
    content = response.choices[0].message.content
    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"DeepSeek 响应 JSON 解析失败：{content}") from exc


def test_score() -> None:
    sentences = [
        "这一段文字描述了大语言模型的发展历程。",
        "在学术写作中，应当明确标注引用来源。",
        "快速部署一个小型 API 服务可以使用 FastAPI。",
    ]
    result = score_sentences_with_deepseek(sentences, target_ratio=0.3)
    print("overall_ratio:", result.get("overall_ratio"))
    for item in result.get("sentences", [])[:3]:
        print(
            f"#{item.get('index')}: level={item.get('level')} "
            f"score={item.get('score')} text={item.get('text')}"
        )


if __name__ == "__main__":
    test_score()

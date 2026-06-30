# backend/api/llm_client.py
import requests
import logging
from django.conf import settings

logger = logging.getLogger('api')

SYSTEM_PROMPT = """You are a helpful University Student Support Assistant.
You assist students with questions about:
- Course registration
- Examination rules and procedures
- Library services
- ICT support
- Hostel application
- Fee payment
- Academic calendar
- Student conduct

Always be polite and clear. If a question is not related to university
services, say you can only assist with university-related matters.
Keep answers concise and practical."""


def ask_llm(question: str) -> str:
    full_prompt = f"{SYSTEM_PROMPT}\n\nStudent question: {question}\n\nAnswer:"
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": full_prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": 500,
        }
    }
    logger.info(f"Sending question to LLM: {question}")
    try:
        response = requests.post(settings.OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        answer = data.get("response", "").strip()
        logger.info(f"LLM answered. Length: {len(answer)} chars")
        return answer
    except requests.exceptions.ConnectionError:
        logger.error("Cannot connect to Ollama. Is it running on port 11434?")
        raise ConnectionError(
            "The AI model is not running. Please start Ollama and try again."
        )
    except requests.exceptions.Timeout:
        logger.error("LLM request timed out after 60 seconds")
        raise TimeoutError(
            "The AI model took too long to respond. Please try again."
        )
    except requests.exceptions.RequestException as e:
        logger.error(f"Unexpected error calling LLM: {str(e)}")
        raise Exception(f"Error communicating with AI model: {str(e)}")

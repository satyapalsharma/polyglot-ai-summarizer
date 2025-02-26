import logging
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
from typing import Optional, Dict, Any

# Import configuration settings
from backend.config import SUMMARY_MODEL_NAME, TRANSLATION_MODEL_PREFIX, MAX_INPUT_LENGTH

# Configure logging for the NLP service
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class NLPService:
    """
    A service class to handle Natural Language Processing tasks such as summarization and translation.
    It leverages Hugging Face's transformers library for these tasks, loading models lazily
    and caching them for efficient reuse.
    """
    # Class-
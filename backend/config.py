import os
from dotenv import load_dotenv

# Load environment variables from a .env file.
# This allows for easy configuration management in different environments
# (development, staging, production) without changing the code.
load_dotenv()

class Config:
    """
    Configuration class for the Polyglot AI Summarizer backend.

    This class centralizes all application settings, loading them primarily
    from environment variables. It provides sensible default values for
    development and ensures that critical settings like API keys are
    handled securely via environment variables.
    """

    # --- Application Settings ---
    APP_NAME: str = "Polyglot AI Summarizer Backend"
    # Debug mode: 'True' or '1' enables debugging features. Defaults to False.
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    # Port on which the FastAPI application will run. Defaults to 8000.
    PORT: int = int(os.getenv("PORT", 8000))
    # Host address for the FastAPI application. Defaults to 0.0.0.0 for external access.
    HOST: str = os.getenv("HOST", "0.0.0.0")

    # --- AI/NLP Service Settings ---
    # API Key for the chosen AI service (e.g., OpenAI, Hugging Face Inference API).
    # It's crucial to set this in your environment variables (e.g., in .env).
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    if not AI_API_KEY and not DEBUG:
        # In production, an API key is mandatory. In debug, we might allow local models.
        print("WARNING: AI_API_KEY is not set. Some NLP features may not work.")

    # Model identifier for summarization.
    # Examples: "gpt-3.5-turbo", "facebook/bart-large-cnn", "t5-small"
    SUMMARIZATION_MODEL: str = os.getenv("SUMMARIZATION_MODEL", "gpt-3.5-turbo")
    # Maximum length of the generated summary (e.g., in tokens or words).
    MAX_SUMMARY_LENGTH: int = int(os.getenv("MAX_SUMMARY_LENGTH", 200))

    # Model identifier for translation.
    # Examples: "Helsinki-NLP/opus-mt-en-fr", "google/mt5-small"
    TRANSLATION_MODEL: str = os.getenv("TRANSLATION_MODEL", "Helsinki-NLP/opus-mt-en-fr")
    # Default target language for translation (ISO 639-1 code, e.g., "en", "es", "fr").
    DEFAULT_TARGET_LANGUAGE: str = os.getenv("DEFAULT_TARGET_LANGUAGE", "en")

    # --- URL Processing Settings ---
    # Timeout for fetching content from URLs (in seconds).
    URL_FETCH_TIMEOUT: int = int(os.getenv("URL_FETCH_TIMEOUT", 15))
    # Maximum content size to fetch from a URL (in bytes) to prevent memory issues.
    MAX_URL_CONTENT_SIZE: int = int(os.getenv("MAX_URL_CONTENT_SIZE", 5 * 1024 * 1024)) # 5 MB

    # --- Logging Settings ---
    # Global logging level (e.g., "INFO", "DEBUG", "WARNING", "ERROR").
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()

    # --- CORS Settings ---
    # Comma-separated list of origins allowed to make requests to the backend.
    # Use "*" for development, but specify exact origins in production.
    CORS_ALLOWED_ORIGINS: list[str] = os.getenv(
        "CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    if DEBUG:
        CORS_ALLOWED_ORIGINS.append("*") # Allow all origins in debug mode for convenience
        print(f"DEBUG mode active. CORS_ALLOWED_ORIGINS: {CORS_ALLOWED_ORIGINS}")
    else:
        # Remove '*' if it was accidentally included in production
        if "*" in CORS_ALLOWED_ORIGINS:
            CORS_ALLOWED_ORIGINS.remove("*")
        print(f"Production mode active. CORS_ALLOWED_ORIGINS: {CORS_ALLOWED_ORIGINS}")

# Example of how to access configuration:
# from backend.config import Config
# api_key = Config.AI_API_KEY
# debug_mode = Config.DEBUG
# print(f"Application running in debug mode: {debug_mode}")
# print(f"Using summarization model: {Config.SUMMARIZATION_MODEL}")
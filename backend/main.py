from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
import logging

from backend.config import get_settings
from backend.nlp_service import summarize_text_or_url, SummarizationError

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Load Application Settings ---
settings = get_settings()

# --- FastAPI Application Initialization ---
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Polyglot AI Summarizer Backend API for generating concise summaries and translations.",
    version="0.1.0",
    docs_url="/docs",  # Exposes Swagger UI at /docs
    redoc_url="/redoc" # Exposes ReDoc UI at /redoc
)

# --- CORS Middleware Configuration ---
# This middleware enables Cross-Origin Resource Sharing (CORS), allowing the frontend
# application (e.g., Next.js running on a different port/domain) to make requests
# to this backend API.
#
# In a production environment, it's highly recommended to restrict `allow_origins`
# to only the specific domain(s) where your frontend is hosted for security reasons.
# For development, `*` or `http://localhost:3000` (default Next.js dev server) is common.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),  # e.g., ["http://localhost:3000", "https://your-frontend.com"]
    allow_credentials=True,  # Allow cookies to be sent with requests
    allow_methods=["*"],     # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],     # Allow all headers in the request
)

# --- Pydantic Request Model ---
class SummarizeRequest(BaseModel):
    """
    Defines the expected structure for incoming summarization requests.
    It requires either 'text' content or a 'url' to fetch content from, but not both.
    Optional fields include 'target_language' for translation and 'summary_length'.
    """
    text: Optional[str] = Field(
        None,
        description="The raw text content to be summarized. Should not be provided if 'url' is present."
    )
    url: Optional[str] = Field(
        None,
        description="A URL from which content will be fetched and summarized. Should not be provided if 'text' is present."
    )
    target_language: Optional[str] = Field(
        None,
        description="Optional ISO 639-1 code for the target language for translation (e.g., 'es' for Spanish, 'fr' for French). If not provided, no translation is performed.",
        example="es"
    )
    summary_length: Optional[str] = Field(
        "medium",
        description="Desired length of the summary. Options: 'short', 'medium', 'long'. Defaults to 'medium'.",
        example="short"
    )

    @validator('text', 'url', pre=True, always=True)
    def check_either_text_or_url(cls, v: Optional[str], values: Dict[str, Any], field: Field) -> Optional[str]:
        """
        Custom validator to ensure that exactly one of 'text' or 'url' is provided.
        """
        text_present = values.get('text') is not None and values['text'].strip() != ""
        url_present = values.get('url') is not None and values['url'].strip() != ""

        if field.name == 'text':
            if text_present and url_present:
                raise ValueError("Cannot provide both 'text' and 'url'. Please provide only one source for summarization.")
            if not text_present and not url_present:
                raise ValueError("Either 'text' or 'url' must be provided for summarization.")
        
        # Strip whitespace for text fields if present
        if v is not None and isinstance(v, str):
            return v.strip()
        return v

# --- API Endpoints ---

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint.
    Returns a simple status message to indicate that the API is running.
    Useful for load balancers and container orchestration systems.
    """
    logger.info("Health check requested.")
    return {"status": "ok", "message": "Polyglot AI Summarizer API is running smoothly."}

@app.post("/summarize", status_code=status.HTTP_200_OK)
async def summarize_endpoint(request: SummarizeRequest) -> Dict[str, Any]:
    """
    Processes a summarization request.
    Takes either text content or a URL, generates a summary, and optionally translates it.

    Args:
        request (SummarizeRequest): The request body containing text/URL, target language, and summary length.

    Returns:
        Dict[str, Any]: A dictionary containing the generated summary, detected language,
                        and the translated summary if a target language was provided.

    Raises:
        HTTPException:
            - 400 Bad Request if there's an issue with the input or summarization process.
            - 500 Internal Server Error for unexpected server-side issues.
    """
    logger.info(
        f"Summarization request received. "
        f"Source: {'URL' if request.url else 'Text'}, "
        f"Target Language: {request.target_language if request.target_language else 'None'}, "
        f"Summary Length: {request.summary_length}"
    )

    try:
        # Call the NLP service to perform summarization and optional translation
        summary_result = await summarize_text_or_url(
            text_content=request.text,
            url=request.url,
            target_language=request.target_language,
            summary_length=request.summary_length
        )
        logger.info("Summarization and translation (if requested) completed successfully.")
        return summary_result
    except SummarizationError as e:
        # Catch specific errors from the NLP service and return a 400 Bad Request
        logger.warning(f"Client-side summarization error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Catch any other unexpected errors and return a 500 Internal Server Error
        logger.exception(f"An unexpected internal server error occurred during summarization: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred on the server. Please try again later."
        )

# --- Application Entry Point (for local development) ---
if __name__ == "__main__":
    # This block allows running the application directly using `python backend/main.py`.
    # For production deployments, it's recommended to use a production-ready ASGI server
    # like Uvicorn directly, e.g., `uvicorn backend.main:app --host 0.0.0.0 --port 8000`.
    import uvicorn
    logger.info(f"Starting FastAPI application on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run(app, host=settings.HOST, port=settings.PORT, log_level="info")
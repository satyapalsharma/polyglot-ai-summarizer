import { NextRequest, NextResponse } from 'next/server';

/**
 * @interface SummarizeRequestBody
 * @description Defines the expected structure of the request body for the summarization API.
 * Either 'text' or 'url' must be provided. 'targetLanguage' is optional for translation.
 */
interface SummarizeRequestBody {
  text?: string;
  url?: string;
  targetLanguage?: string; // e.g., 'en', 'es', 'fr'
}

/**
 * @interface BackendSummaryResponse
 * @description Defines the expected structure of the successful response from the Python backend.
 */
interface BackendSummaryResponse {
  summary: string;
  translated_summary?: string; // Optional, if translation was requested and successful
}

/**
 * @interface ErrorResponse
 * @description Defines the structure for error responses.
 */
interface ErrorResponse {
  error: string;
}

/**
 * @function POST
 * @description Handles POST requests to the /api/summarize endpoint.
 * This endpoint acts as a proxy to the Python NLP backend service.
 * It takes text or a URL, and an optional target language, then forwards
 * the request to the backend for summarization and translation.
 *
 * @param {NextRequest} req The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A Next.js response object containing the summary or an error.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body to extract text, URL, and target language.
    const { text, url, targetLanguage }: SummarizeRequestBody = await req.json();

    // --- Input Validation ---
    // Ensure that at least one of 'text' or 'url' is provided.
    if (!text && !url) {
      console.warn('Bad Request: Either text or a URL must be provided.');
      return NextResponse.json(
        { error: 'Either text or a URL must be provided.' },
        { status: 400 }
      );
    }

    // --- Backend Service Configuration ---
    // Retrieve the backend service URL from environment variables.
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('Server Error: NEXT_PUBLIC_BACKEND_URL is not defined in environment variables.');
      return NextResponse.json(
        { error: 'Backend service URL is not configured. Please check server environment variables.' },
        { status: 500 }
      );
    }

    // --- Construct Payload for Python Backend ---
    // Create a payload object that matches the expected input of the Python backend.
    // Note: Python typically uses snake_case for keys.
    const backendPayload: { text?: string; url?: string; target_language?: string } = {};
    if (text) backendPayload.text = text;
    if (url) backendPayload.url = url;
    if (targetLanguage) backendPayload.target_language = targetLanguage;

    // --- Call Python Backend Service ---
    // Make a POST request to the Python backend's /summarize endpoint.
    const backendResponse = await fetch(`${backendUrl}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Potentially add API keys or other authentication headers if required by the backend
        // 'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`,
      },
      body: JSON.stringify(backendPayload),
      // Set a timeout for the backend request to prevent hanging
      // Note: fetch API doesn't have a built-in timeout. AbortController can be used for this.
      // For simplicity, omitting AbortController here, but it's good practice for production.
    });

    // --- Handle Backend Response ---
    // If the backend response was not successful (e.g., 4xx, 5xx status codes).
    if (!backendResponse.ok) {
      const errorData: ErrorResponse = await backendResponse.json();
      console.error(`Backend Error (${backendResponse.status}):`, errorData.error || backendResponse.statusText);
      return NextResponse.json(
        { error: errorData.error || 'Failed to get summary from backend service.' },
        { status: backendResponse.status }
      );
    }

    // Parse the successful JSON response from the backend.
    const data: BackendSummaryResponse = await backendResponse.json();

    // --- Return Successful API Response ---
    // Return the summary and translated summary (if available) to the client.
    // Convert `translated_summary` to `translatedSummary` for frontend consistency (camelCase).
    return NextResponse.json(
      {
        summary: data.summary,
        translatedSummary: data.translated_summary,
      },
      { status: 200 }
    );

  } catch (error) {
    // --- Global Error Handling ---
    // Catch any unexpected errors during the process (e.g., network issues, JSON parsing errors).
    console.error('API Route Error:', error);

    // Provide more specific error messages for common issues.
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body. Please ensure your request is well-formed.' },
        { status: 400 }
      );
    }
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return NextResponse.json(
        { error: 'Network error: Could not connect to the backend service. Please check its availability.' },
        { status: 503 } // Service Unavailable
      );
    }

    // Generic error for any other unhandled exceptions.
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
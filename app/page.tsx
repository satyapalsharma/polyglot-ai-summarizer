import React, { useState, useCallback } from 'react';
import SummarizerForm from '../components/SummarizerForm';

/**
 * Defines the structure for the summary response received from the API.
 */
interface SummaryResponse {
  summary: string;
  original_language: string;
  translated_language?: string; // Optional, if translation occurred
}

/**
 * HomePage component serves as the main landing page for the Polyglot AI Summarizer.
 * It orchestrates user input through the SummarizerForm, handles API calls to the
 * backend for summarization and translation, and displays the results, including
 * loading and error states.
 */
export default function HomePage() {
  // State to store the generated summary and related language information
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  // State to indicate if an API request is currently in progress
  const [loading, setLoading] = useState<boolean>(false);
  // State to store any error messages encountered during the process
  const [error, setError] = useState<string | null>(null);

  /**
   * Callback function to handle the form submission.
   * It sends the user's input text/URL and target language to the API
   * for summarization and translation.
   *
   * @param textOrUrl The input text or URL provided by the user.
   * @param targetLanguage The language code (e.g., 'en', 'es') for translation.
   */
  const handleSubmit = useCallback(async (textOrUrl: string, targetLanguage: string) => {
    // Reset states before a new request
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      // Make a POST request to the Next.js API route
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ textOrUrl, targetLanguage }),
      });

      // Check if the response was successful
      if (!response.ok) {
        const errorData = await response.json();
        // Throw an error with a message from the API or a default one
        throw new Error(errorData.error || 'Failed to generate summary. Please try again.');
      }

      // Parse the successful response data
      const data: SummaryResponse = await response.json();
      setSummary(data); // Update the summary state
    } catch (err: any) {
      // Catch and display any errors during the fetch operation
      console.error('Summarization error:', err);
      setError(err.message || 'An unexpected error occurred. Please check your input.');
    } finally {
      // Always set loading to false once the request is complete
      setLoading(false);
    }
  }, []); // Empty dependency array means this callback is created once

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 lg:p-24 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="z-10 w-full max-w-4xl items-center justify-between font-sans text-sm lg:flex flex-col">
        {/* Application Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center text-blue-600 dark:text-blue-400">
          Polyglot AI Summarizer
        </h1>
        {/* Application Description */}
        <p className="text-lg md:text-xl text-center mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          Effortlessly summarize long texts or articles from URLs, and get them translated into multiple languages using advanced AI.
        </p>

        {/* Summarizer Form Component */}
        {/* Passes the handleSubmit function and loading state to the form */}
        <SummarizerForm onSubmit={handleSubmit} loading={loading} />

        {/* Loading Indicator */}
        {loading && (
          <div className="mt-8 p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg shadow-md flex items-center justify-center w-full max-w-md">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Summarizing and translating... Please wait.
          </div>
        )}

        {/* Error Message Display */}
        {error && (
          <div className="mt-8 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg shadow-md w-full max-w-2xl text-center">
            <p className="font-bold text-lg mb-2">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Summary Output Display */}
        {summary && !loading && !error && (
          <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl">
            <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Summary</h2>
            {/* Display the summary text, preserving line breaks */}
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
              {summary.summary}
            </div>
            {/* Display language information */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
              <p>Original Language: <span className="font-medium capitalize">{summary.original_language}</span></p>
              {summary.translated_language && (
                <p>Translated To: <span className="font-medium capitalize">{summary.translated_language}</span></p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
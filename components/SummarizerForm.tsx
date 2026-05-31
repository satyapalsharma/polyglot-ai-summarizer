import React, { useState, useCallback, FormEvent } from 'react';

/**
 * @typedef {Object} LanguageOption
 * @property {string} code - The language code (e.g., 'en', 'es').
 * @property {string} name - The display name of the language.
 */
interface LanguageOption {
  code: string;
  name: string;
}

/**
 * SummarizerForm Component
 *
 * This component provides the user interface for inputting text or a URL,
 * selecting a target language for translation, and triggering the summarization process.
 * It handles form submission, API calls to the backend, and displays the summary,
 * loading states, and error messages.
 */
const SummarizerForm: React.FC = () => {
  // State for the user's input text or URL
  const [inputTextOrUrl, setInputTextOrUrl] = useState<string>('');
  // State for the selected target language for summary translation
  const [targetLanguage, setTargetLanguage] = useState<string>('en'); // Default to English
  // State to store the generated summary
  const [summary, setSummary] = useState<string | null>(null);
  // State to indicate if an API call is in progress
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State to store any error messages
  const [error, setError] = useState<string | null>(null);

  // Define available languages for translation.
  // This list can be expanded or fetched dynamically from an API if needed.
  const availableLanguages: LanguageOption[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ru', name: 'Russian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'it', name: 'Italian' },
    // Add more languages as the backend supports them
  ];

  /**
   * Handles the form submission event.
   * Prevents default form behavior, validates input, makes an API call,
   * and updates the UI with the summary, loading state, or error messages.
   */
  const handleSubmit = useCallback(async (event: FormEvent) => {
    event.preventDefault(); // Prevent default browser form submission

    // Clear previous summary and error messages
    setError(null);
    setSummary(null);
    setIsLoading(true); // Set loading state

    // Basic input validation
    if (!inputTextOrUrl.trim()) {
      setError('Please enter text or a URL to summarize.');
      setIsLoading(false);
      return;
    }

    try {
      // Make a POST request to the Next.js API route
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textOrUrl: inputTextOrUrl,
          targetLanguage: targetLanguage,
        }),
      });

      // Check if the response was successful
      if (!response.ok) {
        const errorData = await response.json();
        // Throw an error with a message from the API or a generic one
        throw new Error(errorData.error || 'An unknown error occurred during summarization.');
      }

      // Parse the JSON response
      const data = await response.json();
      setSummary(data.summary); // Update the summary state
    } catch (err: any) {
      // Catch and display any errors during the fetch operation
      console.error('Summarization error:', err);
      setError(err.message || 'Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false); // Always reset loading state, regardless of success or failure
    }
  }, [inputTextOrUrl, targetLanguage]); // Dependencies for useCallback

  return (
    <div className="summarizer-container">
      <h1 className="summarizer-title">Polyglot AI Summarizer</h1>
      <p className="summarizer-description">
        Enter any text or a URL below, select your desired translation language, and get a concise summary.
      </p>

      <form onSubmit={handleSubmit} className="summarizer-form">
        <div className="form-group">
          <label htmlFor="textOrUrlInput" className="form-label">
            Text or URL:
          </label>
          <textarea
            id="textOrUrlInput"
            className="form-textarea"
            value={inputTextOrUrl}
            onChange={(e) => setInputTextOrUrl(e.target.value)}
            placeholder="Paste your text or a URL here (e.g., 'https://example.com/article' or a long paragraph)..."
            rows={10}
            required // Make the input required
            aria-label="Text or URL to summarize"
            disabled={isLoading} // Disable input while loading
          />
        </div>

        <div className="form-group">
          <label htmlFor="targetLanguageSelect" className="form-label">
            Translate Summary To:
          </label>
          <select
            id="targetLanguageSelect"
            className="form-select"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            aria-label="Select target language for summary translation"
            disabled={isLoading} // Disable select while loading
          >
            {availableLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || !inputTextOrUrl.trim()} // Disable button if loading or input is empty
        >
          {isLoading ? 'Summarizing...' : 'Summarize & Translate'}
        </button>
      </form>

      {/* Loading indicator */}
      {isLoading && (
        <div className="loading-indicator" aria-live="polite">
          Generating summary, please wait...
        </div>
      )}

      {/* Error message display */}
      {error && (
        <div className="error-message" role="alert">
          Error: {error}
        </div>
      )}

      {/* Summary output display */}
      {summary && (
        <div className="summary-output" aria-live="polite">
          <h2 className="summary-heading">Summary:</h2>

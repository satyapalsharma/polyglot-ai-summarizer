import './styles/globals.css';
import { Inter } from 'next/font/google';
import React from 'react';

// Initialize the Inter font with a 'latin' subset for optimal performance.
// This font will be used throughout the application for a consistent look.
const inter = Inter({ subsets: ['latin'] });

/**
 * Metadata for the application.
 * This object defines the title and description that will appear in browser tabs and search results.
 * It's crucial for SEO and user experience.
 */
export const metadata = {
  title: 'Polyglot AI Summarizer',
  description: 'An AI-powered application for generating concise summaries and multi-language translations from text or URLs.',
};

/**
 * RootLayout Component
 *
 * This is the top-level layout component for the Next.js application.
 * It wraps all pages and provides a consistent structure, including:
 * - HTML document structure (<html>, <body>)
 * - Global styles import
 * - Font application
 * - Metadata injection
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components (pages) to be rendered within this layout.
 * @returns {JSX.Element} The rendered HTML layout.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/*
        The <body> tag applies the global font defined by `inter.className`.
        This ensures that all text within the application uses the specified font.
      */}
      <body className={inter.className}>
        {/*
          The `children` prop represents the content of the current page.
          This setup allows each page to render its specific UI while inheriting
          the global layout, styles, and fonts defined here.
          For a simple application like this, a minimal layout is often preferred,
          letting individual pages manage their primary content structure.
        */}
        {children}
      </body>
    </html>
  );
}
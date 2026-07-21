'use client';

import { useState, useEffect } from 'react';

interface QuoteData {
  quote: string;
  author: string;
  date: string;
}

const FALLBACK_QUOTE: QuoteData = {
  quote: "The only way to define your limits is by going beyond them.",
  author: "Arthur C. Clarke",
  date: new Date().toISOString().split('T')[0]
};

export function QuoteOfTheDay() {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
  }, []);

  const getTodayUTC = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const getCachedQuote = (): QuoteData | null => {
    try {
      const cached = localStorage.getItem('halloffame-qotd');
      if (!cached) return null;

      const data = JSON.parse(cached) as QuoteData;
      const today = getTodayUTC();

      // Check if cached quote is from today
      if (data.date === today) {
        return data;
      }

      return null;
    } catch (error) {
      console.error('Error reading cached quote:', error);
      return null;
    }
  };

  const setCachedQuote = (data: QuoteData): void => {
    try {
      localStorage.setItem('halloffame-qotd', JSON.stringify(data));
    } catch (error) {
      console.error('Error caching quote:', error);
    }
  };

  const fetchQuote = async (): Promise<void> => {
    // Check cache first
    const cached = getCachedQuote();
    if (cached) {
      setQuoteData(cached);
      setLoading(false);
      return;
    }

    // Fetch from API
    try {
      const response = await fetch('https://zenquotes.io/api/today');
      
      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      if (data && data.length > 0 && data[0].q && data[0].a) {
        const quoteData: QuoteData = {
          quote: data[0].q,
          author: data[0].a,
          date: getTodayUTC()
        };

        setQuoteData(quoteData);
        setCachedQuote(quoteData);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      // Use fallback quote
      setQuoteData(FALLBACK_QUOTE);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-6 max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground/40 text-center italic animate-pulse">
          Loading quote...
        </p>
      </div>
    );
  }

  if (!quoteData) {
    return null;
  }

  return (
    <div className="mb-6 max-w-2xl mx-auto">
      <p className="text-sm text-muted-foreground/60 text-center italic">
        "{quoteData.quote}" — {quoteData.author}
      </p>
      <p className="text-[9px] text-muted-foreground/40 text-center mt-1">
        <a 
          href="https://zenquotes.io/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          zenquotes.io
        </a>
      </p>
    </div>
  );
}

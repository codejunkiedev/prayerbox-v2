import { useState, useRef, useCallback } from 'react';
import { forwardGeocode } from '@/api';
import type { GeoapifyResponse } from '@/types';

const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 3;

export function useLocationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoapifyResponse['features']>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (value.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await forwardGeocode({
          text: value,
          signal: controller.signal,
        });
        setResults(response.features);
        setIsOpen(response.features.length > 0);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setResults([]);
          setIsOpen(false);
        }
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setIsSearching(false);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    query,
    results,
    isSearching,
    isOpen,
    setIsOpen,
    handleQueryChange,
    clearSearch,
  };
}

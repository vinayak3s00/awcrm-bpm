'use client';

import { useAuth } from '@clerk/nextjs';
import {
  ArrowRight,
  Building2,
  Calendar,
  Command,
  Search,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type SearchResult = {
  id: string;
  type: 'contact' | 'company' | 'deal' | 'activity';
  title: string;
  subtitle: string;
  description?: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
};

type GlobalSearchProps = {
  placeholder?: string;
  onResultClick?: (result: SearchResult) => void;
};

export function GlobalSearch({
  placeholder = 'Search contacts, companies, deals...',
  onResultClick,
}: GlobalSearchProps) {
  const { getToken } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        // Fallback to mock data for now
        setResults(getMockResults(searchQuery));
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock data
      setResults(getMockResults(searchQuery));
    } finally {
      setLoading(false);
    }
  };

  // Mock search results for development
  const getMockResults = (searchQuery: string): SearchResult[] => {
    const mockData: SearchResult[] = [
      {
        id: '1',
        type: 'contact',
        title: 'John Smith',
        subtitle: 'CEO at Acme Corporation',
        description: 'john.smith@acme.com',
        url: '/dashboard/contacts/1',
        icon: Users,
        iconColor: 'text-blue-600',
      },
      {
        id: '2',
        type: 'company',
        title: 'Acme Corporation',
        subtitle: 'Technology • 500-1000 employees',
        description: 'Enterprise software company',
        url: '/dashboard/companies/1',
        icon: Building2,
        iconColor: 'text-green-600',
      },
      {
        id: '3',
        type: 'deal',
        title: 'Enterprise Software License',
        subtitle: '$50,000 • Proposal Stage',
        description: 'Annual license for 500 users',
        url: '/dashboard/deals/1',
        icon: TrendingUp,
        iconColor: 'text-purple-600',
      },
      {
        id: '4',
        type: 'activity',
        title: 'Meeting with John Smith',
        subtitle: 'Tomorrow at 2:00 PM',
        description: 'Discuss contract terms',
        url: '/dashboard/activities/1',
        icon: Calendar,
        iconColor: 'text-orange-600',
      },
    ];

    return mockData.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
      || item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      || item.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev =>
            prev < results.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setQuery('');
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    onResultClick?.(result);

    // Navigate to result URL
    window.location.href = result.url;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative max-w-md flex-1" ref={resultsRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="crm-flex crm-items-center pointer-events-none absolute inset-y-0 left-0 pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="crm-input crm-text-sm w-full py-2 pr-20 pl-10"
        />
        <div className="crm-flex crm-items-center crm-gap-2 absolute inset-y-0 right-0 pr-3">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <kbd className="crm-text-xs inline-flex items-center rounded border border-gray-200 px-2 py-1 text-gray-500">
            <Command className="mr-1 h-3 w-3" />
            K
          </kbd>
        </div>
      </div>

      {/* Search Results */}
      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {loading && (
            <div className="p-4 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="crm-text-sm mt-2 text-gray-500">Searching...</p>
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="p-4 text-center">
              <p className="crm-text-sm text-gray-500">
                No results found for "
                {query}
                "
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              <div className="crm-text-xs crm-font-semibold border-b border-gray-100 px-3 py-2 tracking-wide text-gray-500 uppercase">
                Search Results (
                {results.length}
                )
              </div>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`
                    crm-flex crm-items-center crm-gap-3 w-full px-3 py-3 text-left transition-colors hover:bg-gray-50
                    ${index === selectedIndex ? 'border-r-2 border-blue-600 bg-blue-50' : ''}
                  `}
                >
                  <div className="crm-flex crm-items-center h-8 w-8 flex-shrink-0 justify-center rounded-full bg-gray-100">
                    <result.icon className={`h-4 w-4 ${result.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="crm-text-sm crm-font-medium truncate text-gray-900">
                      {result.title}
                    </div>
                    <div className="crm-text-xs truncate text-gray-500">
                      {result.subtitle}
                    </div>
                    {result.description && (
                      <div className="crm-text-xs mt-1 truncate text-gray-400">
                        {result.description}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {!loading && query && (
            <div className="bg-gray-25 border-t border-gray-100 px-3 py-2">
              <p className="crm-text-xs text-gray-500">
                Press
                {' '}
                <kbd className="crm-text-xs rounded bg-gray-200 px-1 py-0.5">↑↓</kbd>
                {' '}
                to navigate,
                <kbd className="crm-text-xs ml-1 rounded bg-gray-200 px-1 py-0.5">Enter</kbd>
                {' '}
                to select,
                <kbd className="crm-text-xs ml-1 rounded bg-gray-200 px-1 py-0.5">Esc</kbd>
                {' '}
                to close
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

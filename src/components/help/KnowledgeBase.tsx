'use client';

import {
  Book,
  ChevronRight,
  Clock,
  Database,
  ExternalLink,
  FileText,
  MessageCircle,
  Search,
  Settings,
  Shield,
  Star,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';

type KnowledgeBaseProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Article = {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: number;
  popularity: number;
  lastUpdated: string;
  content: string;
  tags: string[];
};

type Category = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  articleCount: number;
};

const categories: Category[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: Zap,
    description: 'Quick start guides and basic setup',
    articleCount: 8,
  },
  {
    id: 'contacts',
    name: 'Contact Management',
    icon: Users,
    description: 'Managing contacts and relationships',
    articleCount: 12,
  },
  {
    id: 'deals',
    name: 'Sales Pipeline',
    icon: FileText,
    description: 'Deal management and pipeline',
    articleCount: 10,
  },
  {
    id: 'data',
    name: 'Data Management',
    icon: Database,
    description: 'Import, export, and data quality',
    articleCount: 6,
  },
  {
    id: 'security',
    name: 'Security & Privacy',
    icon: Shield,
    description: 'Account security and data protection',
    articleCount: 5,
  },
  {
    id: 'advanced',
    name: 'Advanced Features',
    icon: Settings,
    description: 'Power user tips and tricks',
    articleCount: 15,
  },
];

const popularArticles: Article[] = [
  {
    id: '1',
    title: 'How to Import Contacts from CSV',
    description: 'Step-by-step guide to importing your contact data',
    category: 'data',
    readTime: 5,
    popularity: 95,
    lastUpdated: '2024-01-20',
    content: 'Complete guide to importing contacts...',
    tags: ['import', 'csv', 'contacts'],
  },
  {
    id: '2',
    title: 'Setting Up Your Sales Pipeline',
    description: 'Configure your deal stages and pipeline',
    category: 'deals',
    readTime: 8,
    popularity: 88,
    lastUpdated: '2024-01-18',
    content: 'Learn how to set up your sales pipeline...',
    tags: ['pipeline', 'deals', 'setup'],
  },
  {
    id: '3',
    title: 'Using Global Search Effectively',
    description: 'Master the Cmd+K search feature',
    category: 'advanced',
    readTime: 3,
    popularity: 82,
    lastUpdated: '2024-01-15',
    content: 'Global search tips and tricks...',
    tags: ['search', 'shortcuts', 'productivity'],
  },
  {
    id: '4',
    title: 'Contact Management Best Practices',
    description: 'Keep your contact data clean and organized',
    category: 'contacts',
    readTime: 6,
    popularity: 79,
    lastUpdated: '2024-01-12',
    content: 'Best practices for contact management...',
    tags: ['contacts', 'best-practices', 'organization'],
  },
  {
    id: '5',
    title: 'First Time Setup Guide',
    description: 'Get started with AWCRM in 5 minutes',
    category: 'getting-started',
    readTime: 5,
    popularity: 92,
    lastUpdated: '2024-01-22',
    content: 'Quick setup guide for new users...',
    tags: ['setup', 'getting-started', 'onboarding'],
  },
];

export function KnowledgeBase({ isOpen, onClose }: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = popularArticles.filter((article) => {
    const matchesSearch = searchQuery === ''
      || article.title.toLowerCase().includes(searchQuery.toLowerCase())
      || article.description.toLowerCase().includes(searchQuery.toLowerCase())
      || article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setSelectedArticle(null);
  };

  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleBack = () => {
    if (selectedArticle) {
      setSelectedArticle(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="bg-opacity-50 absolute inset-0 bg-black" onClick={onClose} />

      {/* Panel */}
      <div className="absolute top-0 right-0 h-full w-full max-w-4xl bg-white shadow-xl">
        <div className="crm-flex h-full flex-col">
          {/* Header */}
          <div className="crm-flex crm-items-center crm-justify-between border-b border-gray-200 p-6">
            <div className="crm-flex crm-items-center crm-gap-3">
              {(selectedArticle || selectedCategory) && (
                <button
                  onClick={handleBack}
                  className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </button>
              )}
              <Book className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="crm-text-xl crm-font-semibold text-gray-900">
                  {selectedArticle ? selectedArticle.title : 'Knowledge Base'}
                </h2>
                {selectedArticle && (
                  <p className="crm-text-sm text-gray-500">
                    {selectedArticle.readTime}
                    {' '}
                    min read • Updated
                    {selectedArticle.lastUpdated}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedArticle ? (
              /* Article View */
              <div className="p-6">
                <div className="prose max-w-none">
                  <div className="mb-6">
                    <div className="crm-flex crm-items-center crm-gap-4 mb-4">
                      <span className="crm-items-center crm-text-xs crm-font-medium inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-800">
                        {categories.find(c => c.id === selectedArticle.category)?.name}
                      </span>
                      <div className="crm-flex crm-items-center crm-gap-2 crm-text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {selectedArticle.readTime}
                        {' '}
                        min read
                      </div>
                      <div className="crm-flex crm-items-center crm-gap-2 crm-text-sm text-gray-500">
                        <Star className="h-4 w-4" />
                        {selectedArticle.popularity}
                        % helpful
                      </div>
                    </div>
                    <p className="crm-text-lg mb-6 text-gray-600">
                      {selectedArticle.description}
                    </p>
                  </div>

                  {/* Article Content */}
                  <div className="space-y-6">
                    {selectedArticle.id === '1' && (
                      <div>
                        <h3 className="crm-text-lg crm-font-semibold mb-4">How to Import Contacts from CSV</h3>
                        <div className="space-y-4">
                          <p>Importing contacts from a CSV file is one of the most common ways to get your data into AWCRM. Follow these steps:</p>

                          <h4 className="crm-text-md crm-font-medium">Step 1: Prepare Your Data</h4>
                          <ul className="list-disc space-y-2 pl-6">
                            <li>Download the CSV template from the import page</li>
                            <li>Format your data according to the template</li>
                            <li>Ensure required fields (First Name, Last Name) are filled</li>
                            <li>Validate email addresses</li>
                          </ul>

                          <h4 className="crm-text-md crm-font-medium">Step 2: Upload Your File</h4>
                          <ul className="list-disc space-y-2 pl-6">
                            <li>Go to Contacts → Import</li>
                            <li>Drag and drop your CSV file or click to browse</li>
                            <li>Choose import options (skip duplicates or update existing)</li>
                            <li>Click "Import Contacts"</li>
                          </ul>

                          <h4 className="crm-text-md crm-font-medium">Step 3: Review Results</h4>
                          <ul className="list-disc space-y-2 pl-6">
                            <li>Check the import summary</li>
                            <li>Review any errors and fix data if needed</li>
                            <li>Re-import corrected data if necessary</li>
                          </ul>

                          <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                            <h5 className="crm-text-sm crm-font-medium mb-2 text-blue-900">💡 Pro Tip</h5>
                            <p className="crm-text-sm text-blue-700">
                              Always test with a small sample of your data first to ensure the format is correct before importing your entire database.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedArticle.id === '2' && (
                      <div>
                        <h3 className="crm-text-lg crm-font-semibold mb-4">Setting Up Your Sales Pipeline</h3>
                        <div className="space-y-4">
                          <p>A well-configured sales pipeline is crucial for tracking your deals and forecasting revenue. Here's how to set it up:</p>

                          <h4 className="crm-text-md crm-font-medium">Understanding Pipeline Stages</h4>
                          <div className="space-y-2">
                            <div className="crm-flex crm-items-center crm-gap-3 rounded-md bg-gray-50 p-3">
                              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                              <span className="crm-font-medium">Prospecting (10%)</span>
                              {' '}
                              - Initial contact and research
                            </div>
                            <div className="crm-flex crm-items-center crm-gap-3 rounded-md bg-gray-50 p-3">
                              <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                              <span className="crm-font-medium">Qualification (25%)</span>
                              {' '}
                              - Qualified lead with budget and need
                            </div>
                            <div className="crm-flex crm-items-center crm-gap-3 rounded-md bg-gray-50 p-3">
                              <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                              <span className="crm-font-medium">Proposal (50%)</span>
                              {' '}
                              - Proposal sent and under review
                            </div>
                            <div className="crm-flex crm-items-center crm-gap-3 rounded-md bg-gray-50 p-3">
                              <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                              <span className="crm-font-medium">Negotiation (75%)</span>
                              {' '}
                              - Terms being negotiated
                            </div>
                          </div>

                          <h4 className="crm-text-md crm-font-medium">Best Practices</h4>
                          <ul className="list-disc space-y-2 pl-6">
                            <li>Move deals through stages based on actual progress</li>
                            <li>Adjust probabilities based on your experience</li>
                            <li>Set realistic expected close dates</li>
                            <li>Log activities for each deal interaction</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedArticle.id === '3' && (
                      <div>
                        <h3 className="crm-text-lg crm-font-semibold mb-4">Using Global Search Effectively</h3>
                        <div className="space-y-4">
                          <p>The global search feature (Cmd/Ctrl+K) is one of the most powerful tools in AWCRM. Here's how to use it effectively:</p>

                          <h4 className="crm-text-md crm-font-medium">Keyboard Shortcuts</h4>
                          <div className="space-y-2">
                            <div className="crm-flex crm-items-center crm-justify-between rounded-md bg-gray-50 p-3">
                              <span>Open global search</span>
                              <kbd className="crm-text-sm rounded bg-gray-200 px-2 py-1">Cmd/Ctrl + K</kbd>
                            </div>
                            <div className="crm-flex crm-items-center crm-justify-between rounded-md bg-gray-50 p-3">
                              <span>Navigate results</span>
                              <kbd className="crm-text-sm rounded bg-gray-200 px-2 py-1">↑ ↓</kbd>
                            </div>
                            <div className="crm-flex crm-items-center crm-justify-between rounded-md bg-gray-50 p-3">
                              <span>Open selected item</span>
                              <kbd className="crm-text-sm rounded bg-gray-200 px-2 py-1">Enter</kbd>
                            </div>
                            <div className="crm-flex crm-items-center crm-justify-between rounded-md bg-gray-50 p-3">
                              <span>Close search</span>
                              <kbd className="crm-text-sm rounded bg-gray-200 px-2 py-1">Escape</kbd>
                            </div>
                          </div>

                          <h4 className="crm-text-md crm-font-medium">Search Tips</h4>
                          <ul className="list-disc space-y-2 pl-6">
                            <li>Search by name, email, company, or phone number</li>
                            <li>Use partial matches for quick results</li>
                            <li>Search across contacts, companies, deals, and activities</li>
                            <li>Results appear instantly as you type</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="border-t pt-6">
                      <h4 className="crm-text-sm crm-font-medium mb-3 text-gray-900">Tags</h4>
                      <div className="crm-flex crm-gap-2 flex-wrap">
                        {selectedArticle.tags.map(tag => (
                          <span
                            key={tag}
                            className="crm-items-center crm-text-xs crm-font-medium inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="border-t pt-6">
                      <h4 className="crm-text-sm crm-font-medium mb-3 text-gray-900">Was this helpful?</h4>
                      <div className="crm-flex crm-gap-3">
                        <button className="crm-button crm-button-secondary crm-text-sm">
                          👍 Yes
                        </button>
                        <button className="crm-button crm-button-secondary crm-text-sm">
                          👎 No
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Main View */
              <div className="p-6">
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles, guides, and FAQs..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {!selectedCategory ? (
                  <>
                    {/* Categories */}
                    <div className="mb-8">
                      <h3 className="crm-text-lg crm-font-semibold mb-4 text-gray-900">Browse by Category</h3>
                      <div className="crm-gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {categories.map((category) => {
                          const IconComponent = category.icon;
                          return (
                            <button
                              key={category.id}
                              onClick={() => handleCategorySelect(category.id)}
                              className="rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                            >
                              <div className="crm-flex crm-items-center crm-gap-3 mb-2">
                                <IconComponent className="h-5 w-5 text-blue-600" />
                                <h4 className="crm-text-md crm-font-medium text-gray-900">{category.name}</h4>
                              </div>
                              <p className="crm-text-sm mb-2 text-gray-600">{category.description}</p>
                              <span className="crm-text-xs text-gray-500">
                                {category.articleCount}
                                {' '}
                                articles
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Popular Articles */}
                    <div>
                      <h3 className="crm-text-lg crm-font-semibold mb-4 text-gray-900">Popular Articles</h3>
                      <div className="space-y-3">
                        {filteredArticles.slice(0, 5).map(article => (
                          <button
                            key={article.id}
                            onClick={() => handleArticleSelect(article)}
                            className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                          >
                            <div className="crm-flex crm-items-start crm-justify-between">
                              <div className="flex-1">
                                <h4 className="crm-text-md crm-font-medium mb-1 text-gray-900">{article.title}</h4>
                                <p className="crm-text-sm mb-2 text-gray-600">{article.description}</p>
                                <div className="crm-flex crm-items-center crm-gap-4 crm-text-xs text-gray-500">
                                  <span className="crm-flex crm-items-center crm-gap-1">
                                    <Clock className="h-3 w-3" />
                                    {article.readTime}
                                    {' '}
                                    min
                                  </span>
                                  <span className="crm-flex crm-items-center crm-gap-1">
                                    <Star className="h-3 w-3" />
                                    {article.popularity}
                                    %
                                  </span>
                                  <span>{categories.find(c => c.id === article.category)?.name}</span>
                                </div>
                              </div>
                              <ChevronRight className="ml-4 h-4 w-4 text-gray-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Category View */
                  <div>
                    <div className="mb-6">
                      <h3 className="crm-text-lg crm-font-semibold text-gray-900">
                        {categories.find(c => c.id === selectedCategory)?.name}
                      </h3>
                      <p className="crm-text-sm text-gray-600">
                        {categories.find(c => c.id === selectedCategory)?.description}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {filteredArticles.map(article => (
                        <button
                          key={article.id}
                          onClick={() => handleArticleSelect(article)}
                          className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                        >
                          <div className="crm-flex crm-items-start crm-justify-between">
                            <div className="flex-1">
                              <h4 className="crm-text-md crm-font-medium mb-1 text-gray-900">{article.title}</h4>
                              <p className="crm-text-sm mb-2 text-gray-600">{article.description}</p>
                              <div className="crm-flex crm-items-center crm-gap-4 crm-text-xs text-gray-500">
                                <span className="crm-flex crm-items-center crm-gap-1">
                                  <Clock className="h-3 w-3" />
                                  {article.readTime}
                                  {' '}
                                  min
                                </span>
                                <span className="crm-flex crm-items-center crm-gap-1">
                                  <Star className="h-3 w-3" />
                                  {article.popularity}
                                  %
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="ml-4 h-4 w-4 text-gray-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="crm-text-md crm-font-medium mb-4 text-gray-900">Need More Help?</h3>
                  <div className="crm-gap-4 grid grid-cols-1 md:grid-cols-3">
                    <a
                      href="/docs/USER_GUIDE.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="crm-flex crm-items-center crm-gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="crm-text-sm crm-font-medium text-gray-900">User Guide</div>
                        <div className="crm-text-xs text-gray-500">Complete documentation</div>
                      </div>
                      <ExternalLink className="ml-auto h-4 w-4 text-gray-400" />
                    </a>
                    <a
                      href="/docs/API_REFERENCE.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="crm-flex crm-items-center crm-gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      <Video className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="crm-text-sm crm-font-medium text-gray-900">API Reference</div>
                        <div className="crm-text-xs text-gray-500">Developer documentation</div>
                      </div>
                      <ExternalLink className="ml-auto h-4 w-4 text-gray-400" />
                    </a>
                    <button className="crm-flex crm-items-center crm-gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="crm-text-sm crm-font-medium text-gray-900">Contact Support</div>
                        <div className="crm-text-xs text-gray-500">Get personalized help</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

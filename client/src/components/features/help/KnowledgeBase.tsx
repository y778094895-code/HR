import React, { useEffect, useMemo, useState } from 'react';
import { Search, BookOpen, FileText, ChevronRight, Clock3, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { helpService } from '@/services/resources/help.service';
import type { HelpArticle, HelpCategory } from '@/types/help';

const FALLBACK_CATEGORIES: HelpCategory[] = [
    { id: 'fallback-getting-started', title: 'Getting Started', articleCount: 0, slug: 'getting-started' },
    { id: 'fallback-performance', title: 'Performance Reviews', articleCount: 0, slug: 'performance-reviews' },
    { id: 'fallback-security', title: 'Account & Security', articleCount: 0, slug: 'account-security' },
    { id: 'fallback-troubleshooting', title: 'Troubleshooting', articleCount: 0, slug: 'troubleshooting' },
];

export function KnowledgeBase() {
    const { t } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<HelpCategory[]>([]);
    const [articles, setArticles] = useState<HelpArticle[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    const [isLoadingBase, setIsLoadingBase] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isBackendLimited, setIsBackendLimited] = useState(false);

    useEffect(() => {
        let alive = true;
        const loadBase = async () => {
            setIsLoadingBase(true);
            const [loadedCategories, loadedArticles] = await Promise.all([
                helpService.getCategories(),
                helpService.getPopularArticles(12),
            ]);

            if (!alive) return;

            const hasCategories = Array.isArray(loadedCategories) && loadedCategories.length > 0;
            const hasArticles = Array.isArray(loadedArticles) && loadedArticles.length > 0;

            setCategories(hasCategories ? loadedCategories : FALLBACK_CATEGORIES);
            setArticles(hasArticles ? loadedArticles : []);
            setIsBackendLimited(!hasCategories || !hasArticles);
            setIsLoadingBase(false);
        };

        loadBase();
        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        let alive = true;
        const query = searchQuery.trim();

        const runSearch = async () => {
            if (!query) return;

            setIsSearching(true);
            const result = await helpService.searchArticles({
                query,
                categoryId: selectedCategoryId || undefined,
                limit: 20,
                page: 1,
            });

            if (!alive) return;

            const safeArticles = Array.isArray(result?.articles) ? result.articles : [];
            setArticles(safeArticles);
            if (safeArticles.length === 0) setIsBackendLimited(true);
            setIsSearching(false);
        };

        runSearch();

        return () => {
            alive = false;
        };
    }, [searchQuery, selectedCategoryId]);

    const filteredArticles = useMemo(() => {
        const normalized = searchQuery.trim().toLowerCase();
        const safeArticles = Array.isArray(articles) ? articles : [];

        if (!normalized && !selectedCategoryId) return safeArticles;

        return safeArticles.filter((article) => {
            const title = (article?.title || '').toLowerCase();
            const categoryId = article?.categoryId || '';
            const categoryMatch = selectedCategoryId ? categoryId === selectedCategoryId : true;
            const queryMatch = normalized ? title.includes(normalized) : true;
            return categoryMatch && queryMatch;
        });
    }, [articles, searchQuery, selectedCategoryId]);

    const onCategorySelect = (categoryId: string) => {
        setSelectedCategoryId((prev) => (prev === categoryId ? null : categoryId));
    };

    const getReadTime = (article: HelpArticle) => {
        const value = typeof article?.readTime === 'number' && article.readTime > 0 ? article.readTime : 3;
        return `${value} min`;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative py-12 px-6 bg-primary/5 rounded-2xl text-center border border-primary/10">
                <h2 className="text-2xl font-bold mb-4">
                    {t('help.kbTitle', 'How can we help you today?')}
                </h2>
                <div className="max-w-xl mx-auto relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground rtl:right-3 rtl:left-auto" />
                    <input
                        type="text"
                        placeholder={t('help.searchPlaceholder', 'Search for articles, guides, or troubleshooting...')}
                        className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-3 rounded-xl border bg-background shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {isBackendLimited && (
                    <p className="mt-3 text-xs text-muted-foreground">
                        {t('help.backendLimited', 'Some help content is limited because backend endpoints are unavailable.')}
                    </p>
                )}
            </div>

            {!searchQuery && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">{t('help.browseCategories', 'Browse Categories')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(categories || FALLBACK_CATEGORIES).map((cat) => {
                            const isSelected = selectedCategoryId === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => onCategorySelect(cat.id)}
                                    className={`p-6 border rounded-xl bg-card hover:bg-muted/50 transition-colors text-left group ${isSelected ? 'border-primary ring-1 ring-primary/40' : ''
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <h4 className="font-semibold">{cat.title || t('help.uncategorized', 'Uncategorized')}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {(typeof cat.articleCount === 'number' ? cat.articleCount : 0)} {t('help.articles', 'articles')}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-lg font-semibold mb-4">
                    {searchQuery
                        ? t('help.searchResultsFor', { defaultValue: `Search Results for "{{query}}"`, query: searchQuery })
                        : t('help.popularArticles', 'Popular Articles')}
                </h3>

                {(isLoadingBase || isSearching) ? (
                    <div className="py-12 flex items-center justify-center text-muted-foreground gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t('common.loading', 'Loading...')}</span>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {filteredArticles.length > 0 ? (
                            filteredArticles.map((article) => (
                                <div
                                    key={article.id}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">{article.title || t('help.untitledArticle', 'Untitled article')}</div>
                                            <div className="text-xs text-muted-foreground flex gap-2 items-center">
                                                <span className="truncate">{article.category || t('help.general', 'General')}</span>
                                                <span>•</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock3 className="h-3 w-3" />
                                                    {getReadTime(article)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
                                {searchQuery
                                    ? t('help.noSearchResults', 'No articles found matching your search.')
                                    : t('help.noArticles', 'No articles are available yet.')}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

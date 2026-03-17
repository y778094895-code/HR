// ============================================================
// Help Center Service
//
// Handles help articles, categories, FAQs, and support tickets.
// Falls back gracefully when backend endpoints are unavailable.
// ============================================================

import { apiClient } from '../api/client';
import { normalizeKeys } from '../api/normalizers';
import type {
    HelpCategory,
    HelpArticle,
    HelpArticleDetail,
    FAQItem,
    FAQCategory,
    SupportTicket,
    CreateTicketRequest,
    TicketListParams,
    ApiTicketsResponse,
    HelpSearchParams,
    HelpSearchResult,
    ContactInfo,
    HelpServiceStatus,
} from '../../types/help';

class HelpService {
    // Track service availability
    private serviceStatus: HelpServiceStatus = {
        articlesAvailable: false,
        categoriesAvailable: false,
        ticketsAvailable: false,
        faqAvailable: false,
        searchAvailable: false,
    };

    /**
     * Get the current service availability status
     */
    getServiceStatus(): HelpServiceStatus {
        return { ...this.serviceStatus };
    }

    // ============================================================
    // HELP ARTICLES & CATEGORIES
    // ============================================================

    /**
     * Get all help categories
     */
    async getCategories(): Promise<HelpCategory[]> {
        try {
            const raw = await apiClient.get<unknown[]>('/help/categories');
            const categories = normalizeKeys<HelpCategory[]>(raw);
            this.serviceStatus.categoriesAvailable = true;
            return categories;
        } catch {
            this.serviceStatus.categoriesAvailable = false;
            return [];
        }
    }

    /**
     * Get articles by category
     */
    async getArticlesByCategory(categoryId: string): Promise<HelpArticle[]> {
        try {
            const raw = await apiClient.get<unknown[]>(`/help/categories/${categoryId}/articles`);
            return normalizeKeys<HelpArticle[]>(raw);
        } catch {
            return [];
        }
    }

    /**
     * Get a single article by ID
     */
    async getArticle(articleId: string): Promise<HelpArticleDetail | null> {
        try {
            const raw = await apiClient.get<unknown>(`/help/articles/${articleId}`);
            return normalizeKeys<HelpArticleDetail>(raw);
        } catch {
            return null;
        }
    }

    /**
     * Get all articles (with optional pagination)
     */
    async getArticles(page = 1, limit = 20): Promise<HelpArticle[]> {
        try {
            const raw = await apiClient.get<unknown[]>('/help/articles', {
                params: { page, limit }
            });
            return normalizeKeys<HelpArticle[]>(raw);
        } catch {
            return [];
        }
    }

    /**
     * Search help articles
     */
    async searchArticles(params: HelpSearchParams): Promise<HelpSearchResult> {
        try {
            const raw = await apiClient.get<unknown>('/help/search', { params });
            this.serviceStatus.searchAvailable = true;
            return normalizeKeys<HelpSearchResult>(raw);
        } catch {
            this.serviceStatus.searchAvailable = false;
            return { articles: [], total: 0, query: params.query };
        }
    }

    /**
     * Get popular/recent articles
     */
    async getPopularArticles(limit = 10): Promise<HelpArticle[]> {
        try {
            const raw = await apiClient.get<unknown[]>('/help/articles/popular', {
                params: { limit }
            });
            return normalizeKeys<HelpArticle[]>(raw);
        } catch {
            return [];
        }
    }

    // ============================================================
    // FAQ
    // ============================================================

    /**
     * Get all FAQ categories with items
     */
    async getFAQs(): Promise<FAQCategory[]> {
        try {
            const raw = await apiClient.get<unknown[]>('/help/faqs');
            this.serviceStatus.faqAvailable = true;
            return normalizeKeys<FAQCategory[]>(raw);
        } catch {
            this.serviceStatus.faqAvailable = false;
            return [];
        }
    }

    /**
     * Get FAQs by category
     */
    async getFAQsByCategory(categoryId: string): Promise<FAQItem[]> {
        try {
            const raw = await apiClient.get<unknown[]>(`/help/faqs/${categoryId}`);
            return normalizeKeys<FAQItem[]>(raw);
        } catch {
            return [];
        }
    }

    // ============================================================
    // SUPPORT TICKETS
    // ============================================================

    /**
     * Get user's support tickets
     */
    async getTickets(params?: TicketListParams): Promise<ApiTicketsResponse> {
        try {
            const raw = await apiClient.get<unknown>('/support/tickets', { params });
            this.serviceStatus.ticketsAvailable = true;
            return normalizeKeys<ApiTicketsResponse>(raw);
        } catch {
            this.serviceStatus.ticketsAvailable = false;
            return {
                data: [],
                total: 0,
                page: 1,
                limit: params?.limit || 10,
                totalPages: 0,
            };
        }
    }

    /**
     * Get a single ticket by ID
     */
    async getTicket(ticketId: string): Promise<SupportTicket | null> {
        try {
            const raw = await apiClient.get<unknown>(`/support/tickets/${ticketId}`);
            return normalizeKeys<SupportTicket>(raw);
        } catch {
            return null;
        }
    }

    /**
     * Create a new support ticket
     */
    async createTicket(request: CreateTicketRequest): Promise<SupportTicket | null> {
        try {
            const raw = await apiClient.post<unknown>('/support/tickets', request);
            this.serviceStatus.ticketsAvailable = true;
            return normalizeKeys<SupportTicket>(raw);
        } catch {
            return null;
        }
    }

    /**
     * Update ticket status
     */
    async updateTicketStatus(
        ticketId: string,
        status: string
    ): Promise<SupportTicket | null> {
        try {
            const raw = await apiClient.patch<unknown>(`/support/tickets/${ticketId}`, {
                status
            });
            return normalizeKeys<SupportTicket>(raw);
        } catch {
            return null;
        }
    }

    /**
     * Add message to ticket
     */
    async addTicketMessage(
        ticketId: string,
        content: string
    ): Promise<{ success: boolean } | null> {
        try {
            const raw = await apiClient.post<unknown>(`/support/tickets/${ticketId}/messages`, {
                content
            });
            return normalizeKeys<{ success: boolean }>(raw);
        } catch {
            return null;
        }
    }

    /**
     * Close a ticket
     */
    async closeTicket(ticketId: string): Promise<SupportTicket | null> {
        return this.updateTicketStatus(ticketId, 'Closed');
    }

    // ============================================================
    // CONTACT INFO
    // ============================================================

    /**
     * Get contact/support information
     */
    async getContactInfo(): Promise<ContactInfo> {
        try {
            const raw = await apiClient.get<unknown>('/support/contact');
            return normalizeKeys<ContactInfo>(raw);
        } catch {
            // Return default contact info - backend not available
            return this.getDefaultContactInfo();
        }
    }

    /**
     * Get available ticket priorities
     */
    async getTicketPriorities(): Promise<string[]> {
        try {
            const raw = await apiClient.get<unknown[]>('/support/priorities');
            return raw as string[];
        } catch {
            return ['Low', 'Medium', 'High', 'Critical'];
        }
    }

    /**
     * Get available ticket categories
     */
    async getTicketCategories(): Promise<string[]> {
        try {
            const raw = await apiClient.get<unknown[]>('/support/categories');
            return raw as string[];
        } catch {
            return [
                'Technical Issue',
                'Account & Access',
                'Data & Reports',
                'Feature Request',
                'General Inquiry',
                'Other'
            ];
        }
    }

    // ============================================================
    // DEFAULT FALLBACK DATA
    // ============================================================

    private getDefaultContactInfo(): ContactInfo {
        return {
            email: 'support@smart-hr.com',
            phone: '+1 (555) 123-4567',
            hours: 'Monday - Friday, 9:00 AM - 5:00 PM',
            website: 'https://smart-hr.com/support',
        };
    }

    /**
     * Check if the help service has any backend data available
     */
    async checkBackendAvailability(): Promise<HelpServiceStatus> {
        // Try to fetch minimal data to check availability
        await Promise.allSettled([
            this.getCategories(),
            this.getTickets({ limit: 1 }),
            this.getFAQs(),
        ]);
        return this.getServiceStatus();
    }
}

export const helpService = new HelpService();
export default helpService;


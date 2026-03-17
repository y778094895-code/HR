// Help Center Types
// Defines the shape of help content, articles, categories, and support tickets

export interface HelpCategory {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    articleCount: number;
    slug: string;
}

export interface HelpArticle {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    category: string;
    categoryId: string;
    readTime: number;
    author?: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    helpful?: number;
    views?: number;
}

export interface HelpArticleDetail extends HelpArticle {
    relatedArticles?: HelpArticle[];
    attachments?: ArticleAttachment[];
}

export interface ArticleAttachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface FAQCategory {
    id: string;
    name: string;
    description?: string;
    order?: number;
    faqs: FAQItem[];
}

// Support Ticket Types
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface SupportTicket {
    id: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    assignee?: TicketAssignee;
    messages?: TicketMessage[];
    attachments?: TicketAttachment[];
}

export interface TicketAssignee {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
}

export interface TicketMessage {
    id: string;
    content: string;
    author: {
        id: string;
        name: string;
        isStaff: boolean;
    };
    createdAt: string;
    attachments?: TicketAttachment[];
}

export interface TicketAttachment {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
}

export interface CreateTicketRequest {
    subject: string;
    description: string;
    priority: TicketPriority;
    category?: string;
    attachments?: File[];
}

export interface TicketListParams {
    status?: TicketStatus;
    priority?: TicketPriority;
    page?: number;
    limit?: number;
    search?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Help Search Types
export interface HelpSearchParams {
    query: string;
    categoryId?: string;
    page?: number;
    limit?: number;
}

export interface HelpSearchResult {
    articles: HelpArticle[];
    total: number;
    query: string;
}

// API Response Types
export interface ApiHelpResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiTicketsResponse extends PaginatedResponse<SupportTicket> {
    filters?: {
        status: TicketStatus[];
        priority: TicketPriority[];
    };
}

// Contact Info Types
export interface ContactInfo {
    email: string;
    phone: string;
    hours: string;
    website?: string;
    address?: string;
}

// Service Availability
export interface HelpServiceStatus {
    articlesAvailable: boolean;
    categoriesAvailable: boolean;
    ticketsAvailable: boolean;
    faqAvailable: boolean;
    searchAvailable: boolean;
}


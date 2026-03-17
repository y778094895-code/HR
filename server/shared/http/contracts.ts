import { randomUUID } from 'crypto';
import { Request } from 'express';

export interface CanonicalQuery {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
    search?: string;
    filters: Record<string, string | number | boolean | null>;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export function getCorrelationId(req: Request): string {
    const existing =
        (req.headers['x-correlation-id'] as string | undefined) ||
        (req.headers['x-request-id'] as string | undefined) ||
        (req as any).correlationId;

    return existing && existing.trim().length > 0 ? existing.trim() : randomUUID();
}

export function parseCanonicalQuery(query: any): CanonicalQuery {
    const page = normalizePositiveInt(query?.page, DEFAULT_PAGE);
    const pageSize = Math.min(
        normalizePositiveInt(query?.pageSize ?? query?.limit, DEFAULT_PAGE_SIZE),
        MAX_PAGE_SIZE
    );

    const sortBy = normalizeOptionalString(query?.sortBy);
    const sortOrder = normalizeSortOrder(query?.sortOrder ?? query?.order);
    const search = normalizeOptionalString(query?.search ?? query?.q);

    const reserved = new Set(['page', 'pageSize', 'limit', 'sortBy', 'sortOrder', 'order', 'search', 'q']);
    const filters: Record<string, string | number | boolean | null> = {};

    if (query && typeof query === 'object') {
        for (const [key, raw] of Object.entries(query)) {
            if (reserved.has(key)) continue;
            if (raw === undefined) continue;
            filters[key] = normalizeFilterValue(raw);
        }
    }

    return {
        page,
        pageSize,
        sortBy: sortBy || undefined,
        sortOrder,
        search: search || undefined,
        filters,
    };
}

function normalizePositiveInt(value: any, fallback: number): number {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return Math.floor(n);
}

function normalizeSortOrder(value: any): 'asc' | 'desc' {
    const normalized = String(value || '').toLowerCase();
    return normalized === 'asc' ? 'asc' : 'desc';
}

function normalizeOptionalString(value: any): string | null {
    if (value === undefined || value === null) return null;
    const str = String(value).trim();
    return str.length > 0 ? str : null;
}

function normalizeFilterValue(raw: any): string | number | boolean | null {
    if (raw === null) return null;
    if (Array.isArray(raw)) {
        const first = raw.length ? raw[0] : null;
        return first === null || first === undefined ? null : String(first);
    }

    const asString = String(raw).trim();
    if (asString.toLowerCase() === 'true') return true;
    if (asString.toLowerCase() === 'false') return false;
    if (asString.toLowerCase() === 'null') return null;

    const numeric = Number(asString);
    if (Number.isFinite(numeric) && asString !== '') return numeric;

    return asString;
}

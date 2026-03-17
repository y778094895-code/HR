/**
 * Users Payload Normalizer
 * 
 * Defensively normalizes user data from various backend response formats
 * to ensure consistent array output for frontend consumption.
 * 
 * Supported formats:
 * - array: [{ id: '1', ... }]
 * - null/undefined: returns []
 * - { data: [...] }: extracts data array
 * - { items: [...] }: extracts items array
 * - { users: [...] }: extracts users array
 * - { success: true, data: [...] }: extracts data from wrapped response
 * - { success: true, data: { users: [...] } }: extracts nested users array
 * - { success: true, data: { items: [...] } }: extracts nested items array
 * - { success: true, payload: [...] }: extracts payload array
 * - malformed: returns [] (only if no extractable users array found)
 */

import { User } from '@/types/users';

/**
 * Helper to filter valid User objects from an array
 */
function filterValidUsers(arr: unknown[]): User[] {
    return arr.filter((item): item is User => {
        return item !== null && typeof item === 'object' && 'id' in item;
    });
}

/**
 * Extract users array from various nested object structures
 */
function extractUsersFromObject(obj: Record<string, unknown>): User[] | null {
    // Priority order: payload, data, items, users
    
    // 1. Try { payload: [...] }
    if (Array.isArray(obj.payload)) {
        return filterValidUsers(obj.payload);
    }
    
    // 2. Try { data: [...] } - direct array
    if (Array.isArray(obj.data)) {
        return filterValidUsers(obj.data);
    }
    
    // 3. Try { items: [...] } - direct array
    if (Array.isArray(obj.items)) {
        return filterValidUsers(obj.items);
    }
    
    // 4. Try { users: [...] } - direct array
    if (Array.isArray(obj.users)) {
        return filterValidUsers(obj.users);
    }
    
    // 5. Try { data: { users: [...] } } - nested
    if (obj.data && typeof obj.data === 'object') {
        const data = obj.data as Record<string, unknown>;
        if (Array.isArray(data.users)) {
            return filterValidUsers(data.users);
        }
        if (Array.isArray(data.items)) {
            return filterValidUsers(data.items);
        }
        if (Array.isArray(data.data)) {
            return filterValidUsers(data.data);
        }
    }
    
    // 6. Try { data: { payload: [...] } } - nested payload
    if (obj.data && typeof obj.data === 'object') {
        const data = obj.data as Record<string, unknown>;
        if (Array.isArray(data.payload)) {
            return filterValidUsers(data.payload);
        }
    }
    
    return null;
}

export function normalizeUsers(payload: unknown): User[] {
    // Handle null/undefined
    if (payload === null || payload === undefined) {
        return [];
    }

    // Handle array directly
    if (Array.isArray(payload)) {
        return filterValidUsers(payload);
    }

    // Handle object with various wrapper formats
    if (typeof payload === 'object' && payload !== null) {
        const obj = payload as Record<string, unknown>;
        
        const extracted = extractUsersFromObject(obj);
        if (extracted !== null) {
            return extracted;
        }
    }

    // Malformed payload - return empty array (only if no extractable array found)
    console.warn('[normalizeUsers] Received malformed users payload:', payload);
    return [];
}

/**
 * Safely derive a displayable full name from user data.
 * Handles malformed/empty name fields gracefully.
 * 
 * @param user - User object with potential name fields
 * @returns A readable full name or fallback string
 */
export function getUserDisplayName(user: unknown): string {
    if (!user || typeof user !== 'object') {
        return 'Unknown User';
    }
    
    const u = user as Record<string, unknown>;
    
    // Try fullName first
    if (typeof u.fullName === 'string' && u.fullName.trim()) {
        const trimmed = u.fullName.trim();
        // Check for gibberish patterns (only special chars, numbers, or very short)
        if (trimmed.length >= 2 && /[a-zA-Z\u0600-\u06FF]/.test(trimmed)) {
            return trimmed;
        }
    }
    
    // Try firstName + lastName combination
    const firstName = u.firstName;
    const lastName = u.lastName;
    if (typeof firstName === 'string' || typeof lastName === 'string') {
        const parts = [
            typeof firstName === 'string' ? firstName : '',
            typeof lastName === 'string' ? lastName : ''
        ].filter(p => p && p.trim());
        
        if (parts.length > 0) {
            const combined = parts.join(' ').trim();
            if (combined.length >= 2) {
                return combined;
            }
        }
    }
    
    // Try username
    if (typeof u.username === 'string' && u.username.trim()) {
        const trimmed = u.username.trim();
        if (trimmed.length >= 2) {
            return trimmed;
        }
    }
    
    // Try email as last resort
    if (typeof u.email === 'string' && u.email.includes('@')) {
        const email = u.email.trim();
        // Extract name part before @ if it looks reasonable
        const namePart = email.split('@')[0];
        if (namePart && namePart.length >= 2) {
            return namePart;
        }
        return email; // Return full email as fallback
    }
    
    return 'Unknown User';
}

/**
 * Safely filter users array - never throws
 */
export function safeFilterUsers(users: unknown, predicate: (user: User) => boolean): User[] {
    const normalized = normalizeUsers(users);
    return normalized.filter(predicate);
}

/**
 * Safely map users array - never throws
 */
export function safeMapUsers<T>(users: unknown, mapper: (user: User) => T): T[] {
    const normalized = normalizeUsers(users);
    return normalized.map(mapper);
}


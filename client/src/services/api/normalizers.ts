// ============================================================
// Transport Boundary — Key Normalization Utilities (PR-02)
// ============================================================
//
// Backend responses may arrive in snake_case. The frontend contract
// (PR-01) uses camelCase exclusively. These helpers sit at the
// transport boundary so that no service or adapter leaks raw field names.
//
// If the backend already returns camelCase, normalizeKeys is a safe no-op.
// ============================================================

/**
 * Convert a single snake_case string to camelCase.
 *
 * @example snakeToCamel('overall_score') // 'overallScore'
 * @example snakeToCamel('alreadyCamel')  // 'alreadyCamel'
 */
export function snakeToCamel(str: string): string {
    return str.replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
}

/**
 * Recursively convert all object keys from snake_case to camelCase.
 *
 * - Arrays are traversed element-by-element.
 * - Primitives and nulls pass through unchanged.
 * - Already-camelCase keys are unaffected.
 */
export function normalizeKeys<T>(data: unknown): T {
    if (data === null || data === undefined) {
        return data as T;
    }

    if (Array.isArray(data)) {
        return data.map((item) => normalizeKeys(item)) as T;
    }

    if (typeof data === 'object' && data !== null) {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
            result[snakeToCamel(key)] = normalizeKeys(value);
        }
        return result as T;
    }

    // Primitives (string, number, boolean)
    return data as T;
}

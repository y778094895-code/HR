import { getApiUrl } from '../config/api';

interface RequestOptions extends RequestInit {
    token?: string;
}

export async function apiGet<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = getApiUrl(endpoint);
    const token = localStorage.getItem('auth_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText} (${response.status})`);
    }

    return response.json();
}

export async function apiPost<T>(endpoint: string, body: any, options: RequestOptions = {}): Promise<T> {
    return apiGet<T>(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
    });
}

// API Configuration
// Requests go to the API Gateway

// @ts-ignore - Ignore import.meta error during standalone tsc runs without esnext module context
const GATEWAY_URL = (import.meta as any).env.VITE_API_GATEWAY || 'http://localhost:8080/api';

export const API_CONFIG = {
    baseURL: GATEWAY_URL,

    // ML Service is now routed through the gateway at /ml
    mlServiceURL: `${GATEWAY_URL}/ml`,

    // Request timeout
    timeout: 30000,

    // WebSocket URL - derived from Gateway URL
    wsURL: GATEWAY_URL.replace('http', 'ws').replace('/api', ''),
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.baseURL}${endpoint}`;
};

// Helper function to get ML service URL
export const getMLServiceUrl = (endpoint: string): string => {
    return `${API_CONFIG.mlServiceURL}${endpoint}`;
};

export default API_CONFIG;

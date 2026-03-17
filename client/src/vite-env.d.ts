/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_GATEWAY?: string;
    readonly VITE_API_URL?: string;
    readonly VITE_FEATURE_FLAGS?: string;
    readonly BASE_URL: string;
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly SSR: boolean;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

import { StoreApi } from 'zustand';

export const createLoggingMiddleware = <T extends object>(
    storeName: string
) => (config: any) => (set: any, get: any, api: StoreApi<T>) => {
    const setWithLogging = (partial: any, replace?: boolean) => {
        const prevState = get();
        set(partial, replace);
        const nextState = get();

        // Log state changes in development
        if (import.meta.env.DEV) {
            console.groupCollapsed(`[${storeName}] State Update`);
            console.log('Previous:', prevState);
            console.log('Update:', partial);
            console.log('Next:', nextState);
            console.groupEnd();
        }
    };

    return config(setWithLogging, get, api);
};

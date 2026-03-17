import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface StoreActions<T> {
    set: (data: Partial<T> | ((state: T) => Partial<T>)) => void;
    reset: () => void;
}

interface StoreOptions<T> {
    name: string;
    initial: T;
    persist?: boolean;
    version?: number;
    middlewares?: Array<(config: any) => any>;
}

export function createStore<T extends object, A extends object>(
    options: StoreOptions<T>,
    actions: (set: any, get: any) => A
) {
    const { name, initial, persist: shouldPersist = true, version = 1 } = options;

    const initializer: StateCreator<T & A & StoreActions<T>> = (set, get) => ({
        ...initial,
        ...actions(set, get),
        set: (data) => set((state) => (typeof data === 'function' ? (data as any)(state) : data)),
        reset: () => set({ ...initial }),
    });

    let storeCreator = initializer;

    // Apply persistence if needed
    if (shouldPersist) {
        storeCreator = persist(initializer as any, {
            name: `${name}_v${version}`,
            storage: createJSONStorage(() => localStorage),
            partialize: (state: any) => {
                const { set, reset, ...persisted } = state;
                return persisted;
            },
        }) as any;
    }

    return create<T & A & StoreActions<T>>()(storeCreator);
}

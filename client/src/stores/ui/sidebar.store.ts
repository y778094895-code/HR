import { createStore } from '../base/base.store';

interface SidebarState {
    isOpen: boolean;
    isCollapsed: boolean;
}

const initialSidebar: SidebarState = {
    isOpen: true,
    isCollapsed: false,
};

export const useSidebarStore = createStore<SidebarState, any>(
    {
        name: 'sidebar',
        initial: initialSidebar,
        persist: true,
    },
    (set, get) => ({
        setOpen: (isOpen: boolean) => set({ isOpen }),
        setCollapsed: (isCollapsed: boolean) => set({ isCollapsed }),
        toggleOpen: () => set({ isOpen: !get().isOpen }),
        toggleCollapsed: () => set({ isCollapsed: !get().isCollapsed }),
        reset: () => set(initialSidebar),
    })
);

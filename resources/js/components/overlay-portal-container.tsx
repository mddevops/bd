'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

const OverlayPortalContainerContext = createContext<HTMLElement | null>(null);

/** Контейнер для Popover/Combobox внутри modal Dialog — иначе выпадашки блокируются hideOthers. */
export function OverlayPortalContainer({ children }: { children: ReactNode }) {
    const [container, setContainer] = useState<HTMLElement | null>(null);

    return (
        <OverlayPortalContainerContext.Provider value={container}>
            {children}
            <div
                ref={setContainer}
                data-slot="overlay-portal-container"
                className="pointer-events-none absolute size-0 overflow-visible"
                aria-hidden
            />
        </OverlayPortalContainerContext.Provider>
    );
}

export function useOverlayPortalContainer(): HTMLElement | null {
    return useContext(OverlayPortalContainerContext);
}

import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

import { type SharedData } from '@/types';

export type Tema = 'light' | 'dark' | 'system';
export type Menyu = 'sidebar' | 'top';

export interface NastroikiPolzovatelya {
    tema: Tema;
    menyu: Menyu;
}

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const applyTema = (tema: Tema) => {
    const isDark = tema === 'dark' || (tema === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const handleSystemThemeChange = () => {
    const currentTema = (localStorage.getItem('appearance') as Tema) || 'system';
    applyTema(currentTema);
};

export function initializeTheme() {
    const savedTema = (localStorage.getItem('appearance') as Tema) || 'system';

    applyTema(savedTema);
    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

export function useNastroiki() {
    const { auth } = usePage<SharedData>().props;
    const serverNastroiki = auth.user?.nastroiki;
    const [nastroiki, setNastroiki] = useState<NastroikiPolzovatelya>(
        serverNastroiki ?? {
            tema: (localStorage.getItem('appearance') as Tema) || 'system',
            menyu: 'sidebar',
        },
    );

    useEffect(() => {
        if (serverNastroiki) {
            setNastroiki(serverNastroiki);
            localStorage.setItem('appearance', serverNastroiki.tema);
            applyTema(serverNastroiki.tema);
        }
    }, [serverNastroiki]);

    const sohranit = useCallback(
        (izmeneniya: Partial<NastroikiPolzovatelya>) => {
            const novye = { ...nastroiki, ...izmeneniya };
            setNastroiki(novye);

            if (izmeneniya.tema) {
                localStorage.setItem('appearance', izmeneniya.tema);
                applyTema(izmeneniya.tema);
            }

            router.patch(route('appearance.update'), izmeneniya, {
                preserveScroll: true,
                preserveState: true,
            });
        },
        [nastroiki],
    );

    const updateTema = useCallback((tema: Tema) => sohranit({ tema }), [sohranit]);
    const updateMenyu = useCallback((menyu: Menyu) => sohranit({ menyu }), [sohranit]);

    return {
        nastroiki,
        updateTema,
        updateMenyu,
    };
}

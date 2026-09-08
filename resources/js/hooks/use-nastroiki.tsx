import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

import { type SharedData } from '@/types';

export type Tema = 'light' | 'dark' | 'system';
export type Menyu = 'sidebar' | 'top';

export interface NastroikiPolzovatelya {
    tema: Tema;
    menyu: Menyu;
}

const TEMA_KEY = 'appearance';
const MENYU_KEY = 'menyu';

const defaultNastroiki: NastroikiPolzovatelya = {
    tema: 'system',
    menyu: 'sidebar',
};

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const applyTema = (tema: Tema) => {
    const isDark = tema === 'dark' || (tema === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const handleSystemThemeChange = () => {
    const currentTema = (localStorage.getItem(TEMA_KEY) as Tema) || 'system';
    applyTema(currentTema);
};

function isTema(value: string | null): value is Tema {
    return value === 'light' || value === 'dark' || value === 'system';
}

function isMenyu(value: string | null): value is Menyu {
    return value === 'sidebar' || value === 'top';
}

function readLocalNastroiki(): Partial<NastroikiPolzovatelya> {
    const tema = localStorage.getItem(TEMA_KEY);
    const menyu = localStorage.getItem(MENYU_KEY);

    return {
        ...(isTema(tema) ? { tema } : {}),
        ...(isMenyu(menyu) ? { menyu } : {}),
    };
}

function writeLocalNastroiki(nastroiki: Partial<NastroikiPolzovatelya>) {
    if (nastroiki.tema) {
        localStorage.setItem(TEMA_KEY, nastroiki.tema);
    }

    if (nastroiki.menyu) {
        localStorage.setItem(MENYU_KEY, nastroiki.menyu);
    }
}

function mergeNastroiki(
    server: NastroikiPolzovatelya | null | undefined,
    local: Partial<NastroikiPolzovatelya> = readLocalNastroiki(),
): NastroikiPolzovatelya {
    return {
        ...defaultNastroiki,
        ...(server ?? {}),
        // localStorage переживает устаревший Inertia prefetch (Профиль/Пароль).
        ...local,
    };
}

export function initializeTheme() {
    const savedTema = readLocalNastroiki().tema ?? 'system';

    applyTema(savedTema);
    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

export function useNastroiki() {
    const { auth } = usePage<SharedData>().props;
    const serverNastroiki = auth.user?.nastroiki;
    const [nastroiki, setNastroiki] = useState<NastroikiPolzovatelya>(() => mergeNastroiki(serverNastroiki));

    useEffect(() => {
        const next = mergeNastroiki(serverNastroiki);
        setNastroiki(next);
        writeLocalNastroiki(next);
        applyTema(next.tema);
    }, [serverNastroiki]);

    const sohranit = useCallback(
        (izmeneniya: Partial<NastroikiPolzovatelya>) => {
            const novye = { ...nastroiki, ...izmeneniya };
            setNastroiki(novye);
            writeLocalNastroiki(novye);

            if (izmeneniya.tema) {
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

import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function useDostup() {
    const { auth } = usePage<SharedData>().props;

    const estPravo = (pravo: string): boolean => {
        return auth.prava.includes(pravo);
    };

    const estOdnoIzPrav = (prava: string[]): boolean => {
        return prava.some((pravo) => auth.prava.includes(pravo));
    };

    const estRol = (rol: string): boolean => {
        return auth.roli.includes(rol);
    };

    return {
        prava: auth.prava,
        roli: auth.roli,
        estPravo,
        estOdnoIzPrav,
        estRol,
    };
}

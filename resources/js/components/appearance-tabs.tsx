import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNastroiki, type Tema } from '@/hooks/use-nastroiki';

export type Appearance = Tema;

export function useAppearance() {
    const { nastroiki, updateTema } = useNastroiki();

    return {
        appearance: nastroiki.tema,
        updateAppearance: updateTema,
    };
}

const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Светлая' },
    { value: 'dark', icon: Moon, label: 'Тёмная' },
    { value: 'system', icon: Monitor, label: 'Системная' },
];

export default function AppearanceTabs() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <Tabs value={appearance} onValueChange={(value) => updateAppearance(value as Appearance)}>
            <TabsList>
                {tabs.map(({ value, icon: Icon, label }) => (
                    <TabsTrigger key={value} value={value}>
                        <Icon />
                        {label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}

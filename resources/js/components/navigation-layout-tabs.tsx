import { PanelLeft, PanelTop, type LucideIcon } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNastroiki, type Menyu } from '@/hooks/use-nastroiki';

const tabs: { value: Menyu; icon: LucideIcon; label: string }[] = [
    { value: 'sidebar', icon: PanelLeft, label: 'Сбоку' },
    { value: 'top', icon: PanelTop, label: 'Сверху' },
];

export default function NavigationLayoutTabs() {
    const { nastroiki, updateMenyu } = useNastroiki();

    return (
        <Tabs value={nastroiki.menyu} onValueChange={(value) => updateMenyu(value as Menyu)}>
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

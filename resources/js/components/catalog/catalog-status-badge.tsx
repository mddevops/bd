import { Badge } from '@/components/ui/badge';

interface CatalogStatusBadgeProps {
    active: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
}

export function CatalogStatusBadge({
    active,
    activeLabel = 'Активна',
    inactiveLabel = 'Неактивна',
}: CatalogStatusBadgeProps) {
    return <Badge variant={active ? 'default' : 'secondary'}>{active ? activeLabel : inactiveLabel}</Badge>;
}

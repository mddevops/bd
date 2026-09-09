import { router } from '@inertiajs/react';
import { RotateCcw, Trash2 } from 'lucide-react';

import { ActionBarItem } from '@/components/ui/action-bar';
import { useConfirmAction } from '@/hooks/use-confirm-action';
import { formatRussianCount } from '@/lib/russian-plural';
import { cn } from '@/lib/utils';

interface Props {
    selectedIds: number[];
    clearSelection: () => void;
    trashedOnly: boolean;
    destroyRoute: string;
    restoreRoute: string;
    forceDestroyRoute: string;
    only?: string[];
}

export function VehicleBulkTrashActions({
    selectedIds,
    clearSelection,
    trashedOnly,
    destroyRoute,
    restoreRoute,
    forceDestroyRoute,
    only,
}: Props) {
    const { confirmAction, ConfirmActionModal } = useConfirmAction();
    const countLabel = formatRussianCount(selectedIds.length, ['автомобиль', 'автомобиля', 'автомобилей']);

    const postAction = (url: string) => {
        router.post(
            url,
            { ids: selectedIds },
            {
                preserveScroll: true,
                only,
                onSuccess: () => clearSelection(),
            },
        );
    };

    const handleSoftDelete = async () => {
        const confirmed = await confirmAction({
            title: 'Переместить в удалённые?',
            description: `Вы хотите переместить ${countLabel} в удалённые. Записи останутся в базе и их можно будет восстановить.`,
            confirmLabel: 'Удалить',
            cancelLabel: 'Отмена',
            variant: 'destructive',
        });

        if (!confirmed) {
            return;
        }

        postAction(destroyRoute);
    };

    const handleRestore = async () => {
        const confirmed = await confirmAction({
            title: 'Восстановить выбранные?',
            description: `Вы хотите восстановить ${countLabel}.`,
            confirmLabel: 'Восстановить',
            cancelLabel: 'Отмена',
        });

        if (!confirmed) {
            return;
        }

        postAction(restoreRoute);
    };

    const handleForceDelete = async () => {
        const confirmed = await confirmAction({
            title: 'Удалить навсегда?',
            description: `Вы хотите удалить ${countLabel} без возможности восстановления.`,
            confirmLabel: 'Удалить навсегда',
            cancelLabel: 'Отмена',
            variant: 'destructive',
        });

        if (!confirmed) {
            return;
        }

        postAction(forceDestroyRoute);
    };

    return (
        <>
            {trashedOnly ? (
                <>
                    <ActionBarItem onSelect={(event) => event.preventDefault()} onClick={handleRestore}>
                        <RotateCcw />
                        Восстановить
                    </ActionBarItem>
                    <ActionBarItem
                        onSelect={(event) => event.preventDefault()}
                        onClick={handleForceDelete}
                        className={cn(
                            'bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive',
                        )}
                    >
                        <Trash2 />
                        Удалить навсегда
                    </ActionBarItem>
                </>
            ) : (
                <ActionBarItem
                    onSelect={(event) => event.preventDefault()}
                    onClick={handleSoftDelete}
                    className={cn('bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive')}
                >
                    <Trash2 />
                    Удалить
                </ActionBarItem>
            )}

            <ConfirmActionModal />
        </>
    );
}

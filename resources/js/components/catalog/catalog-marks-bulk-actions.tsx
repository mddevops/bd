import { router } from '@inertiajs/react';
import { CircleCheck, Download, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';

import { ActionBarItem } from '@/components/ui/action-bar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConfirmAction } from '@/hooks/use-confirm-action';
import { formatRussianCount } from '@/lib/russian-plural';
import { cn } from '@/lib/utils';

interface Props {
    selectedIds: number[];
    clearSelection: () => void;
}

export function CatalogMarksBulkActions({ selectedIds, clearSelection }: Props) {
    const only = ['marks', 'state', 'filters', 'flash'];
    const { confirmAction, ConfirmActionModal } = useConfirmAction();

    const updateStatus = (status: boolean) => {
        router.post(
            route('catalog.marks.bulk.status'),
            { ids: selectedIds, status },
            {
                preserveScroll: true,
                only,
                onSuccess: () => clearSelection(),
            },
        );
    };

    const handleExport = () => {
        const url = new URL(route('catalog.marks.export'), window.location.origin);
        selectedIds.forEach((id) => url.searchParams.append('ids[]', String(id)));
        window.location.assign(url.toString());
        toast.add({
            type: 'success',
            description: 'Экспорт марок начат',
        });
    };

    const handleDelete = async () => {
        const countLabel = formatRussianCount(selectedIds.length, ['марку', 'марки', 'марок']);

        const confirmed = await confirmAction({
            title: 'Удалить выбранные марки?',
            description: `Вы хотите удалить ${countLabel}. Это действие нельзя отменить.`,
            confirmLabel: 'Удалить',
            cancelLabel: 'Отмена',
            variant: 'destructive',
        });

        if (!confirmed) {
            return;
        }

        router.post(
            route('catalog.marks.bulk.destroy'),
            { ids: selectedIds },
            {
                preserveScroll: true,
                only,
                onSuccess: () => clearSelection(),
            },
        );
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <ActionBarItem onSelect={(event) => event.preventDefault()}>
                        <CircleCheck />
                        Статус
                    </ActionBarItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                    <DropdownMenuItem onClick={() => updateStatus(true)}>Активна</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus(false)}>Неактивна</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ActionBarItem onSelect={(event) => event.preventDefault()} onClick={handleExport}>
                <Download />
                Экспорт
            </ActionBarItem>

            <ActionBarItem
                onSelect={(event) => event.preventDefault()}
                onClick={handleDelete}
                className={cn('bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive')}
            >
                <Trash2 />
                Удалить
            </ActionBarItem>

            <ConfirmActionModal />
        </>
    );
}

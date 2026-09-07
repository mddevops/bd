import { Link, router } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConfirmAction } from '@/hooks/use-confirm-action';
import { useDostup } from '@/hooks/use-dostup';

interface CatalogRowActionsProps {
    editHref: string;
    destroyRoute: string;
    /** Название записи для заголовка модалки */
    recordName?: string;
    /** Заголовок модалки удаления */
    deleteTitle?: string;
    /** Текст под заголовком */
    deleteDescription?: string;
    /** @deprecated Используйте deleteDescription */
    confirmMessage?: string;
}

export function CatalogRowActions({
    editHref,
    destroyRoute,
    recordName,
    deleteTitle,
    deleteDescription,
    confirmMessage,
}: CatalogRowActionsProps) {
    const { estPravo } = useDostup();
    const { confirmAction, ConfirmActionModal } = useConfirmAction();

    if (!estPravo('catalog.manage')) {
        return null;
    }

    const title = deleteTitle ?? (recordName ? `Удалить «${recordName}»?` : 'Удалить запись?');
    const description =
        deleteDescription ??
        confirmMessage ??
        'Вы хотите удалить эту запись? Это действие нельзя отменить.';

    const handleDelete = async () => {
        const confirmed = await confirmAction({
            title,
            description,
            confirmLabel: 'Удалить',
            cancelLabel: 'Отмена',
            variant: 'destructive',
        });

        if (!confirmed) {
            return;
        }

        router.delete(destroyRoute);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={editHref}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Редактировать
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmActionModal />
        </>
    );
}

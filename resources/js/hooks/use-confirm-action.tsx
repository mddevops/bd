import { useCallback, useState } from 'react';

import { ConfirmActionDialog, type ConfirmActionOptions } from '@/components/confirm-action-dialog';

interface PendingConfirm extends ConfirmActionOptions {
    resolve: (confirmed: boolean) => void;
}

export function useConfirmAction() {
    const [pending, setPending] = useState<PendingConfirm | null>(null);

    const confirmAction = useCallback((options: ConfirmActionOptions) => {
        return new Promise<boolean>((resolve) => {
            setPending({ ...options, resolve });
        });
    }, []);

    const handleOpenChange = (open: boolean) => {
        if (!open && pending) {
            pending.resolve(false);
            setPending(null);
        }
    };

    const handleConfirm = () => {
        pending?.resolve(true);
        setPending(null);
    };

    const ConfirmActionModal = () =>
        pending ? (
            <ConfirmActionDialog
                open
                onOpenChange={handleOpenChange}
                title={pending.title}
                description={pending.description}
                confirmLabel={pending.confirmLabel}
                cancelLabel={pending.cancelLabel}
                variant={pending.variant}
                onConfirm={handleConfirm}
            />
        ) : null;

    return {
        confirmAction,
        ConfirmActionModal,
    };
}

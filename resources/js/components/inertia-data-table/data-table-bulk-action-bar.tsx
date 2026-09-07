import { X } from 'lucide-react';

import {
    ActionBar,
    ActionBarClose,
    ActionBarGroup,
    ActionBarSelection,
    ActionBarSeparator,
} from '@/components/ui/action-bar';

interface DataTableBulkActionBarProps {
    open: boolean;
    selectedCount: number;
    onOpenChange: (open: boolean) => void;
    onClearSelection: () => void;
    children: React.ReactNode;
}

export function DataTableBulkActionBar({
    open,
    selectedCount,
    onOpenChange,
    onClearSelection,
    children,
}: DataTableBulkActionBarProps) {
    return (
        <ActionBar open={open} onOpenChange={onOpenChange}>
            <ActionBarSelection>
                <span>{selectedCount}</span>
                <span>выбрано</span>
                <ActionBarSeparator />
                <ActionBarClose aria-label="Сбросить выбор" onClick={onClearSelection}>
                    <X />
                </ActionBarClose>
            </ActionBarSelection>

            <ActionBarSeparator />

            <ActionBarGroup>{children}</ActionBarGroup>
        </ActionBar>
    );
}

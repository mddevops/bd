'use client';

import { useId } from 'react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface SwitchActiveCardProps {
    id?: string;
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
}

/** Карточка-переключатель из @shadcn-space/switch-01 (active border effect). */
export function SwitchActiveCard({
    id,
    label,
    description,
    checked,
    onCheckedChange,
    className,
}: SwitchActiveCardProps) {
    const generatedId = useId();
    const switchId = id ?? generatedId;

    const toggle = () => onCheckedChange(!checked);

    return (
        <div
            className={cn(
                'relative flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input px-3 outline-none has-data-checked:border-primary/50',
                className,
            )}
            onClick={toggle}
        >
            <div className="flex min-w-0 grow items-center">
                <Label htmlFor={switchId} className="font-semibold leading-none" onClick={toggle}>
                    {label}
                </Label>
                {description ? (
                    <p id={`${switchId}-description`} className="ml-2 text-xs text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
            <Switch id={switchId} checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
        </div>
    );
}

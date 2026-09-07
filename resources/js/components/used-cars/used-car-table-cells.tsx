import { Check, ExternalLink } from 'lucide-react';

import { cn } from '@/lib/utils';

export function CellText({
    value,
    className,
}: {
    value: string | number | null | undefined;
    className?: string;
}) {
    if (value === null || value === undefined || value === '') {
        return <span className="opacity-50">—</span>;
    }

    return <span className={cn('whitespace-nowrap', className)}>{value}</span>;
}

export function formatMoney(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '—';
    }

    return value.toLocaleString('ru-RU');
}

export function CellMoney({ value }: { value: number | null | undefined }) {
    if (value === null || value === undefined) {
        return <span className="opacity-50">—</span>;
    }

    return <span className="whitespace-nowrap tabular-nums">{formatMoney(value)}</span>;
}

export function CellBool({ value }: { value: boolean | null | undefined }) {
    if (value === true) {
        return <Check className="mx-auto size-3.5" aria-label="Да" />;
    }

    return <span className="opacity-50">—</span>;
}

export function CellVolumePower({
    volume,
    power,
}: {
    volume: string | null | undefined;
    power: number | null | undefined;
}) {
    const volumeText = volume?.trim() || null;
    const powerText = power !== null && power !== undefined ? String(power) : null;

    if (!volumeText && !powerText) {
        return <span className="opacity-50">—</span>;
    }

    if (volumeText && powerText) {
        return (
            <span className="whitespace-nowrap tabular-nums">
                {volumeText} <span className="opacity-70">({powerText})</span>
            </span>
        );
    }

    return <span className="whitespace-nowrap tabular-nums">{volumeText ?? powerText}</span>;
}

export function CellExternalLink({ url, label }: { url: string | null | undefined; label: string }) {
    if (!url) {
        return <span className="opacity-50">—</span>;
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="inline-flex items-center gap-0.5 underline-offset-2 hover:underline"
            onClick={(event) => event.stopPropagation()}
        >
            <Check className="size-3.5" />
            <ExternalLink className="size-3 opacity-80" />
        </a>
    );
}

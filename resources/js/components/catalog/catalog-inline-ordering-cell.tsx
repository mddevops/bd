import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const COMMIT_DELAY_MS = 700;

function toInputValue(value: number | null | undefined): string {
    return value && value > 0 ? String(value) : '';
}

function normalizeDigits(raw: string): string {
    const digits = raw.replace(/\D/g, '');

    if (digits === '') {
        return '';
    }

    const asNumber = Number(digits);

    return asNumber > 0 ? String(asNumber) : '';
}

interface CatalogInlineOrderingCellProps {
    value: number | null;
    updateUrl: string;
    disabled?: boolean;
    only?: string[];
    className?: string;
}

/**
 * Инлайн-редактирование порядка в таблице.
 * Сохранение: пауза 700 мс после ввода, либо blur / Enter.
 * Escape — отмена. Пустое значение = без порядка.
 */
export function CatalogInlineOrderingCell({
    value,
    updateUrl,
    disabled = false,
    only,
    className,
}: CatalogInlineOrderingCellProps) {
    const serverValue = toInputValue(value);
    const [text, setText] = useState(serverValue);
    const [focused, setFocused] = useState(false);
    const [saving, setSaving] = useState(false);
    const committedRef = useRef(serverValue);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!focused) {
            setText(serverValue);
            committedRef.current = serverValue;
        }
    }, [serverValue, focused]);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const save = (raw: string) => {
        const normalized = normalizeDigits(raw);
        setText(normalized);

        if (normalized === committedRef.current) {
            return;
        }

        committedRef.current = normalized;
        setSaving(true);

        router.patch(
            updateUrl,
            { ordering: normalized === '' ? null : Number(normalized) },
            {
                preserveScroll: true,
                preserveState: true,
                only,
                onFinish: () => setSaving(false),
            },
        );
    };

    const scheduleSave = (raw: string) => {
        clearTimer();
        timerRef.current = setTimeout(() => save(raw), COMMIT_DELAY_MS);
    };

    if (disabled) {
        return <span className="text-muted-foreground">{serverValue || '—'}</span>;
    }

    return (
        <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={text}
            disabled={saving}
            placeholder="—"
            aria-label="Порядок"
            className={cn('h-8 w-16 px-2 text-center tabular-nums', className)}
            onFocus={() => setFocused(true)}
            onChange={(event) => {
                const next = event.target.value.replace(/\D/g, '');
                setText(next);
                scheduleSave(next);
            }}
            onBlur={() => {
                clearTimer();
                setFocused(false);
                save(text);
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    clearTimer();
                    save(text);
                    event.currentTarget.blur();
                }

                if (event.key === 'Escape') {
                    event.preventDefault();
                    clearTimer();
                    setText(committedRef.current);
                    setFocused(false);
                    event.currentTarget.blur();
                }
            }}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
        />
    );
}

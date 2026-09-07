import { LoaderCircle } from 'lucide-react';
import { useId } from 'react';

import { Label } from '@/components/ui/label';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { InputGroupAddon } from '@/components/ui/input-group';
import { SELECT_MAX_ITEMS } from '@/lib/select-limit';
import { cn } from '@/lib/utils';

export interface StaticComboboxOption {
    value: string;
    label: string;
    color?: string | null;
}

function OptionColorDot({ color, reserveSpace = false }: { color?: string | null; reserveSpace?: boolean }) {
    if (!color) {
        return reserveSpace ? <span className="inline-block size-2.5 shrink-0" aria-hidden /> : null;
    }

    return (
        <span
            className="inline-block size-2.5 shrink-0 rounded-full border border-black/10"
            style={{ backgroundColor: color }}
            aria-hidden
        />
    );
}

interface StaticSearchComboboxProps {
    label?: string;
    value: string;
    options: StaticComboboxOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    inputId?: string;
}

export function StaticSearchCombobox({
    label,
    value,
    options,
    onChange,
    placeholder,
    disabled = false,
    required = false,
    className,
    inputId: inputIdProp,
}: StaticSearchComboboxProps) {
    const generatedId = useId();
    const inputId = inputIdProp ?? generatedId;
    const selected = options.find((option) => option.value === value) ?? null;
    const showColorDots = options.some((option) => Boolean(option.color));

    return (
        <div className={cn('grid gap-2', className)}>
            {label ? (
                <Label htmlFor={inputId}>
                    {label}
                    {required ? <span className="text-destructive"> *</span> : null}
                </Label>
            ) : null}
            <Combobox
                items={options}
                value={selected}
                onValueChange={(option) => onChange(option?.value ?? '')}
                itemToStringLabel={(option) => option.label}
                isItemEqualToValue={(left, right) => left.value === right.value}
                limit={SELECT_MAX_ITEMS}
                disabled={disabled}
            >
                <ComboboxInput id={inputId} placeholder={placeholder} className="w-full" required={required}>
                    {showColorDots && selected?.color ? (
                        <InputGroupAddon align="inline-start">
                            <OptionColorDot color={selected.color} />
                        </InputGroupAddon>
                    ) : null}
                </ComboboxInput>
                <ComboboxContent>
                    <ComboboxEmpty>Ничего не найдено</ComboboxEmpty>
                    <ComboboxList>
                        {(option: StaticComboboxOption) => (
                            <ComboboxItem key={option.value} value={option}>
                                <span className="flex min-w-0 items-center gap-2">
                                    {showColorDots ? (
                                        <OptionColorDot color={option.color} reserveSpace />
                                    ) : null}
                                    <span className="truncate">{option.label}</span>
                                </span>
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}

interface AsyncSearchComboboxProps<T extends { id: number | string; label: string; optionLabel?: string }> {
    label?: string;
    value: T | null;
    items: T[];
    loading?: boolean;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
    required?: boolean;
    inputId?: string;
    error?: string;
    className?: string;
    onValueChange: (value: T | null) => void;
    onInputValueChange: (query: string) => void;
    onOpenChange?: (open: boolean) => void;
}

export function AsyncSearchCombobox<T extends { id: number | string; label: string; optionLabel?: string }>({
    label,
    value,
    items,
    loading = false,
    placeholder,
    disabled = false,
    allowClear = false,
    required = false,
    inputId: inputIdProp,
    error,
    className,
    onValueChange,
    onInputValueChange,
    onOpenChange,
}: AsyncSearchComboboxProps<T>) {
    const generatedId = useId();
    const inputId = inputIdProp ?? generatedId;

    return (
        <div className={cn('grid gap-2', className)}>
            {label ? (
                <Label htmlFor={inputId}>
                    {label}
                    {required ? <span className="text-destructive"> *</span> : null}
                </Label>
            ) : null}
            <div className="relative">
                <Combobox
                    items={items}
                    value={value}
                    onValueChange={(option) => onValueChange(option)}
                    onInputValueChange={(query) => onInputValueChange(query)}
                    onOpenChange={onOpenChange}
                    filter={null}
                    itemToStringLabel={(option) => option?.label ?? ''}
                    isItemEqualToValue={(left, right) => left.id === right.id}
                    limit={SELECT_MAX_ITEMS}
                    disabled={disabled || loading}
                >
                    <ComboboxInput
                        id={inputId}
                        placeholder={placeholder}
                        showClear={allowClear && !!value}
                        className="w-full"
                        required={required && !value}
                        aria-invalid={error ? true : undefined}
                    />
                    <ComboboxContent>
                        <ComboboxEmpty>{loading ? 'Загрузка…' : 'Ничего не найдено'}</ComboboxEmpty>
                        <ComboboxList>
                            {(option: T) => (
                                <ComboboxItem key={String(option.id)} value={option}>
                                    {option.optionLabel ?? option.label}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
                {loading ? (
                    <LoaderCircle className="text-muted-foreground pointer-events-none absolute top-1/2 right-10 size-4 -translate-y-1/2 animate-spin" />
                ) : null}
            </div>
        </div>
    );
}

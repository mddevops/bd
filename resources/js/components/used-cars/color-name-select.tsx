import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SELECT_MAX_ITEMS } from '@/lib/select-limit';
import { cn } from '@/lib/utils';

export interface ColorOption {
    name: string;
    hex: string | null;
}

interface Props {
    label?: string;
    value: string;
    options: ColorOption[];
    onChange: (value: string) => void;
    error?: string;
    className?: string;
}

function ColorDot({ hex, className }: { hex: string | null; className?: string }) {
    const isLight = hex
        ? ['#FFFFFF', '#D9D9D9', '#EAD7B7', '#FAE100', '#FFD700', '#FFB6C1', '#FFA940'].includes(hex.toUpperCase())
        : true;

    return (
        <span
            className={cn(
                'inline-block size-2 shrink-0 rounded-full border',
                isLight ? 'border-border' : 'border-transparent',
                !hex && 'border-dashed bg-muted',
                className,
            )}
            style={hex ? { backgroundColor: hex } : undefined}
            aria-hidden
        />
    );
}

export function ColorNameSelect({ label = 'Цвет', value, options, onChange, error, className }: Props) {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => setMounted(true), 50);
            return () => clearTimeout(timer);
        }

        setMounted(false);
    }, [open]);

    const selected = useMemo(() => {
        if (!value) {
            return null;
        }

        const fromDictionary = options.find((option) => option.name === value);
        if (fromDictionary) {
            return fromDictionary;
        }

        return { name: value, hex: null };
    }, [options, value]);

    const trimmed = query.trim();
    const lowered = trimmed.toLowerCase();
    const exactMatch = options.some((option) => option.name.toLowerCase() === lowered);
    const showCreate = trimmed.length > 0 && !exactMatch;

    const filtered = useMemo(
        () =>
            options
                .filter((option) => !lowered || option.name.toLowerCase().includes(lowered))
                .slice(0, SELECT_MAX_ITEMS),
        [lowered, options],
    );

    const handleCreate = () => {
        if (!trimmed) {
            return;
        }

        onChange(trimmed);
        setQuery('');
        setOpen(false);
    };

    return (
        <div className={cn('grid gap-2', className)}>
            {label ? <Label htmlFor={id}>{label}</Label> : null}

            <Popover
                open={open}
                onOpenChange={(nextOpen) => {
                    setOpen(nextOpen);
                    if (!nextOpen) {
                        setQuery('');
                    }
                }}
            >
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-invalid={error ? true : undefined}
                        className="border-input h-8 w-full justify-between px-2.5 font-normal"
                    >
                        {selected ? (
                            <span className="flex min-w-0 items-center gap-2">
                                <ColorDot hex={selected.hex} />
                                <span className="truncate">{selected.name}</span>
                            </span>
                        ) : (
                            <span className="text-muted-foreground truncate">Выберите или создайте цвет</span>
                        )}
                        <ChevronsUpDownIcon className="text-muted-foreground/80 size-4 shrink-0" aria-hidden />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="border-input w-[var(--radix-popover-trigger-width)] gap-0 p-0"
                    align="start"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    {mounted ? (
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder="Поиск или свой вариант…"
                                value={query}
                                onValueChange={setQuery}
                            />
                            <CommandList>
                                <CommandEmpty className={cn(showCreate && 'hidden')}>Цвет не найден.</CommandEmpty>
                                <CommandGroup>
                                    {filtered.map((option) => (
                                        <CommandItem
                                            key={option.name}
                                            value={option.name}
                                            data-checked={value === option.name ? true : undefined}
                                            onSelect={() => {
                                                onChange(option.name === value ? '' : option.name);
                                                setQuery('');
                                                setOpen(false);
                                            }}
                                            className="[&>svg:last-of-type]:hidden"
                                        >
                                            <span className="flex grow items-center gap-2">
                                                <ColorDot hex={option.hex} />
                                                {option.name}
                                            </span>
                                            <CheckIcon
                                                className={cn(
                                                    'size-4 transition-opacity',
                                                    value === option.name ? 'opacity-100' : 'opacity-0',
                                                )}
                                            />
                                        </CommandItem>
                                    ))}

                                    {showCreate ? (
                                        <CommandItem
                                            value={`__create__${trimmed}`}
                                            onSelect={handleCreate}
                                            className="text-muted-foreground [&>svg:last-of-type]:hidden"
                                        >
                                            <PlusIcon className="size-4 shrink-0" />
                                            Добавить
                                            <Badge
                                                variant="secondary"
                                                className="ml-1 rounded px-1.5 py-0 leading-5 font-medium"
                                            >
                                                {trimmed}
                                            </Badge>
                                        </CommandItem>
                                    ) : null}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    ) : null}
                </PopoverContent>
            </Popover>

            {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </div>
    );
}

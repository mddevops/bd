import { CheckIcon, PlusCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import { type DataTableFilterOption } from './types';

interface DataTableFacetedFilterProps {
    title: string;
    options: DataTableFilterOption[];
    value: string | null;
    onChange: (value: string | null) => void;
}

/** Faceted-фильтр как в tablecn/shadcn: Popover + Command, список виден сразу. */
export function DataTableFacetedFilter({ title, options, value, onChange }: DataTableFacetedFilterProps) {
    const [open, setOpen] = useState(false);
    const selected = options.find((option) => option.value === value) ?? null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed px-2.5">
                    {selected ? (
                        <span
                            role="button"
                            tabIndex={0}
                            className="mr-1.5 inline-flex rounded-full"
                            aria-label={`Сбросить фильтр ${title}`}
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onChange(null);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    onChange(null);
                                }
                            }}
                        >
                            <XCircle className="size-3.5" />
                        </span>
                    ) : (
                        <PlusCircle className="mr-1.5 size-3.5" />
                    )}
                    {title}
                    {selected ? (
                        <>
                            <Separator orientation="vertical" className="mx-1.5 h-4" />
                            <Badge variant="secondary" className="rounded-sm px-1 py-0 font-normal">
                                {selected.label}
                            </Badge>
                        </>
                    ) : null}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={title} />
                    <CommandList>
                        <CommandEmpty>Ничего не найдено</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = option.value === value;

                                return (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => {
                                            onChange(isSelected ? null : option.value);
                                            setOpen(false);
                                        }}
                                    >
                                        <span
                                            className={cn(
                                                'mr-2 flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary',
                                                isSelected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'opacity-50 [&_svg]:invisible',
                                            )}
                                        >
                                            <CheckIcon className="size-3.5" />
                                        </span>
                                        <span className="truncate">{option.label}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {selected ? (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => {
                                            onChange(null);
                                            setOpen(false);
                                        }}
                                        className="justify-center text-center"
                                    >
                                        Сбросить
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        ) : null}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

import type { Table } from '@tanstack/react-table';
import { Check, Settings2 } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DataTableViewOptionsProps<TData> {
    table: Table<TData>;
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
    const columns = useMemo(
        () => table.getAllColumns().filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide()),
        [table],
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto hidden h-8 px-2.5 lg:flex">
                    <Settings2 className="mr-1.5 size-3.5" />
                    Вид
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0" align="end">
                <Command>
                    <CommandInput placeholder="Колонки..." />
                    <CommandList>
                        <CommandEmpty>Колонки не найдены</CommandEmpty>
                        <CommandGroup>
                            {columns.map((column) => {
                                const label =
                                    (column.columnDef.meta as { label?: string } | undefined)?.label ?? column.id;

                                return (
                                    <CommandItem
                                        key={column.id}
                                        onSelect={() => column.toggleVisibility(!column.getIsVisible())}
                                        className="justify-between"
                                    >
                                        <span className="truncate">{label}</span>
                                        <Check className={cn('size-3.5', column.getIsVisible() ? 'opacity-100' : 'opacity-0')} />
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

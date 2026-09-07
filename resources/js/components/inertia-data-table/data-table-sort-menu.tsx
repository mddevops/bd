import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DataTableSortableColumn {
    id: string;
    label: string;
}

interface DataTableSortMenuProps {
    columns: DataTableSortableColumn[];
    sortCol: string;
    sortDir: string;
    onSort: (column: string) => void;
}

export function DataTableSortMenu({ columns, sortCol, sortDir, onSort }: DataTableSortMenuProps) {
    const activeCount = sortCol ? 1 : 0;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2.5">
                    <ArrowUpDown className="mr-1.5 size-3.5" />
                    Сортировка
                    {activeCount > 0 ? (
                        <Badge variant="secondary" className="ml-1.5 rounded-sm px-1 py-0 text-xs font-normal">
                            {activeCount}
                        </Badge>
                    ) : null}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="end">
                <Command>
                    <CommandInput placeholder="Колонка..." />
                    <CommandList>
                        <CommandEmpty>Ничего не найдено</CommandEmpty>
                        <CommandGroup>
                            {columns.map((column) => {
                                const isActive = sortCol === column.id;

                                return (
                                    <CommandItem key={column.id} onSelect={() => onSort(column.id)} className="justify-between">
                                        <span>{column.label}</span>
                                        {isActive ? (
                                            sortDir === 'asc' ? (
                                                <ArrowUp className="size-3.5" />
                                            ) : (
                                                <ArrowDown className="size-3.5" />
                                            )
                                        ) : (
                                            <span className={cn('size-3.5')} />
                                        )}
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

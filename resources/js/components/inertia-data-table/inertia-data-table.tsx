import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    Row,
    RowSelectionState,
    useReactTable,
    type VisibilityState,
} from '@tanstack/react-table';
import { GripVertical } from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { type PaginatedCollection } from '@/types/pagination';

import { DataTableBulkActionBar } from './data-table-bulk-action-bar';
import { DataTablePagination } from './data-table-pagination';
import { createDataTableSelectColumn } from './data-table-select-column';
import { DataTableToolbar } from './data-table-toolbar';
import { type DataTableSortableColumn } from './data-table-sort-menu';
import { type DataTableFilterField } from './types';

interface InertiaDataTableProps<TData extends { id: number }, TValue> {
    columns: ColumnDef<TData, TValue>[];
    paginator: PaginatedCollection<TData>;
    search: string | null | undefined;
    searchPlaceholder?: string;
    onSearch: (value: string) => void;
    toolbar?: React.ReactNode;
    filterFields?: DataTableFilterField[];
    onFilterChange?: (key: string, value: string | null, clearKeys?: string[]) => void;
    onFiltersChange?: (values: Record<string, string | null>) => void;
    onResetFilters?: () => void;
    sortColumns?: DataTableSortableColumn[];
    sortCol?: string;
    sortDir?: string;
    onSort?: (column: string) => void;
    onPerPageChange?: (limit: number) => void;
    perPageOptions?: number[];
    /** Включить перетаскивание строк (нужен onReorder). */
    reorderable?: boolean;
    onReorder?: (ids: number[]) => void;
    /** Чекбоксы и панель массовых действий снизу. */
    selectable?: boolean;
    bulkActions?: (context: { selectedIds: number[]; clearSelection: () => void }) => React.ReactNode;
    /** Клик по строке (игнорируется на кнопках/ссылках/инпутах). */
    onRowClick?: (row: TData) => void;
    /** Границы ячеек (grid). */
    cellBorders?: boolean;
    /** Стиль строки (например цвет статуса). */
    getRowStyle?: (row: TData) => CSSProperties | undefined;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) {
        return false;
    }

    return Boolean(target.closest('button, a, input, textarea, select, [role="button"], [data-row-ignore-dblclick]'));
}

function SortableTableRow<TData extends { id: number }>({
    row,
    disabled,
    selectable,
    onRowClick,
    cellBorders = false,
    rowStyle,
}: {
    row: Row<TData>;
    disabled?: boolean;
    selectable?: boolean;
    onRowClick?: (row: TData) => void;
    cellBorders?: boolean;
    rowStyle?: CSSProperties;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: String(row.original.id),
        disabled,
    });

    const style = {
        ...rowStyle,
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Отступы как у @diceui/data-table: дефолтные shadcn TableCell (p-4)
    const cellClass = cn(cellBorders && 'border-r border-b border-border last:border-r-0');

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={cn(
                isDragging && 'relative z-10 opacity-80',
                onRowClick && 'cursor-pointer',
                cellBorders && 'border-b-0 [&:last-child>td]:border-b-0',
                rowStyle && 'hover:brightness-95',
            )}
            data-dragging={isDragging || undefined}
            onClick={
                onRowClick
                    ? (event) => {
                          if (isInteractiveTarget(event.target)) {
                              return;
                          }

                          onRowClick(row.original);
                      }
                    : undefined
            }
        >
            {selectable
                ? row.getVisibleCells()
                      .filter((cell) => cell.column.id === 'select')
                      .map((cell) => (
                          <TableCell key={cell.id} className={cn('w-10', cellClass)}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                      ))
                : null}
            {!disabled ? (
                <TableCell className={cn('w-10', cellClass)}>
                    <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground inline-flex cursor-grab items-center rounded p-1 active:cursor-grabbing"
                        aria-label="Перетащить"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="size-4" />
                    </button>
                </TableCell>
            ) : null}
            {row.getVisibleCells().map((cell) => {
                if (cell.column.id === 'select') {
                    return null;
                }

                return (
                    <TableCell key={cell.id} className={cellClass}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                );
            })}
        </TableRow>
    );
}

export function InertiaDataTable<TData extends { id: number }, TValue>({
    columns,
    paginator,
    search,
    searchPlaceholder,
    onSearch,
    toolbar,
    filterFields,
    onFilterChange,
    onFiltersChange,
    onResetFilters,
    sortColumns,
    sortCol,
    sortDir,
    onSort,
    onPerPageChange,
    perPageOptions,
    reorderable = false,
    onReorder,
    selectable = false,
    bulkActions,
    onRowClick,
    cellBorders = false,
    getRowStyle,
}: InertiaDataTableProps<TData, TValue>) {
    const [rows, setRows] = useState(paginator.data);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    useEffect(() => {
        setRows(paginator.data);
    }, [paginator.data]);

    useEffect(() => {
        setRowSelection({});
    }, [paginator.data, paginator.current_page]);

    const tableColumns = useMemo(
        () => (selectable ? [createDataTableSelectColumn<TData>(), ...columns] : columns),
        [columns, selectable],
    );

    const selectedIds = useMemo(
        () =>
            Object.entries(rowSelection)
                .filter(([, selected]) => selected)
                .map(([id]) => Number(id)),
        [rowSelection],
    );

    const clearSelection = () => setRowSelection({});

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const table = useReactTable({
        data: rows,
        columns: tableColumns,
        state: { columnVisibility, rowSelection },
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: selectable,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => String(row.id),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    });

    const rowIds = useMemo(() => rows.map((row) => String(row.id)), [rows]);
    const canReorder = reorderable && Boolean(onReorder);
    const extraColumns = (canReorder ? 1 : 0) + (selectable ? 1 : 0);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || String(active.id) === String(over.id)) {
            return;
        }

        const oldIndex = rows.findIndex((row) => String(row.id) === String(active.id));
        const newIndex = rows.findIndex((row) => String(row.id) === String(over.id));

        if (oldIndex < 0 || newIndex < 0) {
            return;
        }

        const nextRows = arrayMove(rows, oldIndex, newIndex);
        setRows(nextRows);
        onReorder?.(nextRows.map((row) => row.id));
    };

    // Как @diceui/data-table: без сжатия, дефолтные TableHead (h-12 px-4) / TableCell (p-4)
    const cellClass = cn(cellBorders && 'border-r border-b border-border last:border-r-0');
    const headClass = cn(
        'bg-background whitespace-nowrap',
        cellBorders && 'border-r border-b border-border last:border-r-0',
    );

    const tableContent = (
        <div className="bg-background min-w-0 w-full overflow-hidden rounded-md border">
            <Table className="min-w-max">
                <TableHeader className="bg-background">
                    {table.getHeaderGroups().map((headerGroup) => {
                        const selectHeader = headerGroup.headers.find((header) => header.column.id === 'select');

                        return (
                        <TableRow key={headerGroup.id} className={cn('bg-background hover:bg-transparent', cellBorders && 'border-b-0')}>
                            {selectable && selectHeader ? (
                                <TableHead className={cn('w-10', headClass)}>
                                    {flexRender(selectHeader.column.columnDef.header, selectHeader.getContext())}
                                </TableHead>
                            ) : null}
                            {canReorder ? <TableHead className={cn('w-10', headClass)} /> : null}
                            {headerGroup.headers.map((header) => {
                                if (!header.column.getIsVisible() || header.column.id === 'select') {
                                    return null;
                                }

                                return (
                                    <TableHead key={header.id} className={headClass}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                        );
                    })}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => {
                            const rowStyle = getRowStyle?.(row.original);

                            return canReorder ? (
                                <SortableTableRow
                                    key={row.id}
                                    row={row}
                                    selectable={selectable}
                                    onRowClick={onRowClick}
                                    cellBorders={cellBorders}
                                    rowStyle={rowStyle}
                                />
                            ) : (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() ? 'selected' : undefined}
                                    style={rowStyle}
                                    className={cn(
                                        onRowClick && 'cursor-pointer',
                                        cellBorders && 'border-b-0 [&:last-child>td]:border-b-0',
                                        rowStyle && 'hover:brightness-95',
                                    )}
                                    onClick={
                                        onRowClick
                                            ? (event) => {
                                                  if (isInteractiveTarget(event.target)) {
                                                      return;
                                                  }

                                                  onRowClick(row.original);
                                              }
                                            : undefined
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className={cellClass}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={table.getVisibleLeafColumns().length + extraColumns}
                                className="h-24 text-center"
                            >
                                Нет данных
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className="flex min-w-0 w-full flex-col gap-2.5 overflow-auto">
            <DataTableToolbar
                table={table}
                search={search}
                placeholder={searchPlaceholder}
                onSearch={onSearch}
                filterFields={filterFields}
                onFilterChange={onFilterChange}
                onFiltersChange={onFiltersChange}
                onResetFilters={onResetFilters}
                sortColumns={sortColumns}
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={onSort}
            >
                {toolbar}
            </DataTableToolbar>

            {canReorder ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                        {tableContent}
                    </SortableContext>
                </DndContext>
            ) : (
                tableContent
            )}

            <DataTablePagination paginator={paginator} perPageOptions={perPageOptions} onPerPageChange={onPerPageChange} />

            {selectable && bulkActions ? (
                <DataTableBulkActionBar
                    open={selectedIds.length > 0}
                    selectedCount={selectedIds.length}
                    onOpenChange={(open) => {
                        if (!open) {
                            clearSelection();
                        }
                    }}
                    onClearSelection={clearSelection}
                >
                    {bulkActions({ selectedIds, clearSelection })}
                </DataTableBulkActionBar>
            ) : null}
        </div>
    );
}

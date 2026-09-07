import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { InertiaDataTable } from '@/components/inertia-data-table/inertia-data-table';
import { SortableHeader } from '@/components/inertia-data-table/sortable-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfirmAction } from '@/hooks/use-confirm-action';
import { useDostup } from '@/hooks/use-dostup';
import { useInertiaDataTable } from '@/hooks/use-inertia-data-table';
import AppLayout from '@/layouts/app-layout';
import { DictionariesLayout } from '@/layouts/dictionaries/layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { type PaginatedCollection, type TableState } from '@/types/pagination';

interface FieldMeta {
    label: string;
    type: 'text' | 'number' | 'boolean' | 'color';
    required?: boolean;
}

interface DictionaryMeta {
    type: string;
    label: string;
    primary_key: string;
    sortable: boolean;
    fields: Record<string, FieldMeta>;
}

interface MenuItem {
    type: string;
    label: string;
}

interface Row {
    id: number;
    ordering?: number | null;
    [key: string]: unknown;
}

interface Props {
    dictionary: DictionaryMeta;
    menu: MenuItem[];
    rows: PaginatedCollection<Row>;
    state: TableState;
}

function normalizeHex(value: unknown): string {
    const raw = String(value ?? '').trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(raw)) {
        return raw.toUpperCase();
    }
    return '#000000';
}

export default function DictionariesIndex({ dictionary, menu, rows, state }: Props) {
    const { estPravo } = useDostup();
    const canManage = estPravo('dictionaries.manage');
    const { confirmAction, ConfirmActionModal } = useConfirmAction();
    const { setSearch, toggleSort, setLimit, sortCol, sortDir } = useInertiaDataTable(state);

    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const canReorder =
        canManage && dictionary.sortable && (!sortCol || sortCol === 'ordering') && !state.search;

    const emptyValues = useMemo(() => {
        const values: Record<string, string | boolean | number | null> = {};
        Object.entries(dictionary.fields).forEach(([key, meta]) => {
            if (meta.type === 'boolean') {
                values[key] = true;
            } else if (meta.type === 'color') {
                values[key] = meta.required ? '#000000' : '';
            } else {
                values[key] = '';
            }
        });
        return values;
    }, [dictionary.fields]);

    const form = useForm(emptyValues);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Справочники', href: '/dictionaries' },
        { title: dictionary.label, href: route('dictionaries.index', dictionary.type) },
    ];

    const openCreate = () => {
        setEditingId(null);
        form.setData(emptyValues);
        form.clearErrors();
        setOpen(true);
    };

    const openEdit = (row: Row) => {
        setEditingId(row.id);
        const values: Record<string, string | boolean | number | null> = {};
        Object.entries(dictionary.fields).forEach(([key, meta]) => {
            if (meta.type === 'color') {
                values[key] = row[key] ? normalizeHex(row[key]) : '';
            } else if (meta.type === 'boolean') {
                values[key] = Boolean(row[key]);
            } else {
                values[key] = (row[key] as string | number | null) ?? '';
            }
        });
        form.setData(values);
        form.clearErrors();
        setOpen(true);
    };

    const handleDelete = async (row: Row) => {
        const nameColumn = Object.keys(dictionary.fields)[0];
        const recordName = nameColumn ? String(row[nameColumn] ?? '') : '';

        const confirmed = await confirmAction({
            title: recordName ? `Удалить «${recordName}»?` : 'Удалить запись?',
            description: 'Вы хотите удалить эту запись? Это действие нельзя отменить.',
            confirmLabel: 'Удалить',
            cancelLabel: 'Отмена',
            variant: 'destructive',
        });

        if (!confirmed) {
            return;
        }

        router.delete(route('dictionaries.destroy', [dictionary.type, row.id]), {
            preserveScroll: true,
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (editingId === null) {
            form.post(route('dictionaries.store', dictionary.type), {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            });
            return;
        }

        form.put(route('dictionaries.update', [dictionary.type, editingId]), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    const handleReorder = (ids: number[]) => {
        router.post(
            route('dictionaries.reorder', dictionary.type),
            { ids },
            {
                preserveScroll: true,
                only: ['rows', 'state', 'flash'],
            },
        );
    };

    const columns = useMemo<ColumnDef<Row>[]>(() => {
        const fieldColumns: ColumnDef<Row>[] = Object.entries(dictionary.fields).map(([key, meta]) => ({
            accessorKey: key,
            header: () => (
                <SortableHeader title={meta.label} column={key} sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
            ),
            cell: ({ row }) => {
                const value = row.original[key];
                if (meta.type === 'boolean') {
                    return value ? 'Да' : 'Нет';
                }
                if (meta.type === 'color') {
                    if (!value) {
                        return '—';
                    }
                    const hex = normalizeHex(value);
                    return (
                        <span className="inline-flex items-center gap-2">
                            <span
                                className={cn(
                                    'inline-block size-5 rounded-full border',
                                    hex === '#FFFFFF' ? 'border-border' : 'border-transparent',
                                )}
                                style={{ backgroundColor: hex }}
                            />
                            <span className="font-mono text-xs uppercase">{hex}</span>
                        </span>
                    );
                }
                return value === null || value === undefined || value === '' ? '—' : String(value);
            },
        }));

        const orderingColumn: ColumnDef<Row>[] = dictionary.sortable
            ? [
                  {
                      accessorKey: 'ordering',
                      header: () => (
                          <SortableHeader
                              title="Порядок"
                              column="ordering"
                              sortCol={sortCol}
                              sortDir={sortDir}
                              onSort={toggleSort}
                          />
                      ),
                      cell: ({ row }) => row.original.ordering ?? '—',
                  },
              ]
            : [];

        if (!canManage) {
            return [...orderingColumn, ...fieldColumns];
        }

        return [
            ...orderingColumn,
            ...fieldColumns,
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => openEdit(row.original)}>
                            <Pencil className="size-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive"
                            onClick={() => handleDelete(row.original)}
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    </div>
                ),
            },
        ];
    }, [canManage, dictionary, sortCol, sortDir, toggleSort]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Справочники — ${dictionary.label}`} />

            <div className="space-y-6 px-4 py-6">
                <HeadingSmall title="Справочники" description="Выберите справочник слева и управляйте записями" />

                <DictionariesLayout menu={menu} currentType={dictionary.type}>
                    <div className="space-y-2">
                        {dictionary.sortable && !canReorder && canManage ? (
                            <p className="text-muted-foreground text-xs">
                                Чтобы менять порядок перетаскиванием, сбросьте поиск и сортируйте по колонке «Порядок».
                            </p>
                        ) : null}
                        <InertiaDataTable
                            paginator={rows}
                            columns={columns}
                            search={state.search ?? ''}
                            onSearch={setSearch}
                            onPerPageChange={setLimit}
                            reorderable={canReorder}
                            onReorder={handleReorder}
                            toolbar={
                                canManage ? (
                                    <Button size="sm" className="h-8" onClick={openCreate}>
                                        <Plus className="mr-1.5 size-3.5" />
                                        Добавить
                                    </Button>
                                ) : null
                            }
                        />
                    </div>
                </DictionariesLayout>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingId === null ? 'Новая запись' : 'Редактирование'}</DialogTitle>
                        <DialogDescription>
                            {editingId === null
                                ? `Добавление записи в справочник «${dictionary.label}»`
                                : `Изменение записи в справочнике «${dictionary.label}»`}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        {Object.entries(dictionary.fields).map(([key, meta]) => (
                            <div key={key} className="grid gap-2">
                                {meta.type === 'boolean' ? (
                                    <label className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={Boolean(form.data[key])}
                                            onCheckedChange={(checked) => form.setData(key, checked === true)}
                                        />
                                        {meta.label}
                                    </label>
                                ) : meta.type === 'color' ? (
                                    <>
                                        <Label htmlFor={key}>{meta.label}</Label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                id={key}
                                                type="color"
                                                value={normalizeHex(form.data[key] || '#000000')}
                                                onChange={(event) => form.setData(key, event.target.value.toUpperCase())}
                                                className="size-10 cursor-pointer rounded-md border border-input bg-transparent p-1"
                                            />
                                            <Input
                                                value={String(form.data[key] ?? '')}
                                                onChange={(event) => form.setData(key, event.target.value.toUpperCase())}
                                                placeholder="#000000"
                                                className="font-mono uppercase"
                                                required={meta.required}
                                            />
                                            {!meta.required && form.data[key] ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2"
                                                    onClick={() => form.setData(key, '')}
                                                >
                                                    Сбросить
                                                </Button>
                                            ) : null}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Label htmlFor={key}>{meta.label}</Label>
                                        <Input
                                            id={key}
                                            type={meta.type === 'number' ? 'number' : 'text'}
                                            value={String(form.data[key] ?? '')}
                                            onChange={(event) =>
                                                form.setData(
                                                    key,
                                                    meta.type === 'number'
                                                        ? event.target.value === ''
                                                            ? ''
                                                            : Number(event.target.value)
                                                        : event.target.value,
                                                )
                                            }
                                            required={meta.required}
                                        />
                                    </>
                                )}
                                {form.errors[key] ? <p className="text-destructive text-sm">{form.errors[key]}</p> : null}
                            </div>
                        ))}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Отмена
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmActionModal />
        </AppLayout>
    );
}

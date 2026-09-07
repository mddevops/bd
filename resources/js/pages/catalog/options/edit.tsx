import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { OptionForm } from '@/components/catalog/option-form';
import AppLayout from '@/layouts/app-layout';
import CatalogLayout from '@/layouts/catalog/layout';
import { type BreadcrumbItem } from '@/types';

interface SelectedOption {
    id: number;
    label: string;
}

interface Option {
    id: number;
    name: string;
    parent_id: number | null;
    sort: number;
}

interface Props {
    option: Option;
    selectedParent: SelectedOption | null;
}

export default function CatalogOptionsEdit({ option, selectedParent }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

    const { data, setData, put, processing, errors } = useForm({
        name: option.name,
        parent_id: option.parent_id,
        sort: option.sort,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('catalog.options.update', option.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактирование: ${option.name}`} />
            <CatalogLayout>
                <OptionForm
                    title={option.name}
                    data={data}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    setData={setData}
                    cancelHref={route('catalog.options.index')}
                    selectedParent={selectedParent}
                    excludeId={option.id}
                />
            </CatalogLayout>
        </AppLayout>
    );
}

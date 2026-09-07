import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { OptionForm } from '@/components/catalog/option-form';
import AppLayout from '@/layouts/app-layout';
import CatalogLayout from '@/layouts/catalog/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

export default function CatalogOptionsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        parent_id: null as number | null,
        sort: 0,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('catalog.options.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создание опции" />
            <CatalogLayout>
                <OptionForm
                    title="Новая опция"
                    data={data}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    setData={setData}
                    cancelHref={route('catalog.options.index')}
                />
            </CatalogLayout>
        </AppLayout>
    );
}

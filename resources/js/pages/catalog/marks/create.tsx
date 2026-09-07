import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { MarkForm } from '@/components/catalog/mark-form';
import AppLayout from '@/layouts/app-layout';
import CatalogLayout from '@/layouts/catalog/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

export default function CatalogMarksCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        name_ru: '',
        url: '',
        logo_min: null as File | null,
        logo_big: null as File | null,
        country: '',
        ordering: '' as string | number,
        status: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('catalog.marks.store'), { forceFormData: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создание марки" />
            <CatalogLayout>
                <MarkForm
                    title="Новая марка"
                    data={data}
                        errors={errors}
                        processing={processing}
                        onSubmit={submit}
                        setData={setData}
                    cancelHref={route('catalog.marks.index')}
                />
            </CatalogLayout>
        </AppLayout>
    );
}

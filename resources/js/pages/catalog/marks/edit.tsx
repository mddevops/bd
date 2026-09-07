import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { MarkForm } from '@/components/catalog/mark-form';
import AppLayout from '@/layouts/app-layout';
import CatalogLayout from '@/layouts/catalog/layout';
import { type BreadcrumbItem } from '@/types';

interface Mark {
    id: number;
    name: string;
    name_ru: string | null;
    url: string;
    logo_min: string | null;
    logo_big: string | null;
    country: string | null;
    ordering: number | null;
    status: boolean;
}

interface Props {
    mark: Mark;
}

export default function CatalogMarksEdit({ mark }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        name: mark.name,
        name_ru: mark.name_ru ?? '',
        url: mark.url,
        logo_min: null as File | null,
        logo_big: null as File | null,
        country: mark.country ?? '',
        ordering: mark.ordering && mark.ordering > 0 ? mark.ordering : ('' as string | number),
        status: mark.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('catalog.marks.update', mark.id), { forceFormData: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактирование: ${mark.name}`} />
            <CatalogLayout>
                <MarkForm
                    title={mark.name}
                    data={data}
                        errors={errors}
                        processing={processing}
                        onSubmit={submit}
                        setData={setData}
                        cancelHref={route('catalog.marks.index')}
                        logoMinUrl={mark.logo_min}
                    logoBigUrl={mark.logo_big}
                />
            </CatalogLayout>
        </AppLayout>
    );
}

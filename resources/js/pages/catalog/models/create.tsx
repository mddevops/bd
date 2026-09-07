import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { ModelForm } from '@/components/catalog/model-form';
import AppLayout from '@/layouts/app-layout';
import CatalogLayout from '@/layouts/catalog/layout';
import { type BreadcrumbItem } from '@/types';

interface SelectedOption {
    id: number;
    label: string;
}

interface Props {
    selectedMark: SelectedOption | null;
    defaultMarkId: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

export default function CatalogModelsCreate({ selectedMark, defaultMarkId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        mark_id: defaultMarkId,
        name: '',
        name_ru: '',
        url: '',
        class: '',
        year_from: '' as string | number,
        year_to: '' as string | number,
        parent_id: null as number | null,
        ordering: '' as string | number,
        status: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('catalog.models.store'));
    };

    const cancelHref = data.mark_id ? route('catalog.models.index', { mark_id: data.mark_id }) : route('catalog.models.index');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создание модели" />
            <CatalogLayout>
                <ModelForm
                    title="Новая модель"
                    data={data}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    setData={setData}
                    cancelHref={cancelHref}
                    selectedMark={selectedMark}
                />
            </CatalogLayout>
        </AppLayout>
    );
}

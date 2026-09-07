import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { SerieForm } from '@/components/catalog/serie-form';
import AppLayout from '@/layouts/app-layout';
import CatalogLayout from '@/layouts/catalog/layout';
import { type BreadcrumbItem } from '@/types';

interface SelectedOption {
    id: number;
    label: string;
}

interface Props {
    selectedMark: SelectedOption | null;
    selectedModel: SelectedOption | null;
    selectedGeneration: SelectedOption | null;
    defaultMarkId: number | null;
    defaultModelId: number | null;
    defaultGenerationId: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

export default function CatalogSeriesCreate({
    selectedMark,
    selectedModel,
    selectedGeneration,
    defaultMarkId,
    defaultModelId,
    defaultGenerationId,
}: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        model_id: number | null;
        generation_id: number | null;
        name: string;
        url: string;
        image: File | null;
        status: boolean;
    }>({
        model_id: defaultModelId,
        generation_id: defaultGenerationId,
        name: '',
        url: '',
        image: null,
        status: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('catalog.series.store'), { forceFormData: true });
    };

    const indexParams: Record<string, number> = {};
    if (data.model_id) {
        indexParams.model_id = data.model_id;
    }
    if (data.generation_id) {
        indexParams.generation_id = data.generation_id;
    }
    const cancelHref = Object.keys(indexParams).length
        ? route('catalog.series.index', indexParams)
        : route('catalog.series.index');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создание серии" />
            <CatalogLayout>
                <SerieForm
                    title="Новая серия"
                    data={data}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    setData={setData}
                    cancelHref={cancelHref}
                    defaultMarkId={defaultMarkId}
                    selectedMark={selectedMark}
                    selectedModel={selectedModel}
                    selectedGeneration={selectedGeneration}
                />
            </CatalogLayout>
        </AppLayout>
    );
}

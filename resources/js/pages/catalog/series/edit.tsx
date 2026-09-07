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

interface Serie {
    id: number;
    model_id: number;
    generation_id: number;
    name: string;
    url: string;
    image: string | null;
    status: boolean;
}

interface Props {
    serie: Serie;
    selectedMark: SelectedOption | null;
    selectedModel: SelectedOption | null;
    selectedGeneration: SelectedOption | null;
    defaultMarkId: number | null;
    defaultModelId: number | null;
    defaultGenerationId: number | null;
}

export default function CatalogSeriesEdit({ serie, selectedMark, selectedModel, selectedGeneration, defaultMarkId }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        model_id: number | null;
        generation_id: number | null;
        name: string;
        url: string;
        image: File | null;
        status: boolean;
    }>({
        _method: 'put',
        model_id: serie.model_id,
        generation_id: serie.generation_id,
        name: serie.name,
        url: serie.url,
        image: null,
        status: serie.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('catalog.series.update', serie.id), { forceFormData: true });
    };

    const cancelHref = route('catalog.series.index', {
        model_id: data.model_id,
        generation_id: data.generation_id,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактирование: ${serie.name}`} />
            <CatalogLayout>
                <SerieForm
                    title={serie.name}
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
                    imageUrl={serie.image}
                />
            </CatalogLayout>
        </AppLayout>
    );
}

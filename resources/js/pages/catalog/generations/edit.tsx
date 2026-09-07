import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { GenerationForm } from '@/components/catalog/generation-form';
import AppLayout from '@/layouts/app-layout';
import CatalogLayout from '@/layouts/catalog/layout';
import { type BreadcrumbItem } from '@/types';

interface SelectedOption {
    id: number;
    label: string;
}

interface Generation {
    id: number;
    model_id: number;
    name: string;
    year_from: number | null;
    year_to: number | null;
}

interface Props {
    generation: Generation;
    selectedMark: SelectedOption | null;
    selectedModel: SelectedOption | null;
    defaultMarkId: number | null;
    defaultModelId: number | null;
}

export default function CatalogGenerationsEdit({ generation, selectedMark, selectedModel, defaultMarkId }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

    const { data, setData, put, processing, errors } = useForm({
        model_id: generation.model_id,
        name: generation.name,
        year_from: generation.year_from ?? ('' as string | number),
        year_to: generation.year_to ?? ('' as string | number),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('catalog.generations.update', generation.id));
    };

    const cancelHref = route('catalog.generations.index', { model_id: data.model_id });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактирование: ${generation.name}`} />
            <CatalogLayout>
                <GenerationForm
                    title={generation.name}
                    data={data}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    setData={setData}
                    cancelHref={cancelHref}
                    selectedMark={selectedMark}
                    selectedModel={selectedModel}
                    defaultMarkId={defaultMarkId}
                />
            </CatalogLayout>
        </AppLayout>
    );
}

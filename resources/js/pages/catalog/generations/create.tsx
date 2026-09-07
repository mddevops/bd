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

interface Props {
    selectedMark: SelectedOption | null;
    selectedModel: SelectedOption | null;
    defaultMarkId: number | null;
    defaultModelId: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

export default function CatalogGenerationsCreate({ selectedMark, selectedModel, defaultMarkId, defaultModelId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        model_id: defaultModelId,
        name: '',
        year_from: '' as string | number,
        year_to: '' as string | number,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('catalog.generations.store'));
    };

    const cancelHref = data.model_id
        ? route('catalog.generations.index', { model_id: data.model_id })
        : route('catalog.generations.index');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создание поколения" />
            <CatalogLayout>
                <GenerationForm
                    title="Новое поколение"
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

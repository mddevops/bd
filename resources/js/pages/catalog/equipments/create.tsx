import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { EquipmentForm } from '@/components/catalog/equipment-form';
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
    selectedSeries: SelectedOption | null;
    selectedModification: SelectedOption | null;
    defaultMarkId: number | null;
    defaultModelId: number | null;
    defaultGenerationId: number | null;
    defaultSeriesId: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

export default function CatalogEquipmentsCreate({
    selectedMark,
    selectedModel,
    selectedGeneration,
    selectedSeries,
    selectedModification,
    defaultMarkId,
    defaultModelId,
    defaultGenerationId,
    defaultSeriesId,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        series_id: defaultSeriesId,
        modification_id: null as number | null,
        name: '',
        status: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('catalog.equipments.store'));
    };

    const cancelHref = data.series_id
        ? route('catalog.equipments.index', { series_id: data.series_id })
        : route('catalog.equipments.index');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создание комплектации" />
            <CatalogLayout>
                <EquipmentForm
                    title="Новая комплектация"
                    data={data}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    setData={setData}
                    cancelHref={cancelHref}
                    defaultMarkId={defaultMarkId}
                    defaultModelId={defaultModelId}
                    defaultGenerationId={defaultGenerationId}
                    selectedMark={selectedMark}
                    selectedModel={selectedModel}
                    selectedGeneration={selectedGeneration}
                    selectedSeries={selectedSeries}
                    selectedModification={selectedModification}
                />
            </CatalogLayout>
        </AppLayout>
    );
}

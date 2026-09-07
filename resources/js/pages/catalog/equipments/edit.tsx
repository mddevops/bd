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

interface Equipment {
    id: number;
    series_id: number;
    modification_id: number;
    name: string;
    status: boolean;
}

interface Props {
    equipment: Equipment;
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

export default function CatalogEquipmentsEdit({
    equipment,
    selectedMark,
    selectedModel,
    selectedGeneration,
    selectedSeries,
    selectedModification,
    defaultMarkId,
    defaultModelId,
    defaultGenerationId,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

    const { data, setData, put, processing, errors } = useForm({
        series_id: equipment.series_id,
        modification_id: equipment.modification_id,
        name: equipment.name,
        status: equipment.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('catalog.equipments.update', equipment.id));
    };

    const cancelHref = route('catalog.equipments.index', { series_id: data.series_id });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактирование: ${equipment.name}`} />
            <CatalogLayout>
                <EquipmentForm
                    title={equipment.name}
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

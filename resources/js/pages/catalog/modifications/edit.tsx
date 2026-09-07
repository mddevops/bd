import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { ModificationForm } from '@/components/catalog/modification-form';
import AppLayout from '@/layouts/app-layout';
import CatalogLayout from '@/layouts/catalog/layout';
import { type BreadcrumbItem } from '@/types';

interface SelectedOption {
    id: number;
    label: string;
}

interface Modification {
    id: number;
    series_id: number;
    name: string;
    engine_volume: number | null;
    engine_power: number | null;
    engine: string | null;
    transmission: string | null;
    drive: string | null;
    consumption_100_km: number | null;
    acceleration_0_100: number | null;
    status: boolean;
}

interface Props {
    modification: Modification;
    selectedMark: SelectedOption | null;
    selectedModel: SelectedOption | null;
    selectedGeneration: SelectedOption | null;
    selectedSeries: SelectedOption | null;
    defaultMarkId: number | null;
    defaultModelId: number | null;
    defaultGenerationId: number | null;
    defaultSeriesId: number | null;
}

export default function CatalogModificationsEdit({
    modification,
    selectedMark,
    selectedModel,
    selectedGeneration,
    selectedSeries,
    defaultMarkId,
    defaultModelId,
    defaultGenerationId,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

    const { data, setData, put, processing, errors } = useForm({
        series_id: modification.series_id,
        name: modification.name,
        engine_volume: modification.engine_volume ?? ('' as string | number),
        engine_power: modification.engine_power ?? ('' as string | number),
        engine: modification.engine ?? '',
        transmission: modification.transmission ?? '',
        drive: modification.drive ?? '',
        consumption_100_km: modification.consumption_100_km ?? ('' as string | number),
        acceleration_0_100: modification.acceleration_0_100 ?? ('' as string | number),
        status: modification.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('catalog.modifications.update', modification.id));
    };

    const cancelHref = route('catalog.modifications.index', { series_id: data.series_id });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактирование: ${modification.name}`} />
            <CatalogLayout>
                <ModificationForm
                    title={modification.name}
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
                />
            </CatalogLayout>
        </AppLayout>
    );
}

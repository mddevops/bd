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

interface Props {
    selectedMark: SelectedOption | null;
    selectedModel: SelectedOption | null;
    selectedGeneration: SelectedOption | null;
    selectedSeries: SelectedOption | null;
    defaultMarkId: number | null;
    defaultModelId: number | null;
    defaultGenerationId: number | null;
    defaultSeriesId: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

export default function CatalogModificationsCreate({
    selectedMark,
    selectedModel,
    selectedGeneration,
    selectedSeries,
    defaultMarkId,
    defaultModelId,
    defaultGenerationId,
    defaultSeriesId,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        series_id: defaultSeriesId,
        name: '',
        engine_volume: '' as string | number,
        engine_power: '' as string | number,
        engine: '',
        transmission: '',
        drive: '',
        consumption_100_km: '' as string | number,
        acceleration_0_100: '' as string | number,
        status: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('catalog.modifications.store'));
    };

    const cancelHref = data.series_id
        ? route('catalog.modifications.index', { series_id: data.series_id })
        : route('catalog.modifications.index');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создание модификации" />
            <CatalogLayout>
                <ModificationForm
                    title="Новая модификация"
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

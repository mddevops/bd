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

interface Model {
    id: number;
    mark_id: number;
    name: string;
    name_ru: string | null;
    url: string;
    class: string | null;
    year_from: number | null;
    year_to: number | null;
    parent_id: number | null;
    ordering: number | null;
    status: boolean;
}

interface Props {
    model: Model;
    selectedMark: SelectedOption | null;
    selectedParent: SelectedOption | null;
    defaultMarkId: number | null;
}

export default function CatalogModelsEdit({ model, selectedMark, selectedParent }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

    const { data, setData, put, processing, errors } = useForm({
        mark_id: model.mark_id,
        name: model.name,
        name_ru: model.name_ru ?? '',
        url: model.url,
        class: model.class ?? '',
        year_from: model.year_from ?? ('' as string | number),
        year_to: model.year_to ?? ('' as string | number),
        parent_id: model.parent_id,
        ordering: model.ordering && model.ordering > 0 ? model.ordering : '',
        status: model.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('catalog.models.update', model.id));
    };

    const cancelHref = route('catalog.models.index', { mark_id: data.mark_id });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактирование: ${model.name}`} />
            <CatalogLayout>
                <ModelForm
                    title={model.name}
                    data={data}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    setData={setData}
                    cancelHref={cancelHref}
                    selectedMark={selectedMark}
                    selectedParent={selectedParent}
                    excludeParentId={model.id}
                />
            </CatalogLayout>
        </AppLayout>
    );
}

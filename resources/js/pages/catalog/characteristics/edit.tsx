import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { CharacteristicForm } from '@/components/catalog/characteristic-form';
import AppLayout from '@/layouts/app-layout';
import CatalogLayout from '@/layouts/catalog/layout';
import { type BreadcrumbItem } from '@/types';

interface SelectedOption {
    id: number;
    label: string;
}

interface Characteristic {
    id: number;
    name: string;
    parent_id: number | null;
    sort: number;
}

interface Props {
    characteristic: Characteristic;
    selectedParent: SelectedOption | null;
}

export default function CatalogCharacteristicsEdit({ characteristic, selectedParent }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

    const { data, setData, put, processing, errors } = useForm({
        name: characteristic.name,
        parent_id: characteristic.parent_id,
        sort: characteristic.sort,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('catalog.characteristics.update', characteristic.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактирование: ${characteristic.name}`} />
            <CatalogLayout>
                <CharacteristicForm
                    title={characteristic.name}
                    data={data}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    setData={setData}
                    cancelHref={route('catalog.characteristics.index')}
                    selectedParent={selectedParent}
                    excludeId={characteristic.id}
                />
            </CatalogLayout>
        </AppLayout>
    );
}

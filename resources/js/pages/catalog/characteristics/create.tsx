import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { CharacteristicForm } from '@/components/catalog/characteristic-form';
import AppLayout from '@/layouts/app-layout';
import CatalogLayout from '@/layouts/catalog/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

export default function CatalogCharacteristicsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        parent_id: null as number | null,
        sort: 0,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('catalog.characteristics.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создание характеристики" />
            <CatalogLayout>
                <CharacteristicForm
                    title="Новая характеристика"
                    data={data}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    setData={setData}
                    cancelHref={route('catalog.characteristics.index')}
                />
            </CatalogLayout>
        </AppLayout>
    );
}

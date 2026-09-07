import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { PolzovatelForm } from '@/components/polzovateli/polzovatel-form';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface RolOpciya {
    id: number;
    name: string;
    otobrazhaemoe_imya: string;
}

interface Props {
    dostupnyeRoli: RolOpciya[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Пользователи', href: '/polzovateli' },
    { title: 'Создание', href: '/polzovateli/create' },
];

export default function PolzovateliCreate({ dostupnyeRoli }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        aktiven: true,
        roli: [] as number[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('polzovateli.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создание пользователя" />
            <div className="p-4 md:p-6">
                <PolzovatelForm
                    title="Новый пользователь"
                    data={data}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    setData={setData}
                    cancelHref={route('polzovateli.index')}
                    dostupnyeRoli={dostupnyeRoli}
                />
            </div>
        </AppLayout>
    );
}

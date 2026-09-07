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

interface Polzovatel {
    id: number;
    name: string;
    email: string;
    aktiven: boolean;
    roli: number[];
}

interface Props {
    polzovatel: Polzovatel;
    dostupnyeRoli: RolOpciya[];
}

export default function PolzovateliEdit({ polzovatel, dostupnyeRoli }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Пользователи', href: '/polzovateli' },
        { title: polzovatel.name, href: `/polzovateli/${polzovatel.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: polzovatel.name,
        email: polzovatel.email,
        password: '',
        password_confirmation: '',
        aktiven: polzovatel.aktiven,
        roli: polzovatel.roli,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('polzovateli.update', polzovatel.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактирование: ${polzovatel.name}`} />
            <div className="p-4 md:p-6">
                <PolzovatelForm
                    title={polzovatel.name}
                    data={data}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    setData={setData}
                    cancelHref={route('polzovateli.index')}
                    dostupnyeRoli={dostupnyeRoli}
                    isEdit
                />
            </div>
        </AppLayout>
    );
}

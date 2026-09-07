import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { VyborPrav, type KategoriyaPrav } from '@/components/roli/vybor-prav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import AppPageContent from '@/layouts/app-page-content';
import { type BreadcrumbItem } from '@/types';

interface Rol {
    id: number;
    name: string;
    otobrazhaemoe_imya: string;
    opisanie: string | null;
    prava: string[];
}

interface Props {
    rol: Rol;
    kategoriiPrav: Record<string, KategoriyaPrav>;
}

export default function RoliEdit({ rol, kategoriiPrav }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Роли', href: '/roli' },
        { title: rol.otobrazhaemoe_imya, href: `/roli/${rol.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: rol.name,
        otobrazhaemoe_imya: rol.otobrazhaemoe_imya,
        opisanie: rol.opisanie ?? '',
        prava: rol.prava,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('roli.update', rol.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактирование: ${rol.otobrazhaemoe_imya}`} />

            <AppPageContent title={rol.otobrazhaemoe_imya} description="Изменение прав и параметров роли">
                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Основные параметры</CardTitle>
                            <CardDescription>Название и системное имя роли</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="otobrazhaemoe_imya">Название</Label>
                                <Input
                                    id="otobrazhaemoe_imya"
                                    value={data.otobrazhaemoe_imya}
                                    onChange={(e) => setData('otobrazhaemoe_imya', e.target.value)}
                                />
                                <InputError message={errors.otobrazhaemoe_imya} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Системное имя (латиница)</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={rol.name === 'administrator'}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="opisanie">Описание</Label>
                                <Input id="opisanie" value={data.opisanie} onChange={(e) => setData('opisanie', e.target.value)} />
                                <InputError message={errors.opisanie} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Права доступа</CardTitle>
                            <CardDescription>
                                Выберите ресурсы, страницы, виджеты и отдельные права для этой роли
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VyborPrav
                                kategorii={kategoriiPrav}
                                vybrannye={data.prava}
                                onChange={(prava) => setData('prava', prava)}
                            />
                            <InputError message={errors.prava} className="mt-4" />
                        </CardContent>
                        <Separator />
                        <CardFooter className="flex gap-2 pt-6">
                            <Button type="submit" disabled={processing}>
                                Сохранить
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('roli.index')}>Отмена</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </AppPageContent>
        </AppLayout>
    );
}

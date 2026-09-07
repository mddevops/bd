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

interface Props {
    kategoriiPrav: Record<string, KategoriyaPrav>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Роли', href: '/roli' },
    { title: 'Создание', href: '/roli/create' },
];

export default function RoliCreate({ kategoriiPrav }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        otobrazhaemoe_imya: '',
        opisanie: '',
        prava: [] as string[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('roli.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создание роли" />

            <AppPageContent title="Новая роль" description="Создайте роль и назначьте права доступа">
                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Основные параметры</CardTitle>
                            <CardDescription>Системное имя используется в коде, название — в интерфейсе</CardDescription>
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
                                    placeholder="menedzher"
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

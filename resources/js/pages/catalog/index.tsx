import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { catalogNavItems } from '@/config/catalog-nav';
import AppLayout from '@/layouts/app-layout';
import CatalogLayout from '@/layouts/catalog/layout';
import { type BreadcrumbItem } from '@/types';

interface Stats {
    marks: number;
    models: number;
    generations: number;
    series: number;
    modifications: number;
    equipments: number;
    characteristics: number;
    options: number;
}

interface Props {
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

const statKeys: Partial<Record<string, keyof Stats>> = {
    marks: 'marks',
    models: 'models',
    generations: 'generations',
    series: 'series',
    modifications: 'modifications',
    equipments: 'equipments',
    characteristics: 'characteristics',
    options: 'options',
};

export default function CatalogIndex({ stats }: Props) {
    const sections = catalogNavItems.filter((item) => item.url !== '/catalog');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Каталог" />

            <CatalogLayout>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {sections.map((section) => {
                        const key = section.url.replace('/catalog/', '');
                        const statKey = statKeys[key];

                        return (
                            <Card key={section.url}>
                                <CardHeader>
                                    <CardTitle>{section.title}</CardTitle>
                                    <CardDescription>
                                        {statKey ? `Записей: ${stats[statKey]}` : 'Справочник'}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="justify-end">
                                    <Button variant="outline" asChild>
                                        <Link href={section.url}>Открыть раздел</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </CatalogLayout>
        </AppLayout>
    );
}

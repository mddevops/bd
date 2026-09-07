import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { catalogNavItems } from '@/config/catalog-nav';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname;

    return (
        <div className="min-w-0 px-4 py-6">
            <Heading title="Каталог" description="Справочник автомобилей: марки, модели, комплектации и характеристики" />

            <div className="flex min-w-0 flex-col gap-8 lg:flex-row lg:gap-12">
                <aside className="w-full shrink-0 lg:w-56">
                    <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:flex-col lg:space-y-1 lg:overflow-visible lg:pb-0">
                        {catalogNavItems.map((item) => {
                            const isActive =
                                currentPath === item.url ||
                                (item.url !== '/catalog' && currentPath.startsWith(`${item.url}/`)) ||
                                (item.url !== '/catalog' && currentPath.startsWith(item.url));

                            return (
                                <Button
                                    key={item.url}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('shrink-0 justify-start lg:w-full', {
                                        'bg-muted': isActive,
                                    })}
                                >
                                    <Link href={item.url} prefetch>
                                        {item.title}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="lg:hidden" />

                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </div>
    );
}

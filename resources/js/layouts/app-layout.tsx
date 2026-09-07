import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { FlashToaster } from '@/components/flash-toaster';
import { useNastroiki } from '@/hooks/use-nastroiki';
import { type BreadcrumbItem } from '@/types';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const { nastroiki } = useNastroiki();
    const Layout = nastroiki.menyu === 'top' ? AppHeaderLayout : AppSidebarLayout;

    return (
        <>
            <Layout breadcrumbs={breadcrumbs} {...props}>
                {children}
            </Layout>
            <FlashToaster />
        </>
    );
}

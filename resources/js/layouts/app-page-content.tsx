import Heading from '@/components/heading';
import { cn } from '@/lib/utils';

interface AppPageContentProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
}

/**
 * Стандартная обёртка контента страницы CRM (как settings/profile):
 * px-4 py-6, заголовок h2 с mb-8, блоки контента через space-y-6.
 */
export default function AppPageContent({ children, className, title, description }: AppPageContentProps) {
    return (
        <div className={cn('px-4 py-6', className)}>
            {title ? <Heading title={title} description={description} /> : null}
            <div className="space-y-6">{children}</div>
        </div>
    );
}

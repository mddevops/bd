import { Head } from '@inertiajs/react';

export default function Maintenance() {
    return (
        <>
            <Head title="Обслуживание" />

            <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
                <h1 className="text-2xl font-semibold">CRM на обслуживании</h1>
                <p className="text-muted-foreground max-w-md text-sm">
                    Система временно недоступна. Попробуйте войти позже или обратитесь к администратору.
                </p>
            </div>
        </>
    );
}

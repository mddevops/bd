import { router } from '@inertiajs/react';
import { useEffect } from 'react';

import { Toaster, toast } from '@/components/ui/toast';
import { type SharedData } from '@/types';

export function FlashToaster() {
    useEffect(() => {
        const unsubscribe = router.on('success', (event) => {
            const message = (event.detail.page.props as SharedData).flash?.status;

            if (typeof message === 'string' && message.length > 0) {
                toast.add({
                    type: 'success',
                    description: message,
                });
            }
        });

        return unsubscribe;
    }, []);

    return <Toaster />;
}

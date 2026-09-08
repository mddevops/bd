import { usePage } from '@inertiajs/react';

import { BrandLogoMark } from '@/components/brand-logo-mark';
import { type SharedData } from '@/types';

export default function AppLogo() {
    const { systemSettings } = usePage<SharedData>().props;

    return (
        <>
            <BrandLogoMark logoUrl={systemSettings.logoUrl} logoStyle={systemSettings.logoStyle} />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{systemSettings.appName}</span>
            </div>
        </>
    );
}

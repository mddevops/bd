import { FormEventHandler } from 'react';

import { CatalogImageField } from '@/components/catalog/catalog-image-field';
import { CountrySearchSelect } from '@/components/catalog/country-search-select';
import { FormSectionCard } from '@/components/form-section-card';
import { FormShell } from '@/components/form-shell';
import { FormStatusCard } from '@/components/form-status-card';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { catalogUrlFromName } from '@/lib/catalog-url';
import { cn } from '@/lib/utils';

export interface MarkFormData {
    name: string;
    name_ru: string;
    url: string;
    logo_min: File | null;
    logo_big: File | null;
    country: string;
    ordering: string | number;
    status: boolean;
}

interface MarkFormErrors {
    name?: string;
    name_ru?: string;
    url?: string;
    logo_min?: string;
    logo_big?: string;
    country?: string;
    ordering?: string;
    status?: string;
}

interface Props {
    title: string;
    data: MarkFormData;
    errors: MarkFormErrors;
    processing: boolean;
    onSubmit: FormEventHandler;
    setData: <K extends keyof MarkFormData>(key: K, value: MarkFormData[K]) => void;
    cancelHref: string;
    submitLabel?: string;
    logoMinUrl?: string | null;
    logoBigUrl?: string | null;
}

export function MarkForm({
    title,
    data,
    errors,
    processing,
    onSubmit,
    setData,
    cancelHref,
    submitLabel = 'Сохранить',
    logoMinUrl,
    logoBigUrl,
}: Props) {
    const handleNameChange = (value: string) => {
        setData('name', value);
        setData('url', catalogUrlFromName(value));
    };

    return (
        <FormShell
            title={title}
            backHref={cancelHref}
            processing={processing}
            onSubmit={onSubmit}
            submitLabel={submitLabel}
            main={
                <FormSectionCard title="Основные данные">
                    <div className="space-y-3">
                            <div className="grid items-start gap-3 lg:grid-cols-2">
                                <div className="grid content-start gap-2">
                                    <Label htmlFor="name">Название (EN)</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        placeholder="BMW"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid content-start gap-2">
                                    <Label htmlFor="name_ru">Название (RU)</Label>
                                    <Input
                                        id="name_ru"
                                        value={data.name_ru}
                                        onChange={(e) => setData('name_ru', e.target.value)}
                                        placeholder="БМВ"
                                    />
                                    <InputError message={errors.name_ru} />
                                </div>
                            </div>

                            <div className="grid items-start gap-3 lg:grid-cols-2">
                                <div className="grid content-start gap-2">
                                    <Label htmlFor="url">URL</Label>
                                    <Input
                                        id="url"
                                        value={data.url}
                                        readOnly
                                        disabled
                                        aria-invalid={errors.url ? true : undefined}
                                        className={cn('disabled:opacity-100', errors.url && 'border-destructive')}
                                    />
                                    <InputError message={errors.url} />
                                </div>
                                <CountrySearchSelect
                                    label="Страна"
                                    value={data.country}
                                    onChange={(value) => setData('country', value)}
                                    error={errors.country}
                                />
                            </div>

                            <div className="grid content-start gap-2">
                                <Label htmlFor="ordering">Порядок</Label>
                                <Input
                                    id="ordering"
                                    type="number"
                                    min={1}
                                    placeholder="Пусто — без порядка"
                                    value={data.ordering}
                                    onChange={(e) => setData('ordering', e.target.value === '' ? '' : Number(e.target.value))}
                                    className="max-w-40"
                                />
                                <InputError message={errors.ordering} />
                            </div>
                        </div>
                    </FormSectionCard>
            }
            sidebar={
                <>
                    <FormSectionCard title="Изображения">
                        <div className="space-y-4">
                            <CatalogImageField
                                label="Мин."
                                value={data.logo_min}
                                currentUrl={logoMinUrl}
                                error={errors.logo_min}
                                onChange={(file) => setData('logo_min', file)}
                            />
                            <CatalogImageField
                                label="Большой"
                                value={data.logo_big}
                                currentUrl={logoBigUrl}
                                error={errors.logo_big}
                                onChange={(file) => setData('logo_big', file)}
                            />
                        </div>
                    </FormSectionCard>

                    <FormStatusCard
                        checked={data.status}
                        onCheckedChange={(checked) => setData('status', checked)}
                        error={errors.status}
                    />
                </>
            }
        />
    );
}

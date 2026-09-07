import { FormEventHandler } from 'react';

import { FormSectionCard } from '@/components/form-section-card';
import { FormShell } from '@/components/form-shell';
import { FormStatusCard } from '@/components/form-status-card';
import { PasswordFieldWithActions } from '@/components/password-field-with-actions';
import { RoliMultiSelect, type RolOpciya } from '@/components/roli/roli-multi-select';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface PolzovatelFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    aktiven: boolean;
    roli: number[];
}

interface PolzovatelFormErrors {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    aktiven?: string;
    roli?: string;
}

interface Props {
    title: string;
    data: PolzovatelFormData;
    errors: PolzovatelFormErrors;
    processing: boolean;
    onSubmit: FormEventHandler;
    setData: <K extends keyof PolzovatelFormData>(key: K, value: PolzovatelFormData[K]) => void;
    cancelHref: string;
    dostupnyeRoli: RolOpciya[];
    isEdit?: boolean;
}

export function PolzovatelForm({
    title,
    data,
    errors,
    processing,
    onSubmit,
    setData,
    cancelHref,
    dostupnyeRoli,
    isEdit = false,
}: Props) {
    return (
        <FormShell
            title={title}
            backHref={cancelHref}
            processing={processing}
            onSubmit={onSubmit}
            main={
                <FormSectionCard title="Основные данные">
                    <div className="space-y-3">
                        <div className="grid content-start gap-2">
                            <Label htmlFor="name">Имя</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid content-start gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} />
                        </div>
                        <PasswordFieldWithActions
                            id="password"
                            label={isEdit ? 'Новый пароль' : 'Пароль'}
                            value={data.password}
                            onChange={(value) => setData('password', value)}
                            onGenerated={(password) => {
                                setData('password', password);
                                setData('password_confirmation', password);
                            }}
                            placeholder={isEdit ? 'Оставьте пустым, если не меняете' : undefined}
                            required={!isEdit}
                            error={errors.password}
                            description={isEdit ? 'Оставьте пустым, если пароль не меняете.' : undefined}
                        />
                        <PasswordFieldWithActions
                            id="password_confirmation"
                            label="Подтверждение пароля"
                            value={data.password_confirmation}
                            onChange={(value) => setData('password_confirmation', value)}
                            error={errors.password_confirmation}
                            showHintActions={false}
                        />
                    </div>
                </FormSectionCard>
            }
            sidebar={
                <>
                    <FormSectionCard title="Роли">
                        <RoliMultiSelect
                            options={dostupnyeRoli}
                            value={data.roli}
                            onChange={(value) => setData('roli', value)}
                            error={errors.roli}
                        />
                    </FormSectionCard>
                    <FormStatusCard
                        id="aktiven"
                        label="Активен"
                        checked={data.aktiven}
                        onCheckedChange={(checked) => setData('aktiven', checked)}
                        error={errors.aktiven}
                    />
                </>
            }
        />
    );
}

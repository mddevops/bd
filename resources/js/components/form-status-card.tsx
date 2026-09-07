import { FormSectionCard } from '@/components/form-section-card';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Props {
    id?: string;
    label?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    error?: string;
    title?: string;
}

export function FormStatusCard({
    id = 'status',
    label = 'Активна',
    checked,
    onCheckedChange,
    error,
    title = 'Статус',
}: Props) {
    return (
        <FormSectionCard title={title}>
            <div className="flex items-center justify-between gap-4">
                <Label htmlFor={id}>{label}</Label>
                <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
            </div>
            <InputError message={error} />
        </FormSectionCard>
    );
}

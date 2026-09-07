import { useMemo } from 'react';

import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ENGINE_VOLUME_OPTIONS } from '@/lib/engine-volumes';

interface Props {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
}

export function EngineVolumeSelect({
    id = 'engine_volume',
    value,
    onChange,
    error,
    disabled = false,
    placeholder = 'Выберите объём',
}: Props) {
    const options = useMemo(() => {
        if (value && !ENGINE_VOLUME_OPTIONS.includes(value)) {
            return [value, ...ENGINE_VOLUME_OPTIONS];
        }

        return ENGINE_VOLUME_OPTIONS;
    }, [value]);

    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id}>Объём двигателя</Label>
            <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger id={id}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                    {options.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <InputError message={error} />
        </div>
    );
}

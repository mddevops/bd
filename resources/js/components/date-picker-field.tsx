import { format } from 'date-fns';
import { ru as dateFnsRu } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerFieldProps {
    id?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

function parseIsoDate(value: string): Date | undefined {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return undefined;
    }

    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
}

function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function DatePickerField({
    id,
    label,
    value,
    onChange,
    placeholder = 'Выберите дату',
    disabled = false,
    className,
}: DatePickerFieldProps) {
    const selected = parseIsoDate(value);

    return (
        <div className={cn('grid gap-2', className)}>
            <Label htmlFor={id}>{label}</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            'h-8 w-full justify-start px-2.5 text-left font-normal',
                            !selected && 'text-muted-foreground',
                        )}
                    >
                        <CalendarIcon className="mr-2 size-3.5 opacity-60" />
                        {selected ? format(selected, 'dd.MM.yyyy', { locale: dateFnsRu }) : placeholder}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        selected={selected}
                        onSelect={(date) => onChange(date ? toIsoDate(date) : '')}
                        defaultMonth={selected}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

export function todayIsoDate(): string {
    return toIsoDate(new Date());
}

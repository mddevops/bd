import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { type RefObject, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription } from '@/components/ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generateStrongPassword } from '@/lib/generate-password';
import { cn } from '@/lib/utils';

interface PasswordFieldWithActionsProps {
    id: string;
    label: string;
    value: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    description?: string;
    showHintActions?: boolean;
    autoComplete?: string;
    inputRef?: RefObject<HTMLInputElement | null>;
    onChange: (value: string) => void;
    onGenerated?: (password: string) => void;
    className?: string;
}

function PasswordInput({
    id,
    value,
    placeholder,
    required,
    error,
    autoComplete,
    inputRef,
    onChange,
}: Pick<
    PasswordFieldWithActionsProps,
    'id' | 'value' | 'placeholder' | 'required' | 'error' | 'autoComplete' | 'inputRef' | 'onChange'
>) {
    const [visible, setVisible] = useState(false);

    return (
        <InputGroup>
            <InputGroupInput
                ref={inputRef}
                id={id}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete ?? 'new-password'}
                aria-invalid={!!error}
            />
            <InputGroupAddon align="inline-end">
                <InputGroupButton
                    type="button"
                    size="icon-xs"
                    aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
                    onClick={() => setVisible((current) => !current)}
                >
                    {visible ? <EyeOff /> : <Eye />}
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    );
}

export function PasswordFieldWithActions({
    id,
    label,
    value,
    placeholder,
    required,
    error,
    description,
    showHintActions = true,
    autoComplete,
    inputRef,
    onChange,
    onGenerated,
    className,
}: PasswordFieldWithActionsProps) {
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
        const password = generateStrongPassword();

        onChange(password);
        onGenerated?.(password);
    };

    const handleCopy = async () => {
        if (!value) {
            return;
        }

        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.add({
                type: 'success',
                description: 'Пароль скопирован в буфер обмена',
            });
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.add({
                type: 'error',
                description: 'Не удалось скопировать пароль',
            });
        }
    };

    return (
        <Field className={cn('gap-2', className)} data-invalid={!!error}>
            <div className="flex items-center justify-between gap-2">
                <Label htmlFor={id}>{label}</Label>
                {showHintActions ? (
                    <TooltipProvider delayDuration={300}>
                        <div className="flex items-center gap-0.5">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
                                        onClick={handleGenerate}
                                    >
                                        <RefreshCw className="size-3.5" />
                                        Сгенерировать
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Подобрать надёжный пароль</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
                                        onClick={handleCopy}
                                        disabled={!value}
                                    >
                                        <Copy className="size-3.5" />
                                        {copied ? 'Скопировано' : 'Копировать'}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Скопировать пароль в буфер обмена</TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>
                ) : null}
            </div>

            <PasswordInput
                id={id}
                value={value}
                placeholder={placeholder}
                required={required}
                error={error}
                autoComplete={autoComplete}
                inputRef={inputRef}
                onChange={onChange}
            />

            {description ? <FieldDescription>{description}</FieldDescription> : null}
            <InputError message={error} />
        </Field>
    );
}

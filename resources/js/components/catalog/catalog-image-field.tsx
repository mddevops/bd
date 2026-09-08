import { ChangeEvent, DragEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { Image, Upload } from 'lucide-react';

import { CATALOG_IMAGE_ACCEPT, isCatalogImageFile } from '@/lib/catalog-image';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Props {
    label?: string;
    labelAction?: ReactNode;
    value: File | null;
    currentUrl?: string | null;
    error?: string;
    onChange: (file: File | null) => void;
    className?: string;
    accept?: string;
    formatsHint?: string;
    isValidFile?: (file: File) => boolean;
}

export function CatalogImageField({
    label,
    labelAction,
    value,
    currentUrl,
    error,
    onChange,
    className,
    accept = CATALOG_IMAGE_ACCEPT,
    formatsHint = 'JPG, PNG или WebP',
    isValidFile = isCatalogImageFile,
}: Props) {
    const inputId = useId();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (!value) {
            setPreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(value);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [value]);

    const applyFile = (file: File | null) => {
        if (file && !isValidFile(file)) {
            return;
        }

        onChange(file);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        applyFile(event.target.files?.[0] ?? null);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);
        applyFile(event.dataTransfer.files?.[0] ?? null);
    };

    const displayUrl = preview ?? currentUrl ?? null;

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {label || labelAction ? (
                <div className="flex items-center justify-between gap-2">
                    {label ? <Label htmlFor={inputId}>{label}</Label> : <span />}
                    {labelAction}
                </div>
            ) : null}

            <div
                className={cn(
                    'border-input relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors',
                    !displayUrl && 'justify-center',
                    dragActive && 'border-ring bg-accent/50',
                    error && 'border-destructive',
                )}
                onDragEnter={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                }}
                onDragLeave={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    id={inputId}
                    type="file"
                    accept={accept}
                    className="sr-only"
                    aria-label={label ?? 'Загрузить изображение'}
                    onChange={handleChange}
                />

                {displayUrl ? (
                    <div className="bg-background mb-3 flex size-24 items-center justify-center overflow-hidden rounded-lg ring-1 ring-foreground/10">
                        <img src={displayUrl} alt={label ?? 'Превью'} className="size-full object-contain" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                        <div className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full ring-1 ring-foreground/10">
                            <Image className="size-4 opacity-60" aria-hidden="true" />
                        </div>
                        <p className="mb-1.5 text-sm font-medium">Перетащите изображение сюда</p>
                        <p className="text-muted-foreground text-xs">{formatsHint}</p>
                    </div>
                )}

                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="-ms-0.5 size-4 opacity-60" aria-hidden="true" />
                    {displayUrl ? 'Заменить' : 'Выбрать файл'}
                </Button>
            </div>

            <InputError message={error} />
        </div>
    );
}

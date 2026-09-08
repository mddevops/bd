import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

import { BrandLogoMark } from '@/components/brand-logo-mark';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StaticSearchCombobox } from '@/components/search-combobox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    LOGO_SIZE_OPTIONS,
    normalizeHex,
    normalizeLogoStyle,
    type LogoStyleSettings,
    type LogoThemeStyle,
} from '@/lib/logo-style';
import { cn } from '@/lib/utils';

interface Props {
    value: LogoStyleSettings;
    logoUrl?: string | null;
    disabled?: boolean;
    onChange: (value: LogoStyleSettings) => void;
}

function ColorField({
    id,
    label,
    value,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    const pickerValue = normalizeHex(value) || '#000000';

    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex items-center gap-2">
                <input
                    id={`${id}-picker`}
                    type="color"
                    value={pickerValue}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="size-9 cursor-pointer rounded-md border border-input bg-transparent p-1"
                />
                <Input
                    id={id}
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    placeholder="Как в теме"
                    className="font-mono uppercase"
                />
                {value ? (
                    <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => onChange('')}>
                        Сброс
                    </Button>
                ) : null}
            </div>
            <p className="text-muted-foreground text-xs">Пустое значение — цвет из темы CRM</p>
        </div>
    );
}

function ThemeStyleFields({
    theme,
    value,
    logoUrl,
    onChange,
}: {
    theme: 'light' | 'dark';
    value: LogoThemeStyle;
    logoUrl?: string | null;
    onChange: (value: LogoThemeStyle) => void;
}) {
    const sizeOptions = LOGO_SIZE_OPTIONS.map((size) => ({
        value: String(size),
        label: `${size}px`,
    }));

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    'flex items-center justify-center rounded-xl border border-border/60 p-6',
                    theme === 'dark' ? 'bg-neutral-950' : 'bg-neutral-100',
                )}
            >
                <BrandLogoMark logoUrl={logoUrl} style={value} forceDark={theme === 'dark'} />
            </div>

            <ColorField
                id={`logo-bg-${theme}`}
                label="Фон блока"
                value={value.background}
                onChange={(background) => onChange({ ...value, background: normalizeHex(background) || background })}
            />

            <div className="grid gap-2">
                <StaticSearchCombobox
                    label="Размер блока"
                    value={String(value.size)}
                    options={sizeOptions}
                    onChange={(next) =>
                        onChange({
                            ...value,
                            size: next === '' ? 32 : Number(next),
                        })
                    }
                    placeholder="32px"
                />
                <p className="text-muted-foreground text-xs">
                    Контейнер: flex aspect-square, скругление rounded-md
                </p>
            </div>

            <ColorField
                id={`logo-color-${theme}`}
                label="Цвет логотипа"
                value={value.color}
                onChange={(color) => onChange({ ...value, color: normalizeHex(color) || color })}
            />
        </div>
    );
}

export function LogoStyleSettingsButton({ value, logoUrl, disabled, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(() => normalizeLogoStyle(value));

    useEffect(() => {
        if (open) {
            setDraft(normalizeLogoStyle(value));
        }
    }, [open, value]);

    const apply = () => {
        onChange(normalizeLogoStyle(draft));
        setOpen(false);
    };

    return (
        <>
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
                            disabled={disabled}
                            onClick={() => setOpen(true)}
                        >
                            <Settings className="size-3.5" />
                            Настроить
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Фон, размер и цвет логотипа</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Настройки логотипа</DialogTitle>
                        <DialogDescription>
                            Фон и размер блока для светлой и тёмной темы, а также цвет SVG/PNG
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="light">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="light">Светлая тема</TabsTrigger>
                            <TabsTrigger value="dark">Тёмная тема</TabsTrigger>
                        </TabsList>
                        <TabsContent value="light" className="pt-4">
                            <ThemeStyleFields
                                theme="light"
                                value={draft.light}
                                logoUrl={logoUrl}
                                onChange={(light) => setDraft((current) => ({ ...current, light }))}
                            />
                        </TabsContent>
                        <TabsContent value="dark" className="pt-4">
                            <ThemeStyleFields
                                theme="dark"
                                value={draft.dark}
                                logoUrl={logoUrl}
                                onChange={(dark) => setDraft((current) => ({ ...current, dark }))}
                            />
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Отмена
                            </Button>
                        </DialogClose>
                        <Button type="button" onClick={apply}>
                            Применить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

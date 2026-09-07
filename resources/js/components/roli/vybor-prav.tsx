import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface GruppaPrav {
    nazvanie: string;
    put?: string | null;
    dostupy: Record<string, string>;
}

interface KategoriyaPrav {
    nazvanie: string;
    gruppy: Record<string, GruppaPrav>;
}

interface VyborPravProps {
    kategorii: Record<string, KategoriyaPrav>;
    vybrannye: string[];
    onChange: (prava: string[]) => void;
}

function countPrav(kategoriya: KategoriyaPrav): number {
    return Object.values(kategoriya.gruppy).reduce((sum, gruppa) => sum + Object.keys(gruppa.dostupy).length, 0);
}

function KartaGruppyPrav({
    gruppa,
    vybrannye,
    onChange,
}: {
    gruppa: GruppaPrav;
    vybrannye: string[];
    onChange: (prava: string[]) => void;
}) {
    const pravaGruppy = Object.keys(gruppa.dostupy);
    const vseVybrany = pravaGruppy.length > 0 && pravaGruppy.every((pravo) => vybrannye.includes(pravo));

    const pereklyuchit = (pravo: string, vybrano: boolean) => {
        if (vybrano) {
            onChange([...vybrannye, pravo]);
            return;
        }

        onChange(vybrannye.filter((item) => item !== pravo));
    };

    const pereklyuchitVse = () => {
        if (vseVybrany) {
            onChange(vybrannye.filter((item) => !pravaGruppy.includes(item)));
            return;
        }

        onChange([...new Set([...vybrannye, ...pravaGruppy])]);
    };

    return (
        <Card className="overflow-hidden">
            <Collapsible defaultOpen className="group">
                <CardHeader className="pb-3">
                    <CollapsibleTrigger asChild>
                        <button
                            type="button"
                            className="flex w-full items-start justify-between gap-3 text-left"
                        >
                            <div className="min-w-0 space-y-1">
                                <CardTitle className="text-base leading-none">{gruppa.nazvanie}</CardTitle>
                                {gruppa.put ? (
                                    <CardDescription className="truncate font-mono text-xs">{gruppa.put}</CardDescription>
                                ) : null}
                            </div>
                            <ChevronDown className="text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                        </button>
                    </CollapsibleTrigger>
                </CardHeader>

                <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="text-primary h-auto p-0"
                            onClick={pereklyuchitVse}
                        >
                            {vseVybrany ? 'Снять все' : 'Выбрать все'}
                        </Button>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {Object.entries(gruppa.dostupy).map(([pravo, nazvanie]) => (
                                <div key={pravo} className="flex items-start gap-3">
                                    <Checkbox
                                        id={pravo}
                                        checked={vybrannye.includes(pravo)}
                                        onCheckedChange={(checked) => pereklyuchit(pravo, checked === true)}
                                        className="mt-0.5"
                                    />
                                    <Label htmlFor={pravo} className="cursor-pointer text-sm leading-snug font-normal">
                                        {nazvanie}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

export function VyborPrav({ kategorii, vybrannye, onChange }: VyborPravProps) {
    const klyuchiKategorii = useMemo(() => Object.keys(kategorii), [kategorii]);

    const aktivnayaKategoriya = useMemo(() => {
        const sPravami = klyuchiKategorii.find((klyuch) => countPrav(kategorii[klyuch]) > 0);
        return sPravami ?? klyuchiKategorii[0] ?? 'resursy';
    }, [kategorii, klyuchiKategorii]);

    if (klyuchiKategorii.length === 0) {
        return <p className="text-muted-foreground text-sm">Права доступа не настроены.</p>;
    }

    return (
        <Tabs defaultValue={aktivnayaKategoriya} className="w-full">
            <TabsList className="bg-muted/50 h-auto flex-wrap justify-start gap-1 p-1">
                {klyuchiKategorii.map((klyuch) => {
                    const kategoriya = kategorii[klyuch];
                    const count = countPrav(kategoriya);

                    return (
                        <TabsTrigger key={klyuch} value={klyuch} className="gap-2 px-3 py-2">
                            {kategoriya.nazvanie}
                            <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1.5 text-xs font-normal">
                                {count}
                            </Badge>
                        </TabsTrigger>
                    );
                })}
            </TabsList>

            {klyuchiKategorii.map((klyuch) => {
                const kategoriya = kategorii[klyuch];
                const gruppy = Object.entries(kategoriya.gruppy);

                return (
                    <TabsContent key={klyuch} value={klyuch} className="mt-4">
                        {gruppy.length === 0 ? (
                            <div className="rounded-lg border border-dashed px-6 py-10 text-center">
                                <p className="text-muted-foreground text-sm">
                                    В категории «{kategoriya.nazvanie}» пока нет прав. Они появятся при добавлении модулей CRM.
                                </p>
                            </div>
                        ) : (
                            <div className={cn('grid gap-4 md:grid-cols-2 xl:grid-cols-3')}>
                                {gruppy.map(([gruppaKlyuch, gruppa]) => (
                                    <KartaGruppyPrav
                                        key={gruppaKlyuch}
                                        gruppa={gruppa}
                                        vybrannye={vybrannye}
                                        onChange={onChange}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                );
            })}
        </Tabs>
    );
}

export type { GruppaPrav, KategoriyaPrav };

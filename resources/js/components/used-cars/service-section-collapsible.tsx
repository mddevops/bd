import { AnimatePresence, motion } from 'motion/react';
import { ChevronRightIcon, Wrench } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const panelTransition = {
    duration: 0.3,
    ease: [0.04, 0.62, 0.23, 0.98] as const,
};

const listVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: -6 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.22, ease: 'easeOut' as const },
    },
};

interface Props {
    subtitle?: string;
    children: ReactNode;
    className?: string;
}

export function ServiceSectionCollapsible({
    subtitle = 'Работы и расходы по подготовке',
    children,
    className,
}: Props) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className={cn(
                'w-full overflow-hidden rounded-lg bg-card text-sm text-card-foreground ring-1 ring-foreground/10',
                className,
            )}
        >
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger
                    type="button"
                    className="flex w-full px-4 py-3 text-left transition-colors"
                >
                    <div className="flex grow flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                            <span className="bg-primary/10 text-primary ring-primary/15 flex size-8 shrink-0 items-center justify-center rounded-full ring-1">
                                <Wrench className="size-4" aria-hidden />
                            </span>
                            <div className="flex flex-col items-start">
                                <span className="text-foreground text-sm leading-tight font-semibold">Сервис</span>
                                <span className="text-muted-foreground text-xs leading-tight">{subtitle}</span>
                            </div>
                        </div>
                        <motion.span
                            animate={{ rotate: open ? 90 : 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="inline-flex"
                        >
                            <ChevronRightIcon aria-hidden className="text-muted-foreground size-4" />
                        </motion.span>
                    </div>
                </CollapsibleTrigger>

                <AnimatePresence initial={false}>
                    {open ? (
                        <motion.div
                            key="service-collapsible-content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0, transition: { duration: 0.25, ease: 'easeInOut' } }}
                            transition={panelTransition}
                            style={{ overflow: 'hidden' }}
                            className="bg-card ring-1 ring-foreground/5 shadow-2xs"
                        >
                            <Separator />
                            <motion.div
                                className="space-y-3 p-4"
                                variants={listVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {children}
                            </motion.div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </Collapsible>
        </div>
    );
}

interface ServiceRowMotionProps {
    children: ReactNode;
    className?: string;
}

/** Строка сервиса — анимируется с задержкой относительно соседних строк. */
export function ServiceRowMotion({ children, className }: ServiceRowMotionProps) {
    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
}

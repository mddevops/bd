import * as React from 'react'
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  const childArray = React.Children.toArray(children)
  const scrollBars: React.ReactElement[] = []
  const content: React.ReactNode[] = []

  childArray.forEach((child) => {
    if (
      React.isValidElement(child) &&
      (child.type === ScrollBar ||
        (typeof child.type === 'function' &&
          'displayName' in child.type &&
          (child.type as { displayName?: string }).displayName === 'ScrollBar'))
    ) {
      scrollBars.push(child)
      return
    }

    content.push(child)
  })

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {content}
      </ScrollAreaPrimitive.Viewport>
      {scrollBars.length > 0 ? scrollBars : <ScrollBar />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        'flex touch-none p-px transition-colors select-none',
        orientation === 'vertical' &&
          'h-full w-1.5 border-l border-l-transparent',
        orientation === 'horizontal' &&
          'h-1.5 w-full flex-col border-t border-t-transparent',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

ScrollBar.displayName = 'ScrollBar'

export { ScrollArea, ScrollBar }

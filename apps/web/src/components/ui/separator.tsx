import * as React from 'react';
import { cn } from '@/lib/utils';

export function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
}): React.JSX.Element {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        'bg-gradient-to-r from-transparent via-white/15 to-transparent',
        className
      )}
      {...props}
    />
  );
}

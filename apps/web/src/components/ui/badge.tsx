import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.18em] transition-colors',
  {
    variants: {
      variant: {
        default: 'border-white/15 bg-white/5 text-white/75',
        accent: 'border-fuchsia-300/30 bg-fuchsia-400/12 text-fuchsia-100',
        cyan: 'border-cyan-300/30 bg-cyan-400/12 text-cyan-100',
        subtle: 'border-white/10 bg-white/[0.03] text-white/55',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

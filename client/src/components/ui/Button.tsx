import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Button component – shadcn/ui style, tích hợp với design system VibeTalk.
 *
 * Variants:
 *  - default   : gradient primary (tím)
 *  - secondary : nền tối, viền mờ
 *  - ghost     : trong suốt, no border
 *  - danger    : đỏ – dùng cho hành động nguy hiểm
 *  - outline   : viền primary
 *
 * Sizes:
 *  - sm   : nhỏ
 *  - md   : mặc định
 *  - lg   : lớn
 *  - icon : vuông (nút icon)
 */
const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-2xl font-extrabold transition-all duration-160',
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:saturate-75',
    'hover:-translate-y-px active:scale-[0.98]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
    'cursor-pointer select-none',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-gradient-to-br from-primary to-primary-strong',
          'text-[#2c0051]',
          'shadow-[0_14px_32px_rgba(127,44,203,0.24)]',
        ],
        secondary: [
          'bg-[#1b1b1f]/92 border border-outline/18',
          'text-text',
        ],
        ghost: [
          'bg-transparent text-text-muted',
          'hover:bg-surface-highest/28 hover:text-text',
        ],
        danger: [
          'bg-danger/12 text-[#fecaca]',
          'hover:bg-danger/20',
        ],
        outline: [
          'border border-primary/40 bg-transparent',
          'text-primary hover:bg-primary/8',
        ],
      },
      size: {
        sm:   'min-h-[2.25rem] px-3 py-[0.4rem] text-[0.82rem]',
        md:   'min-h-[3rem] px-[1.1rem] py-[0.75rem] text-[0.95rem]',
        lg:   'min-h-[3.5rem] px-[1.2rem] py-[0.95rem] text-[1.05rem]',
        icon: 'h-12 w-12 rounded-full p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'lg',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Nếu true, render con slot (e.g. <Link> làm button) */
  asChild?: boolean;
  /** Hiển thị vòng loading khi true */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-[1em] w-[1em] rounded-full border-2 border-current border-t-transparent animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };

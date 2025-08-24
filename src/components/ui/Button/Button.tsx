import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

// Enhanced button variants based on Twenty CRM and top CRM analysis
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary variants
        'primary': 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
        'secondary': 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',

        // Outline variants
        'outline': 'border border-gray-300 bg-transparent hover:bg-gray-50 active:bg-gray-100',
        'outline-primary': 'border border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50 active:bg-blue-100',

        // Ghost variants
        'ghost': 'hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
        'ghost-primary': 'text-blue-600 hover:bg-blue-50 active:bg-blue-100',

        // Status variants
        'success': 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
        'warning': 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800',
        'destructive': 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',

        // Special variants
        'link': 'text-blue-600 underline-offset-4 hover:underline',
        'gradient': 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700',
      },
      size: {
        'xs': 'h-7 px-2 text-xs',
        'sm': 'h-8 px-3 text-sm',
        'md': 'h-9 px-4',
        'lg': 'h-10 px-6',
        'xl': 'h-11 px-8',
        '2xl': 'h-12 px-10 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

type ButtonProps = {
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

const Button = ({ ref, className, variant, size, fullWidth, loading, icon, iconPosition = 'left', children, disabled, ...props }: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
  const isDisabled = loading || disabled;

  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      ref={ref}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className={cn(
            'animate-spin h-4 w-4',
            children && (iconPosition === 'left' ? 'mr-2' : 'ml-2'),
          )}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {icon && !loading && iconPosition === 'left' && (
        <span className={cn('flex items-center', children && 'mr-2')}>
          {icon}
        </span>
      )}

      {children}

      {icon && !loading && iconPosition === 'right' && (
        <span className={cn('flex items-center', children && 'ml-2')}>
          {icon}
        </span>
      )}
    </button>
  );
};

Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };

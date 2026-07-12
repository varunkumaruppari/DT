import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// Mission UI Button — minimal primitive
// Accessibility: keyboard interactive, visible focus state
// Motion: subtle tap scale, respects prefers-reduced-motion via CSS
// ============================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:opacity-90 shadow-mission-2 hover:shadow-mission-3',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-muted text-foreground',
  danger: 'bg-danger text-white hover:opacity-90',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-10 px-4 text-sm rounded-md',
  lg: 'h-12 px-6 text-base rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      className = '',
      disabled,
      children,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-all duration-150 ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

    const isDisabled = disabled ?? isLoading;

    return (
      <motion.div
        whileTap={!isDisabled ? { scale: 0.97 } : undefined}
        style={{ display: 'inline-flex' }}
      >
        <button
          ref={ref}
          type={type}
          className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className} w-full`}
          disabled={isDisabled}
          aria-busy={isLoading}
          {...rest}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
                aria-hidden="true"
              />
              {children}
            </span>
          ) : (
            children
          )}
        </button>
      </motion.div>
    );
  }
);

Button.displayName = 'Button';

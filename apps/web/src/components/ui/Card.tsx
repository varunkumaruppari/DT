import { type HTMLAttributes, forwardRef } from 'react';

// ============================================================
// Mission UI Card — layered surface primitive
// ============================================================

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = false, className = '', children, ...props }, ref) => {
    const base =
      'rounded-lg border border-border p-6 transition-shadow duration-200';
    const surface = elevated
      ? 'bg-surface-elevated shadow-mission-2'
      : 'bg-surface shadow-mission-1';

    return (
      <div ref={ref} className={`${base} ${surface} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
export function CardHeader({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-4 ${className}`} {...props} />;
}

// Card Content
export function CardContent({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}

// Card Footer
export function CardFooter({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mt-4 flex items-center ${className}`} {...props} />;
}

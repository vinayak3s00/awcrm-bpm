// AWCRM Skeleton Component - Modern Loading UI
// Reusable skeleton component for loading states

import { cn } from '@/libs/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };

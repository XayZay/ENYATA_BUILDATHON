'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

type LoadingLinkProps = {
  href: string;
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
};

export function LoadingLink({
  href,
  children,
  pendingLabel = 'Opening...',
  className = ''
}: LoadingLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-disabled={isPending}
      onClick={() => {
        startTransition(() => {
          router.push(href);
        });
      }}
      className={className}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {isPending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>{pendingLabel}</span>
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}

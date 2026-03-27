'use client';

import { useFormStatus } from 'react-dom';

type PendingSubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
};

export function PendingSubmitButton({
  children,
  pendingLabel = 'Processing...',
  className = '',
  disabled = false
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-disabled={disabled || pending}
      className={className}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {pending ? (
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

'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

export function WorkspaceSearchForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();
    const destination = trimmed ? '/dashboard/search?q=' + encodeURIComponent(trimmed) : '/dashboard/search';

    startTransition(() => {
      router.push(destination);
    });
  }

  return (
    <form
      action="/dashboard/search"
      method="get"
      onSubmit={handleSubmit}
      className="min-w-[240px] flex-1"
    >
      <div className="flex items-center gap-3 rounded-[1.25rem] border border-blue-100 bg-[#f7faff] px-4 py-3">
        <span className="text-base text-slate-400">/</span>
        <input
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects, payouts, providers, or clients"
          className="w-full border-none bg-transparent px-0 py-0 text-sm text-slate-700 placeholder:text-slate-500 focus:ring-0"
          aria-label="Search workspace"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="inline-flex items-center gap-2">
            {isPending ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Searching...</span>
              </>
            ) : (
              <span>{pathname === '/dashboard/search' ? 'Update search' : 'Search'}</span>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}

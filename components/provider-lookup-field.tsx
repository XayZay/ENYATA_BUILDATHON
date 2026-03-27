'use client';

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';

import type { ProviderSearchResult } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProviderLookupFieldProps {
  defaultValue?: string;
}

function getCanonicalIdentifier(provider: ProviderSearchResult) {
  if (provider.providerCode) {
    return provider.providerCode;
  }

  if (provider.handle) {
    return '@' + provider.handle;
  }

  return provider.email;
}

export function ProviderLookupField({ defaultValue = '' }: ProviderLookupFieldProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<ProviderSearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderSearchResult | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (deferredQuery.trim().length < 2) {
      setResults([]);
      setStatus('idle');
      if (!selectedProvider) {
        setMessage('');
      }
      return;
    }

    const controller = new AbortController();

    startTransition(() => {
      setStatus('loading');
    });

    fetch('/api/providers/search?q=' + encodeURIComponent(deferredQuery), { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? 'Unable to search providers');
        }

        return payload.data as ProviderSearchResult[];
      })
      .then((data) => {
        setResults(data);
        setStatus('idle');
        if (!selectedProvider) {
          setMessage(data.length === 0 ? 'No providers matched yet. Use the exact email if the profile is still being set up.' : '');
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        setResults([]);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Unable to search providers');
      });

    return () => controller.abort();
  }, [deferredQuery, selectedProvider]);

  const helperMessage = useMemo(() => {
    if (selectedProvider) {
      return 'Selected ' + selectedProvider.fullName + ' for this project.';
    }

    if (status === 'loading') {
      return 'Searching providers...';
    }

    return message || 'Search by provider email, handle, provider code, or specialty.';
  }, [message, selectedProvider, status]);

  return (
    <div className="relative">
      <label htmlFor="providerSearch">Find provider</label>
      <input
        id="providerSearch"
        autoComplete="off"
        placeholder="Search by name, email, handle, or provider code"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setSelectedProvider(null);
        }}
        className={cn(
          'pr-28',
          selectedProvider ? 'border-blue-200 bg-blue-50/70 text-blue-950' : ''
        )}
      />
      <input name="providerIdentifier" type="hidden" value={selectedProvider ? getCanonicalIdentifier(selectedProvider) : query} readOnly />
      <span className="pointer-events-none absolute right-4 top-[2.55rem] rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
        Live lookup
      </span>
      <p className="mt-2 text-sm text-slate-500">{helperMessage}</p>
      {results.length > 0 ? (
        <div className="absolute z-10 mt-3 w-full overflow-hidden rounded-[1.35rem] border border-line bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
          {results.map((provider) => (
            <button
              key={provider.userId}
              type="button"
              className="flex w-full items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 text-left transition last:border-b-0 hover:bg-blue-50/70"
              onClick={() => {
                setSelectedProvider(provider);
                setQuery(provider.fullName + (provider.handle ? ' (@' + provider.handle + ')' : ''));
                setResults([]);
                setStatus('idle');
                setMessage('');
              }}
            >
              <div>
                <p className="text-sm font-semibold text-slate-950">{provider.fullName}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {provider.handle ? '@' + provider.handle + ' / ' : ''}
                  {provider.email}
                </p>
                {provider.specialty ? <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{provider.specialty}</p> : null}
              </div>
              <div className="text-right text-xs text-slate-500">
                {provider.providerCode ? <p className="font-semibold text-blue-700">{provider.providerCode}</p> : null}
                {provider.availabilityStatus ? <p className="mt-1 capitalize">{provider.availabilityStatus}</p> : null}
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}



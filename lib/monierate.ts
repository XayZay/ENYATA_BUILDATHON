import { env, isMonierateConfigured } from '@/lib/env';
import type { PayoutPlatform, RoutingOption } from '@/lib/types';

const PLATFORM_META: Record<
  PayoutPlatform,
  { label: string; feePercent: number; flatFeeUsd: number; processingTime: string; source: 'monierate' | 'interswitch' | 'fallback' }
> = {
  wise: { label: 'Wise', feePercent: 0.005, flatFeeUsd: 1.5, processingTime: '2-6 hours', source: 'monierate' },
  grey: { label: 'Grey', feePercent: 0.01, flatFeeUsd: 0, processingTime: 'Instant to 2 hours', source: 'monierate' },
  payoneer: { label: 'Payoneer', feePercent: 0.02, flatFeeUsd: 0, processingTime: 'Same day', source: 'monierate' },
  quidax: { label: 'Quidax', feePercent: 0.015, flatFeeUsd: 0, processingTime: '5-20 minutes', source: 'monierate' },
  interswitch: { label: 'Interswitch', feePercent: 0.0025, flatFeeUsd: 0.75, processingTime: 'Pending account activation', source: 'interswitch' }
};

interface MonierateLatestResponse {
  data?: {
    rates?: Record<string, number>;
  };
}

interface OpenErResponse {
  rates?: Record<string, number>;
}

async function getMonierateUsdNgnRate() {
  if (!isMonierateConfigured()) {
    throw new Error('MONIERATE_API_KEY is not configured');
  }

  const response = await fetch('https://api.monierate.com/core/rates/latest.json?base=USD', {
    headers: {
      api_key: env.monierateApiKey!
    },
    next: { revalidate: 600 }
  });

  if (!response.ok) {
    throw new Error('Monierate request failed with status ' + response.status);
  }

  const payload = (await response.json()) as MonierateLatestResponse;
  const rate = payload.data?.rates?.NGN;
  if (!rate) {
    throw new Error('Monierate response did not include NGN rate');
  }

  return rate;
}

async function getFallbackUsdNgnRate() {
  const response = await fetch(env.openErApiUrl, {
    next: { revalidate: 600 }
  });

  if (!response.ok) {
    throw new Error('Fallback FX request failed with status ' + response.status);
  }

  const payload = (await response.json()) as OpenErResponse;
  const rate = payload.rates?.NGN;
  if (!rate) {
    throw new Error('Fallback FX response did not include NGN rate');
  }

  return rate;
}

export async function getUsdToNgnRate() {
  try {
    return {
      rate: await getMonierateUsdNgnRate(),
      source: 'monierate' as const
    };
  } catch {
    return {
      rate: await getFallbackUsdNgnRate(),
      source: 'fallback' as const
    };
  }
}

export async function buildRoutingOptions(amountUsd: number, interswitchAvailable: boolean): Promise<RoutingOption[]> {
  const liveRate = await getUsdToNgnRate();
  const options = (Object.keys(PLATFORM_META) as PayoutPlatform[]).map((platform) => {
    const meta = PLATFORM_META[platform];
    const feeUsd = amountUsd * meta.feePercent + meta.flatFeeUsd;
    const amountNgn = Math.max(0, (amountUsd - feeUsd) * liveRate.rate);
    const isAvailable = platform !== 'interswitch' ? true : interswitchAvailable;

    return {
      platform,
      label: meta.label,
      source: platform === 'interswitch' ? (interswitchAvailable ? 'interswitch' : liveRate.source) : liveRate.source,
      rate: liveRate.rate,
      feeLabel:
        meta.flatFeeUsd > 0
          ? (meta.feePercent * 100).toFixed(meta.feePercent < 0.01 ? 1 : 0) + '% + $' + meta.flatFeeUsd.toFixed(2)
          : (meta.feePercent * 100).toFixed(meta.feePercent < 0.01 ? 1 : 0) + '%',
      feeUsd,
      amountUsd,
      amountNgn,
      processingTime: meta.processingTime,
      isBestValue: false,
      isRecommended: platform === 'interswitch',
      isAvailable,
      note:
        platform === 'interswitch' && !interswitchAvailable
          ? 'Interswitch execution is waiting for account activation. Estimated using the current USD to NGN market rate.'
          : 'Estimated from live USD to NGN pricing and the configured fee model.'
    } satisfies RoutingOption;
  });

  const bestValue = [...options].sort((a, b) => b.amountNgn - a.amountNgn)[0];
  return options.map((option) => ({
    ...option,
    isBestValue: option.platform === bestValue.platform
  }));
}

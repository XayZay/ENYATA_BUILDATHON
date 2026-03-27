import { env, isMonierateConfigured } from '@/lib/env';
import type { PayoutPlatform, RoutingOption } from '@/lib/types';

type PlatformMeta = {
  label: string;
  feePercent: number;
  flatFeeUsd: number;
  processingTime: string;
  apiCode: string;
};

const PLATFORM_META: Record<PayoutPlatform, PlatformMeta> = {
  cleva:       { label: 'Cleva',       feePercent: 0.005,  flatFeeUsd: 1.5,  processingTime: '2-6 hours',                  apiCode: 'cleva' },
  grey:        { label: 'Grey',        feePercent: 0.01,   flatFeeUsd: 0,    processingTime: 'Instant to 2 hours',         apiCode: 'grey' },
  payoneer:    { label: 'Payoneer',    feePercent: 0.02,   flatFeeUsd: 0,    processingTime: 'Same day',                   apiCode: 'payoneer' },
  quidax:      { label: 'Quidax',      feePercent: 0.015,  flatFeeUsd: 0,    processingTime: '5-20 minutes',               apiCode: 'quidax' },
  interswitch: { label: 'Interswitch', feePercent: 0.0025, flatFeeUsd: 0.75, processingTime: 'Pending account activation', apiCode: 'interswitch' }
};

interface MonierateLatestResponse {
  data?: {
    rates?: Record<string, number>;
  };
}

interface MonieratePlatformsResponse {
  data?: {
    ticker?: string;
    platforms?: Array<{
      code: string;
      sell: string | number;
    }>;
  };
}

interface OpenErResponse {
  rates?: Record<string, number>;
}

async function getMonierateRates() {
  if (!isMonierateConfigured()) {
    throw new Error('MONIERATE_API_KEY is not configured');
  }

  const [latestRes, platformsRes] = await Promise.all([
    fetch('https://api.monierate.com/core/rates/latest.json?base=USD', {
      headers: { api_key: env.monierateApiKey! },
      next: { revalidate: 600 }
    }),
    fetch('https://api.monierate.com/core/rates/platforms.json?ticker=usdngn', {
      headers: { api_key: env.monierateApiKey! },
      next: { revalidate: 600 }
    })
  ]);

  if (!latestRes.ok) {
    throw new Error('Monierate request failed with status ' + latestRes.status);
  }

  const latestPayload = (await latestRes.json()) as MonierateLatestResponse;
  const baseRate = latestPayload.data?.rates?.NGN;
  if (!baseRate) {
    throw new Error('Monierate response did not include NGN rate');
  }

  const platformRates: Record<string, number> = {};
  if (platformsRes.ok) {
    const platformsPayload = (await platformsRes.json()) as MonieratePlatformsResponse;
    if (platformsPayload.data?.platforms && Array.isArray(platformsPayload.data.platforms)) {
      for (const p of platformsPayload.data.platforms) {
        // Temporary: log raw codes so you can verify apiCode values in PLATFORM_META, then remove
        console.log('Monierate platform code:', p.code, '| sell:', p.sell);
        if (p.code && p.sell) {
          platformRates[p.code.toLowerCase()] = typeof p.sell === 'string' ? parseFloat(p.sell) : p.sell;
        }
      }
    }
  }

  return { rate: baseRate, platformRates };
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
    const { rate, platformRates } = await getMonierateRates();
    return {
      rate,
      platformRates,
      source: 'monierate' as const
    };
  } catch {
    return {
      rate: await getFallbackUsdNgnRate(),
      platformRates: {} as Record<string, number>,
      source: 'fallback' as const
    };
  }
}

export async function buildRoutingOptions(amountUsd: number, interswitchAvailable: boolean): Promise<RoutingOption[]> {
  const rateInfo = await getUsdToNgnRate();

  const options = (Object.keys(PLATFORM_META) as PayoutPlatform[]).map((platform) => {
    const meta = PLATFORM_META[platform];
    const feeUsd = amountUsd * meta.feePercent + meta.flatFeeUsd;

    // Use apiCode to look up the live sell rate from the Monierate platforms response
    const conversionRate = rateInfo.platformRates[meta.apiCode] ?? rateInfo.rate;

    const amountNgn = Math.max(0, (amountUsd - feeUsd) * conversionRate);
    const isAvailable = platform !== 'interswitch' ? true : interswitchAvailable;

    return {
      platform,
      label: meta.label,
      source: platform === 'interswitch' ? (interswitchAvailable ? 'interswitch' : rateInfo.source) : rateInfo.source,
      rate: conversionRate,
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
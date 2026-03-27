import { env, isMonierateConfigured } from '@/lib/env';
import type { PayoutPlatform, PayoutTimingInsight, RateTrendPoint, RoutingOption } from '@/lib/types';

type PlatformMeta = {
  label: string;
  feePercent: number;
  flatFeeUsd: number;
  processingTime: string;
  apiCode: string;
};

const PLATFORM_META: Record<PayoutPlatform, PlatformMeta> = {
  cleva: { label: 'Cleva', feePercent: 0.005, flatFeeUsd: 1.5, processingTime: '2-6 hours', apiCode: 'cleva' },
  grey: { label: 'Grey', feePercent: 0.01, flatFeeUsd: 0, processingTime: 'Instant to 2 hours', apiCode: 'grey' },
  payoneer: { label: 'Payoneer', feePercent: 0.02, flatFeeUsd: 0, processingTime: 'Same day', apiCode: 'payoneer' },
  quidax: { label: 'Quidax', feePercent: 0.015, flatFeeUsd: 0, processingTime: '5-20 minutes', apiCode: 'quidax' },
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

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toRateTrendPoint(date: string, rate: unknown) {
  const normalizedRate = typeof rate === 'string' ? parseFloat(rate) : typeof rate === 'number' ? rate : NaN;
  if (!date || Number.isNaN(normalizedRate) || normalizedRate <= 0) {
    return null;
  }

  return {
    date,
    rate: normalizedRate
  } satisfies RateTrendPoint;
}

function parseHistoryPoints(payload: unknown): RateTrendPoint[] {
  const points: RateTrendPoint[] = [];
  const candidate = payload as
    | {
        data?: {
          history?: unknown;
          rates?: unknown;
          data?: unknown;
        };
      }
    | undefined;

  const sources = [candidate?.data?.history, candidate?.data?.rates, candidate?.data?.data];

  for (const source of sources) {
    if (!source) {
      continue;
    }

    if (Array.isArray(source)) {
      for (const entry of source) {
        if (!entry || typeof entry !== 'object') {
          continue;
        }

        const row = entry as { date?: string; day?: string; rate?: unknown; value?: unknown; ngn?: unknown; rates?: Record<string, unknown> };
        const point = toRateTrendPoint(row.date ?? row.day ?? '', row.rate ?? row.value ?? row.ngn ?? row.rates?.NGN);
        if (point) {
          points.push(point);
        }
      }
    } else if (typeof source === 'object') {
      for (const [date, value] of Object.entries(source)) {
        if (typeof value === 'object' && value) {
          const nested = value as { rate?: unknown; value?: unknown; ngn?: unknown; rates?: Record<string, unknown> };
          const point = toRateTrendPoint(date, nested.rate ?? nested.value ?? nested.ngn ?? nested.rates?.NGN);
          if (point) {
            points.push(point);
          }
        } else {
          const point = toRateTrendPoint(date, value);
          if (point) {
            points.push(point);
          }
        }
      }
    }
  }

  return points
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .slice(-7);
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
      for (const platform of platformsPayload.data.platforms) {
        if (platform.code && platform.sell) {
          platformRates[platform.code.toLowerCase()] =
            typeof platform.sell === 'string' ? parseFloat(platform.sell) : platform.sell;
        }
      }
    }
  }

  return { rate: baseRate, platformRates };
}

async function getMonierateHistory() {
  if (!isMonierateConfigured()) {
    throw new Error('MONIERATE_API_KEY is not configured');
  }

  const endpoints = [
    'https://api.monierate.com/core/rates/history.json?ticker=usdngn',
    'https://api.monierate.com/core/rates/history.json?base=USD&symbols=NGN',
    'https://api.monierate.com/core/rates/history.json?base=USD&symbol=NGN'
  ];

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, {
      headers: { api_key: env.monierateApiKey! },
      next: { revalidate: 21600 }
    });

    if (!response.ok) {
      continue;
    }

    const payload = await response.json();
    const points = parseHistoryPoints(payload);
    if (points.length >= 3) {
      return points;
    }
  }

  throw new Error('Monierate history did not return enough points');
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

  const bestValue = [...options].sort((left, right) => right.amountNgn - left.amountNgn)[0];
  return options.map((option) => ({
    ...option,
    isBestValue: option.platform === bestValue.platform
  }));
}

export async function buildPayoutTimingInsight(option: RoutingOption): Promise<PayoutTimingInsight> {
  const latestRate = option.rate;
  const netUsd = Math.max(0, option.amountUsd - option.feeUsd);

  try {
    const trendPoints = await getMonierateHistory();
    const firstRate = trendPoints[0]?.rate ?? latestRate;
    const trailingAverageRate = average(trendPoints.map((point) => point.rate));
    const sevenDayChangePercent = firstRate > 0 ? ((latestRate - firstRate) / firstRate) * 100 : 0;
    const dailyMomentumPercent = trendPoints.length > 1 ? sevenDayChangePercent / (trendPoints.length - 1) : 0;
    const threeDayProjectionPercent = dailyMomentumPercent * 3;
    const projectedRate = latestRate * (1 + threeDayProjectionPercent / 100);
    const projectedAmountNgn = Math.max(0, netUsd * projectedRate);
    const projectedDifferenceNgn = projectedAmountNgn - option.amountNgn;
    const upsideThreshold = Math.max(option.amountNgn * 0.01, 15000);
    const recommendation = projectedDifferenceNgn > upsideThreshold ? 'hold' : 'transfer_now';
    const absoluteChange = Math.abs(sevenDayChangePercent);
    const confidence = absoluteChange >= 2 ? 'high' : absoluteChange >= 0.9 ? 'medium' : 'low';

    if (recommendation === 'hold') {
      return {
        recommendation,
        confidence,
        headline: 'Hold for now',
        summary: 'Recent USD to NGN momentum is still pointing upward, so waiting a little longer may improve your naira outcome.',
        note: 'This is a directional signal from recent rate movement, not a guaranteed forecast.',
        source: 'monierate',
        signalLabel: 'Upward momentum',
        latestRate,
        sevenDayChangePercent,
        threeDayProjectionPercent,
        trailingAverageRate,
        projectedRate,
        estimatedNowAmountNgn: option.amountNgn,
        projectedAmountNgn,
        projectedDifferenceNgn,
        trendPoints
      };
    }

    return {
      recommendation,
      confidence,
      headline: 'Transfer now',
      summary: 'There is no strong short-term upside signal right now, so settling through Interswitch now is the safer call.',
      note: 'This is a directional signal from recent rate movement, not a guaranteed forecast.',
      source: 'monierate',
      signalLabel: absoluteChange < 0.9 ? 'Flat momentum' : 'Soft or negative momentum',
      latestRate,
      sevenDayChangePercent,
      threeDayProjectionPercent,
      trailingAverageRate,
      projectedRate,
      estimatedNowAmountNgn: option.amountNgn,
      projectedAmountNgn,
      projectedDifferenceNgn,
      trendPoints
    };
  } catch {
    return {
      recommendation: 'transfer_now',
      confidence: 'low',
      headline: 'Transfer now',
      summary: 'Recent trend data is unavailable, so the product falls back to the live rate and avoids speculating on a better future entry point.',
      note: 'Once Monierate history is available, this panel can make stronger timing recommendations.',
      source: 'fallback',
      signalLabel: 'No trend signal',
      latestRate,
      sevenDayChangePercent: 0,
      threeDayProjectionPercent: 0,
      trailingAverageRate: latestRate,
      projectedRate: latestRate,
      estimatedNowAmountNgn: option.amountNgn,
      projectedAmountNgn: option.amountNgn,
      projectedDifferenceNgn: 0,
      trendPoints: []
    };
  }
}

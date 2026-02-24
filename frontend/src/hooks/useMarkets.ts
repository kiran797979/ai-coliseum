import { useEffect, useState } from 'react';
import { getMarkets } from '../api/client';
import type { Market } from '../types';

export const useMarkets = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const data = await getMarkets();
      setMarkets(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch markets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  return { markets, loading, error, refetch: fetchMarkets };
};

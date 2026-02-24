import { useEffect, useState } from 'react';
import { getFights } from '../api/client';
import type { Fight } from '../types';

export const useFights = (status?: string) => {
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFights = async () => {
    setLoading(true);
    try {
      const data = await getFights(status);
      setFights(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch fights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFights();
  }, [status]);

  return { fights, loading, error, refetch: fetchFights };
};

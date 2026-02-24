import { useEffect, useState } from 'react';
import { getAgents } from '../api/client';
import type { Agent } from '../types';

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await getAgents();
      setAgents(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return { agents, loading, error, refetch: fetchAgents };
};

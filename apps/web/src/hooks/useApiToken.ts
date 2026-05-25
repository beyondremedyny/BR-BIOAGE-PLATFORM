import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';
import { api } from '@/lib/api';

export function useApi() {
  const { getToken } = useAuth();

  return useCallback(
    async <T>(path: string, init?: RequestInit) => {
      const token = await getToken();
      return api<T>(path, { ...init, token });
    },
    [getToken]
  );
}

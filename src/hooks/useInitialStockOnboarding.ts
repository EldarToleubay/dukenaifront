import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { queryKeys } from '../lib/queryKeys';
import { initialStockDoneKey, initialStockSkippedKey } from '../lib/storageKeys';

async function fetchActiveProductsCount(storeId: string): Promise<number> {
  const { data } = await api.get<{ total: number }>(`/stores/${storeId}/products/active-count`);
  return data.total;
}

export function useInitialStockOnboarding(storeId: string) {
  const skipped = localStorage.getItem(initialStockSkippedKey(storeId)) === 'true';
  const done = localStorage.getItem(initialStockDoneKey(storeId)) === 'true';

  const activeProductsQuery = useQuery({
    queryKey: queryKeys.products.activeCount(storeId),
    queryFn: () => fetchActiveProductsCount(storeId),
    enabled: Boolean(storeId),
  });

  const shouldShowPrompt = useMemo(() => {
    if (skipped || done) return false;
    return (activeProductsQuery.data ?? 0) > 0;
  }, [activeProductsQuery.data, done, skipped]);

  return {
    activeProductsCount: activeProductsQuery.data ?? 0,
    isLoading: activeProductsQuery.isLoading,
    shouldShowPrompt,
  };
}

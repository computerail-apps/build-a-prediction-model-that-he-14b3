import { useQuery } from '@tanstack/react-query';
import { useBackendReady } from './backend-status';

export interface UseAppDataArgs<T> {
  key: string | readonly unknown[];
  mock?: T;
  fetchLive: () => Promise<T>;
  enabled?: boolean;
}

export function useAppData<T>({ key, mock, fetchLive, enabled = true }: UseAppDataArgs<T>) {
  const ready = useBackendReady();
  const q = useQuery({
    queryKey: ['app-data', key, ready],
    queryFn: fetchLive,
    enabled: ready && enabled,
  });
  const data: T | undefined = ready ? (q.data ?? mock) : mock;
  const isLoading = !ready
    ? mock === undefined && enabled
    : q.isFetching && q.data === undefined;
  return {
    data,
    isLive: ready && q.isSuccess,
    isLoading,
    isFetching: ready && q.isFetching,
    error: ready ? q.error : null,
    refetch: q.refetch,
  };
}

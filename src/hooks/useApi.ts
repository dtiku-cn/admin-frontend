import { useState, useCallback } from 'react';
import { api } from '../api/serverApi';
import { ScheduleTaskType } from '../types';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useApi<T>(apiCall: () => Promise<T>) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error : new Error('An error occurred') 
      }));
    }
  }, [apiCall]);

  return {
    ...state,
    refetch: fetchData
  };
}

// Specific API hooks
export function useTasks() {
  return useApi(api.getTasks);
}

export function useTask(id: number) {
  return useApi(() => api.getTask(id));
}

export function useTaskInstance(id: string) {
  return useApi(() => api.getTaskInstance(id));
}

export function useInstanceLogs(id: string) {
  return useApi(() => api.getInstanceLogs(id));
}

export function useConfigs() {
  return useApi(api.getConfigs);
}
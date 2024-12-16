export type ScheduleTaskType = 'CRON' | 'INTERVAL' | 'ONE_TIME';

export interface TaskInstance {
  id: string;
  start_time: string;
  end_time?: string;
}

export interface ScheduleTask {
  id?: number;
  version: number;
  ty: ScheduleTaskType;
  desc: string;
  active: boolean;
  context: any;
  run_count: number;
  instances: TaskInstance[];
  created?: string;
  modified?: string;
}

export interface SystemConfig {
  id?: number;
  version: number;
  key: string;
  key_desc: string;
  value?: any;
  created?: string;
  modified?: string;
}

export interface GetListResult<T> {
  data: T[],
  total: number,
}
import { ReactNode } from 'react';

export interface SystemConfig {
  id: number | null;
  version: number;
  key: string;
  key_desc: string;
  value?: any;
  created?: string | null;
  modified?: string | null;
}

export interface ScheduleTask {
  id: number | null;
  version: number;
  ty: string;
  desc: string;
  active: boolean;
  context: any;
  run_count: number;
  instances: any;
  created?: string | null;
  modified?: string | null;
}

export interface MenuItem {
  key: string;
  icon?: ReactNode;
  label: string;
  children?: MenuItem[];
}
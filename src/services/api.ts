import type { SystemConfig, ScheduleTask } from '../types.ts';
import { mockSystemConfigs } from '../mock/systemConfig.ts';
import { mockScheduleTasks } from '../mock/scheduleTask.ts';

// 配置是否使用mock数据
const USE_MOCK = false;
const API_BASE_URL = 'http://localhost:5174/api';

interface ApiResponse<T> {
  data: T[];
  total: number;
}

export const systemConfigService = {
  async getList(): Promise<ApiResponse<SystemConfig>> {
    if (USE_MOCK) {
      return mockSystemConfigs;
    }
    const response = await fetch(`${API_BASE_URL}/configs`);
    return response.json();
  },

  async update(config: SystemConfig): Promise<SystemConfig> {
    if (USE_MOCK) {
      return config;
    }
    const response = await fetch(`${API_BASE_URL}/configs/${config.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    return response.json();
  },

  async create(config: Partial<SystemConfig>): Promise<SystemConfig> {
    if (USE_MOCK) {
      return {
        ...config,
        id: Math.floor(Math.random() * 1000),
        version: 0,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      } as SystemConfig;
    }
    const response = await fetch(`${API_BASE_URL}/configs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    return response.json();
  },
};

export const scheduleTaskService = {
  async getList(): Promise<ApiResponse<ScheduleTask>> {
    if (USE_MOCK) {
      return mockScheduleTasks;
    }
    const response = await fetch(`${API_BASE_URL}/tasks`);
    return response.json();
  },

  async update(task: ScheduleTask): Promise<ScheduleTask> {
    if (USE_MOCK) {
      return task;
    }
    const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    return response.json();
  },

  async create(task: Partial<ScheduleTask>): Promise<ScheduleTask> {
    if (USE_MOCK) {
      return {
        ...task,
        id: Math.floor(Math.random() * 1000),
        version: 0,
        runCount: 0,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      } as ScheduleTask;
    }
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    return response.json();
  },

  async toggleActive(id: number, active: boolean): Promise<ScheduleTask> {
    if (USE_MOCK) {
      return { id, active } as ScheduleTask;
    }
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ active }),
    });
    return response.json();
  },
};
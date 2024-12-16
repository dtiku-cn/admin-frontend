import type { GetListResult, ScheduleTask, ScheduleTaskType, SystemConfig, TaskInstance } from '../types';

const SERVER_URL = "/api";


// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockInstanceLogs = {
  'inst_1': [
    { timestamp: '2024-03-15T10:00:00Z', level: 'INFO', message: 'Task started' },
    { timestamp: '2024-03-15T10:00:30Z', level: 'INFO', message: 'Processing data...' },
    { timestamp: '2024-03-15T10:01:23Z', level: 'INFO', message: 'Task completed successfully' }
  ],
  'inst_2': [
    { timestamp: '2024-03-15T11:00:00Z', level: 'INFO', message: 'Task started' },
    { timestamp: '2024-03-15T11:00:45Z', level: 'WARN', message: 'High memory usage detected' },
    { timestamp: '2024-03-15T11:01:15Z', level: 'INFO', message: 'Task completed with warnings' }
  ],
  'inst_3': [
    { timestamp: '2024-03-15T12:00:00Z', level: 'INFO', message: 'Task started' },
    { timestamp: '2024-03-15T12:00:15Z', level: 'ERROR', message: 'Connection timeout' },
    { timestamp: '2024-03-15T12:00:30Z', level: 'INFO', message: 'Retrying connection...' }
  ]
};

export const api = {
  // Tasks
  async getTasks(): Promise<ScheduleTask[]> {
    return fetch(`${SERVER_URL}/tasks`)
      .then(resp => resp.json())
      .then(json => json.data);
  },

  async getTask(id: number): Promise<ScheduleTask | undefined> {
    return fetch(`${SERVER_URL}/tasks/${id}`)
      .then(resp => resp.json())
      .then(json => json.data);
  },

  async toggleTaskActive(ty: ScheduleTaskType): Promise<void> {
    return fetch(`${SERVER_URL}/tasks/${ty}`)
      .then(resp => resp.json())
      .then(json => json.data);
  },

  // Task Instances
  async getTaskInstance(instanceId: string): Promise<TaskInstance | undefined> {
    return {
      id: 'inst_1',
      start_time: '2024-03-15T10:00:00Z',
      end_time: '2024-03-15T10:01:23Z'
    }
  },

  async getInstanceLogs(instanceId: string): Promise<any[]> {
    await delay(300);
    return mockInstanceLogs[instanceId as keyof typeof mockInstanceLogs] || [];
  },

  // System Config
  async getConfigs(): Promise<SystemConfig[]> {
    return fetch(`${SERVER_URL}/configs`)
      .then(resp => resp.json())
      .then(json => json.data);
  },

  async updateConfigValue(key: string, value: any): Promise<void> {
    return fetch(`${SERVER_URL}/configs/${key}`, { method: "PUT", body: value })
      .then(resp => resp.json())
      .then(json => json.data);
  }
};
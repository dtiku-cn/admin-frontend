import type {ScheduleTask, SystemConfig} from '../types.ts';

const API_BASE_URL = 'http://localhost:5174/api';

interface ApiResponse<T> {
    data: T[];
    total: number;
}

export const systemConfigService = {
    async getList(): Promise<ApiResponse<SystemConfig>> {
        const response = await fetch(`${API_BASE_URL}/configs`);
        return response.json();
    },

    async update(config: SystemConfig): Promise<SystemConfig> {
        const response = await fetch(`${API_BASE_URL}/configs/${config.key}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config.value),
        });
        return response.json();
    },
};

export const scheduleTaskService = {
    async getList(): Promise<ApiResponse<ScheduleTask>> {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        return response.json();
    },

    async get(ty: string): Promise<ScheduleTask> {
        const response = await fetch(`${API_BASE_URL}/tasks/${ty}`);
        return response.json();
    },

    async update(task: ScheduleTask): Promise<ScheduleTask> {
        const response = await fetch(`${API_BASE_URL}/tasks/${task.ty}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });
        return response.json();
    },

    async create(task: Partial<ScheduleTask>): Promise<ScheduleTask> {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });
        return response.json();
    },

    async toggleActive(ty: string, active: boolean): Promise<ScheduleTask> {
        const response = await fetch(`${API_BASE_URL}/tasks/${ty}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({active}),
        });
        return response.json();
    },
};
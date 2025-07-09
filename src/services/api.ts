import type { ExamCategory, KeyPoint, Label, PageResult, ScheduleTask, SystemConfig, User, UserStatsByDay } from '../types.ts';

const API_BASE_URL = '/api';

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
            body: JSON.stringify({ active }),
        });
        return response.json();
    },

    async continueTask(ty: string, active: boolean): Promise<ScheduleTask> {
        const response = await fetch(`${API_BASE_URL}/tasks/${ty}/continue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ active }),
        });
        return response.json();
    },
};


export const examCategoryService = {
    async find_exam_by_pid(pid: number = 0): Promise<ApiResponse<ExamCategory>> {
        const response = await fetch(`${API_BASE_URL}/exam/${pid}`);
        return response.json();
    },

    async find_label_by_pid(paper_type: number, pid: number = 0): Promise<ApiResponse<Label>> {
        const response = await fetch(`${API_BASE_URL}/label?paper_type=${paper_type}&pid=${pid}`);
        return response.json();
    }
}

export const KeyPointService = {
    async find_by_pid(paper_type: number, pid: number = 0): Promise<ApiResponse<KeyPoint>> {
        const res = await fetch(`${API_BASE_URL}/keypoint/${paper_type}/${pid}`);
        return res.json();
    }
}

export const UserService = {
    async fetch_users(page: number, size: number): Promise<PageResult<User>> {
        const res = await fetch(`${API_BASE_URL}/users?page=${page}&page_size=${size}`);
        return await res.json();
    },

    async fetch_user_stats(): Promise<UserStatsByDay[]> {
        const res = await fetch(`${API_BASE_URL}/user_stats`);
        return await res.json();
    }
}
import type { ExamCategory, KeyPoint, Label, PageResult, ScheduleTask, SearchItem, SystemConfig, TextSimilarityResult, User, UserQuery, UserStatsByDay, WebTextExtractResult, WebTextLabelResponse } from '../types.ts';

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
    async fetch_users(page: number, size: number, query: UserQuery = {}): Promise<PageResult<User>> {
        const params = new URLSearchParams({
            page: String(page),
            size: String(size),
            ...(query.name ? { name: query.name } : {}),
            ...(query.expired !== undefined ? { expired: String(query.expired) } : {}),
        });
        const res = await fetch(`${API_BASE_URL}/users?${params.toString()}`);
        return await res.json();
    },

    async fetch_user_stats(): Promise<UserStatsByDay[]> {
        const res = await fetch(`${API_BASE_URL}/user_stats`);
        return await res.json();
    }
}

export const TestService = {
    async fetchTextSimilarity(source: string, target: string): Promise<TextSimilarityResult> {
        const res = await fetch(`${API_BASE_URL}/text_similarity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ source, target }),
        });
        return await res.json();
    },

    async fetchWebContent(url: string): Promise<WebTextExtractResult> {
        const response = await fetch(`${API_BASE_URL}/web_text_extract?url=${encodeURIComponent(url)}`);
        return await response.json();
    },

    async fetchWebSearch(questionId: string, searchEngine: string): Promise<SearchItem[]> {
        const response = await fetch(`${API_BASE_URL}/web_search/${questionId}/${searchEngine}`);
        return await response.json();
    },

    async fetchWebTextLabel(params: { url: string; label_text: Record<string, string>; threshold?: number }) {
        return fetch('/api/web_text_label', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        }).then((res) => res.json());
    },

    async fetchWebTextSimilarity(params: { url: string; label_text: Record<string, string>; threshold?: number }) {
        return fetch('/api/web_text_similarity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        }).then((res) => res.json());
    },

    async fetchOpenAI(text: string, select_model: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/test_call_open_ai/${select_model}:free`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: text,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`请求失败: ${response.status} ${errorText}`);
        }

        return await response.json();
    }
}
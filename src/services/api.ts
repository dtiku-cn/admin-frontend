import type { BlockedIp, ExamCategory, FromType, HotUrl, KeyPoint, Label, OnlineUserStats, PageResult, PayOrder, PayOrderQuery, PayStatsByDay, RateLimitConfig, ScheduleTask, SearchItem, SuspiciousUser, SystemConfig, TextSimilarityResult, TrafficStats, User, UserQuery, UserStatsByDay, WebTextExtractResult, WebTextLabelResponse } from '../types.ts';

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
    async find_exam_by_pid(pid: number = 0, from_ty?: FromType): Promise<ApiResponse<ExamCategory>> {
        const from_ty_param = from_ty ? '&from_ty=' + String(from_ty) : '';
        const response = await fetch(`${API_BASE_URL}/exam?pid=${pid}${from_ty_param}`);
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
            ...(query.id !== undefined ? { id: String(query.id) } : {}),
            ...(query.name ? { name: query.name } : {}),
            ...(query.expired !== undefined ? { expired: String(query.expired) } : {}),
        });
        const res = await fetch(`${API_BASE_URL}/users?${params.toString()}`);
        return await res.json();
    },

    async fetch_user_stats(start_date?: string, end_date?: string): Promise<UserStatsByDay[]> {
        const params = new URLSearchParams();
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);
        const queryString = params.toString();
        const res = await fetch(`${API_BASE_URL}/user_stats${queryString ? '?' + queryString : ''}`);
        return await res.json();
    },

    async fetch_online_users(): Promise<OnlineUserStats> {
        const res = await fetch(`${API_BASE_URL}/online_users`);
        return await res.json();
    },

    async extend_user_expiration(userId: number, days: number): Promise<User> {
        const res = await fetch(`${API_BASE_URL}/users/${userId}/extend/${days}`, {
            method: 'POST',
        });
        if (!res.ok) {
            throw new Error(`延长用户过期时间失败: ${res.statusText}`);
        }
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

export const PayOrderService = {
    async fetch_pay_orders(page: number, size: number, query: PayOrderQuery = {}): Promise<PageResult<PayOrder>> {
        const params = new URLSearchParams({
            page: String(page),
            size: String(size),
            ...(query.user_id ? { user_id: String(query.user_id) } : {}),
            ...(query.status ? { status: query.status } : {}),
            ...(query.pay_from ? { pay_from: query.pay_from } : {}),
        });
        const res = await fetch(`${API_BASE_URL}/pay/orders?${params.toString()}`);
        return await res.json();
    },

    async fetch_pay_stats(start_date?: string, end_date?: string): Promise<PayStatsByDay[]> {
        const params = new URLSearchParams();
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);
        const queryString = params.toString();
        const res = await fetch(`${API_BASE_URL}/pay/stats${queryString ? '?' + queryString : ''}`);
        return await res.json();
    }
}

export const RealtimeStatsService = {
    async fetch_hosts(): Promise<string[]> {
        const res = await fetch(`${API_BASE_URL}/stats/hosts`);
        return await res.json();
    },

    async fetch_blocked_ips(host?: string): Promise<BlockedIp[]> {
        const params = new URLSearchParams();
        if (host) params.append('host', host);
        const queryString = params.toString();
        const res = await fetch(`${API_BASE_URL}/stats/blocked-ips${queryString ? '?' + queryString : ''}`);
        return await res.json();
    },

    async fetch_suspicious_users(host?: string): Promise<SuspiciousUser[]> {
        const params = new URLSearchParams();
        if (host) params.append('host', host);
        const queryString = params.toString();
        const res = await fetch(`${API_BASE_URL}/stats/suspicious-users${queryString ? '?' + queryString : ''}`);
        return await res.json();
    },

    async fetch_traffic_stats(host?: string): Promise<TrafficStats[]> {
        const params = new URLSearchParams();
        if (host) params.append('host', host);
        const queryString = params.toString();
        const res = await fetch(`${API_BASE_URL}/stats/traffic${queryString ? '?' + queryString : ''}`);
        return await res.json();
    },

    async fetch_rate_limits(host?: string): Promise<RateLimitConfig[]> {
        const params = new URLSearchParams();
        if (host) params.append('host', host);
        const queryString = params.toString();
        const res = await fetch(`${API_BASE_URL}/stats/rate-limits${queryString ? '?' + queryString : ''}`);
        return await res.json();
    },

    async fetch_hot_urls(host?: string): Promise<HotUrl[]> {
        const params = new URLSearchParams();
        if (host) params.append('host', host);
        const queryString = params.toString();
        const res = await fetch(`${API_BASE_URL}/stats/hot-urls${queryString ? '?' + queryString : ''}`);
        return await res.json();
    }
}
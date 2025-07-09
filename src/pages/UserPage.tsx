// src/pages/UserPage.tsx
import React, { useEffect, useState } from 'react';
import { Table, Pagination, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { UserService } from '../services/api';
import { User } from '../types';

const pageSize = 10;

const UserPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [stats, setStats] = useState<{ day: string; count: number }[]>([]);

    useEffect(() => {
        UserService.fetch_users(page, pageSize)
            .then(data => {
                setUsers(data.content);
                setTotal(data.total_elements);
            })
            .catch(console.error);
    }, [page]);

    useEffect(() => {
        UserService.fetch_user_stats()
            .then(data => setStats(data))
            .catch(console.error);
    }, []);

    const columns: ColumnsType<User> = [
        { title: 'ID', dataIndex: 'id' },
        {
            title: '头像',
            dataIndex: 'avatar',
            render: (url: string) => (
                <img src={url} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            ),
        },
        { title: '姓名', dataIndex: 'name' },
        { title: '微信ID', dataIndex: 'wechat_id' },
        {
            title: '性别',
            dataIndex: 'gender',
            render: (g: boolean) => (g ? '男' : '女'),
        },
        {
            title: '注册时间',
            dataIndex: 'created',
            render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: '修改时间',
            dataIndex: 'modified',
            render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: '过期时间',
            dataIndex: 'expired',
            render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
        },
    ];

    const chartOption = {
        title: { text: '每日新增用户' },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: stats.map(s => s.day.split('T')[0]),
        },
        yAxis: { type: 'value' },
        series: [
            {
                name: '用户数',
                type: 'line',
                data: stats.map(s => s.count),
                smooth: true,
                lineStyle: { color: '#1890ff' },
                areaStyle: { color: '#e6f7ff' },
            },
        ],
    };

    return (
        <>
            <Card title="用户增长趋势" style={{ marginBottom: 24 }}>
                <ReactECharts option={chartOption} style={{ height: 400 }} />
            </Card>

            <Card title="用户列表">
                <Table rowKey="id" columns={columns} dataSource={users} pagination={false} />
                <Pagination
                    style={{ marginTop: 16, textAlign: 'right' }}
                    total={total}
                    current={page}
                    pageSize={pageSize}
                    onChange={setPage}
                />
            </Card>
        </>
    );
};

export default UserPage;

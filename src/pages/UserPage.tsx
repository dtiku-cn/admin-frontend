// src/pages/UserPage.tsx
import React, { useEffect, useState } from 'react';
import { Table, Pagination, Card, Form, Row, Col, Input, Select, Switch, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { UserService } from '../services/api';
import { User, UserQuery } from '../types';

const pageSize = 10;

const UserPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState<UserQuery>({});
    const [stats, setStats] = useState<{ day: string; count: number }[]>([]);
    const [form] = Form.useForm();

    const loadUsers = () => {
        UserService.fetch_users(page, pageSize, query)
            .then(data => {
                setUsers(data.content);
                setTotal(data.total_elements);
            })
            .catch(console.error);
    };

    useEffect(() => {
        loadUsers();
    }, [page, query]);

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

    const onFinish = (values: any) => {
        const parsedQuery: UserQuery = {
            name: values.name || undefined,
            gender: values.gender !== 'all' ? values.gender : undefined,
            expired: values.expired ?? undefined,
        };
        setPage(1); // 重置到第一页
        setQuery(parsedQuery);
    };

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

            <Card title="用户列表" extra={
                <Form form={form} layout="inline" onFinish={onFinish}>
                    <Row gutter={12}>
                        <Col>
                            <Form.Item name="name">
                                <Input placeholder="姓名关键词" allowClear />
                            </Form.Item>
                        </Col>
                        <Col>
                            <Form.Item name="gender" initialValue="all">
                                <Select style={{ width: 120 }}>
                                    <Select.Option value="all">性别不限</Select.Option>
                                    <Select.Option value={true}>男</Select.Option>
                                    <Select.Option value={false}>女</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col>
                            <Form.Item name="expired" valuePropName="checked">
                                <Switch checkedChildren="已过期" unCheckedChildren="未过期" />
                            </Form.Item>
                        </Col>
                        <Col>
                            <Button type="primary" htmlType="submit">查询</Button>
                        </Col>
                    </Row>
                </Form>
            }>
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

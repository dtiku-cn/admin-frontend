// src/pages/UserPage.tsx
import React, { useEffect, useState } from 'react';
import { Table, Pagination, Card, Form, Row, Col, Input, Select, Button, Statistic, Grid } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import ReactECharts from 'echarts-for-react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { UserService } from '../services/api';
import { User, UserQuery } from '../types';

const { useBreakpoint } = Grid;

const pageSize = 10;

const UserPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState<UserQuery>({});
    const [stats, setStats] = useState<{ day: string; count: number }[]>([]);
    const [form] = Form.useForm();
    const screens = useBreakpoint();

    // 从URL参数初始化查询条件
    useEffect(() => {
        const nameParam = searchParams.get('name');
        if (nameParam) {
            const initialQuery: UserQuery = { name: nameParam };
            setQuery(initialQuery);
            form.setFieldsValue({ name: nameParam });
        }
    }, [searchParams, form]);

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
        { 
            title: 'ID', 
            dataIndex: 'id',
            responsive: ['md'] as Breakpoint[],
        },
        {
            title: '头像',
            dataIndex: 'avatar',
            render: (url: string) => (
                <img src={url} alt="avatar" style={{ width: screens.xs ? 32 : 40, height: screens.xs ? 32 : 40, borderRadius: '50%' }} />
            ),
        },
        { title: '姓名', dataIndex: 'name' },
        { 
            title: '微信ID', 
            dataIndex: 'wechat_id',
            responsive: ['lg'] as Breakpoint[],
        },
        {
            title: '注册时间',
            dataIndex: 'created',
            responsive: ['md'] as Breakpoint[],
            render: (v: string) => dayjs(v).format(screens.lg ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'),
        },
        {
            title: '修改时间',
            dataIndex: 'modified',
            responsive: ['lg'] as Breakpoint[],
            render: (v: string) => dayjs(v).format(screens.lg ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'),
        },
        {
            title: '过期时间',
            dataIndex: 'expired',
            render: (v: string) => dayjs(v).format(screens.lg ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'),
        },
    ];

    const onFinish = (values: any) => {
        const parsedQuery: UserQuery = {
            name: values.name || undefined,
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

    const todayAdd = stats.length > 0 ? stats[stats.length - 1]?.count : 0;
    const yesterdayAdd = stats.length > 1 ? stats[stats.length - 2]?.count : 0;
    const fontSize = { fontSize: "1.5em" };

    return (
        <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={12} lg={6}>
                    <Card>
                        <Statistic 
                            title="用户总数"
                            value={total}
                            valueStyle={{ ...fontSize, fontSize: screens.xs ? '1.2em' : '1.5em' }}
                            suffix={<small style={{ marginLeft: 8, color: "#3f8600" }}>+{todayAdd}</small>} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                    <Card>
                        <Statistic 
                            title="今日新增用户数"
                            value={`+${todayAdd}`}
                            valueStyle={{ color: todayAdd > yesterdayAdd ? "#3f8600" : '#cf1322', ...fontSize, fontSize: screens.xs ? '1.2em' : '1.5em' }}
                            prefix={todayAdd == yesterdayAdd ? null : todayAdd > yesterdayAdd ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            suffix={<small style={{ marginLeft: 8 }}>昨日+{yesterdayAdd}</small>} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                    <Card>
                        <Statistic 
                            title="已付费用户数" 
                            value={0} 
                            valueStyle={{ ...fontSize, fontSize: screens.xs ? '1.2em' : '1.5em' }} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                    <Card>
                        <Statistic 
                            title="昨日付费用户数" 
                            value={0} 
                            valueStyle={{ ...fontSize, fontSize: screens.xs ? '1.2em' : '1.5em' }} 
                        />
                    </Card>
                </Col>
            </Row>
            <Card 
                title="用户增长趋势" 
                style={{ marginBottom: 24 }}
                styles={{ body: { padding: screens.xs ? 12 : 24 } }}
            >
                <ReactECharts 
                    option={chartOption} 
                    style={{ height: screens.xs ? 250 : 400 }} 
                />
            </Card>

            <Card 
                title="用户列表"
                styles={{ body: { padding: screens.xs ? 12 : 24 } }}
            >
                <Form 
                    form={form} 
                    layout={screens.md ? "inline" : "vertical"}
                    onFinish={onFinish}
                    style={{ marginBottom: 16 }}
                >
                    <Row gutter={[12, 12]}>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="name" style={{ marginBottom: screens.md ? 0 : undefined }}>
                                <Input placeholder="姓名关键词" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="expired" initialValue={null} style={{ marginBottom: screens.md ? 0 : undefined }}>
                                <Select>
                                    <Select.Option value={null}>不限</Select.Option>
                                    <Select.Option value={true}>已过期</Select.Option>
                                    <Select.Option value={false}>未过期</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Button type="primary" htmlType="submit" block={screens.xs}>查询</Button>
                        </Col>
                    </Row>
                </Form>
                <Table 
                    rowKey="id" 
                    columns={columns} 
                    dataSource={users} 
                    pagination={false}
                    size={screens.xs ? 'small' : 'middle'}
                    scroll={{ x: screens.xs ? 600 : undefined }}
                />
                <Pagination
                    style={{ marginTop: 16, textAlign: screens.xs ? 'center' : 'right' }}
                    total={total}
                    current={page}
                    pageSize={pageSize}
                    onChange={setPage}
                    size={screens.xs ? 'small' : 'default'}
                />
            </Card>
        </>
    );
};

export default UserPage;

// src/pages/UserPage.tsx
import React, { useEffect, useState } from 'react';
import { Table, Pagination, Card, Form, Row, Col, Input, Select, Button, Statistic, Grid, Carousel, Avatar, Typography, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import ReactECharts from 'echarts-for-react';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { UserService } from '../services/api';
import { User, UserQuery, OnlineUserStats } from '../types';

const { useBreakpoint } = Grid;
const { Text } = Typography;
const { RangePicker } = DatePicker;

const pageSize = 10;

const UserPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState<UserQuery>({});
    const [stats, setStats] = useState<{ day: string; count: number }[]>([]);
    const [onlineStats, setOnlineStats] = useState<OnlineUserStats>({ online_count: 0, online_users: [] });
    const [form] = Form.useForm();
    const screens = useBreakpoint();
    
    // 日期范围状态，默认最近30天
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);

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
        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1].format('YYYY-MM-DD');
        
        UserService.fetch_user_stats(startDate, endDate)
            .then(data => setStats(data))
            .catch(console.error);
    }, [dateRange]);

    // 加载在线用户数据
    const loadOnlineUsers = () => {
        UserService.fetch_online_users()
            .then(data => setOnlineStats(data))
            .catch(console.error);
    };

    useEffect(() => {
        loadOnlineUsers();
        // 每30秒刷新一次在线用户数据
        const interval = setInterval(loadOnlineUsers, 30000);
        return () => clearInterval(interval);
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
        grid: {
            left: '3%',
            right: '5%',
            bottom: '10%',
            top: '15%',
            containLabel: true
        },
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

    // 将在线用户分组，每组显示8个
    const groupOnlineUsers = () => {
        const groups = [];
        const itemsPerSlide = screens.xs ? 4 : 8;
        for (let i = 0; i < onlineStats.online_users.length; i += itemsPerSlide) {
            groups.push(onlineStats.online_users.slice(i, i + itemsPerSlide));
        }
        return groups;
    };

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
                            title="当日实时在线" 
                            value={onlineStats.online_count} 
                            valueStyle={{ color: "#1890ff", ...fontSize, fontSize: screens.xs ? '1.2em' : '1.5em' }}
                            prefix={<UserOutlined />}
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
            </Row>

            {onlineStats.online_count > 0 && (
                <Card 
                    title="实时在线用户" 
                    style={{ marginBottom: 24 }}
                    styles={{ body: { padding: screens.xs ? 12 : 24 } }}
                >
                    <Carousel autoplay autoplaySpeed={5000} dots={true}>
                        {groupOnlineUsers().map((group, groupIndex) => (
                            <div key={groupIndex}>
                                <Row gutter={[16, 16]} justify="start">
                                    {group.map((user) => (
                                        <Col 
                                            key={user.id} 
                                            xs={12} 
                                            sm={8} 
                                            md={6} 
                                            lg={3}
                                            style={{ textAlign: 'center' }}
                                        >
                                            <div style={{ 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                alignItems: 'center',
                                                padding: screens.xs ? 8 : 16,
                                            }}>
                                                <Avatar 
                                                    src={user.avatar} 
                                                    size={screens.xs ? 48 : 64} 
                                                    icon={<UserOutlined />}
                                                    style={{ marginBottom: 8 }}
                                                />
                                                <Text 
                                                    ellipsis={{ tooltip: user.name }}
                                                    style={{ 
                                                        maxWidth: '100%',
                                                        fontSize: screens.xs ? 12 : 14,
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {user.name}
                                                </Text>
                                                <Text 
                                                    type="secondary"
                                                    style={{ 
                                                        fontSize: screens.xs ? 10 : 12,
                                                        marginTop: 4,
                                                    }}
                                                >
                                                    {dayjs(user.modified).format(screens.xs ? 'HH:mm' : 'MM-DD HH:mm')}
                                                </Text>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        ))}
                    </Carousel>
                </Card>
            )}
            
            <Card 
                title="用户增长趋势" 
                extra={
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                                setDateRange([dates[0], dates[1]]);
                            }
                        }}
                        format="YYYY-MM-DD"
                        allowClear={false}
                        presets={[
                            { label: '最近一周', value: [dayjs().subtract(7, 'days'), dayjs()] },
                            { label: '最近一个月', value: [dayjs().subtract(30, 'days'), dayjs()] },
                            { label: '最近三个月', value: [dayjs().subtract(90, 'days'), dayjs()] },
                            { label: '最近半年', value: [dayjs().subtract(180, 'days'), dayjs()] },
                            { label: '最近一年', value: [dayjs().subtract(365, 'days'), dayjs()] },
                        ]}
                    />
                }
                style={{ marginBottom: 24 }}
                styles={{ body: { padding: screens.xs ? 12 : 24 } }}
            >
                <ReactECharts 
                    option={chartOption} 
                    style={{ width: '100%', height: screens.xs ? '250px' : '400px' }} 
                    opts={{ renderer: 'canvas' }}
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

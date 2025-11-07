import React, { useEffect, useState, useCallback } from 'react';
import { Table, Pagination, Card, Form, Row, Col, Input, Select, Button, Tag, Tooltip, Avatar, Grid, Space, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import ReactECharts from 'echarts-for-react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { PayOrderService } from '../services/api';
import { 
    PayOrder, 
    PayOrderQuery, 
    OrderStatus, 
    OrderLevel, 
    PayFrom,
    OrderStatusDesc,
    OrderLevelDesc,
    PayFromDesc,
    ORDER_STATUS_COLORS,
    PayStatsByDay
} from '../types';

const { useBreakpoint } = Grid;

const pageSize = 10;

const PayOrderPage: React.FC = () => {
    const [orders, setOrders] = useState<PayOrder[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState<PayOrderQuery>({});
    const [stats, setStats] = useState<PayStatsByDay[]>([]);
    const [unpaidUserCount, setUnpaidUserCount] = useState(0);
    const [form] = Form.useForm();
    const screens = useBreakpoint();

    const loadOrders = useCallback(() => {
        PayOrderService.fetch_pay_orders(page, pageSize, query)
            .then(data => {
                setOrders(data.content);
                setTotal(data.total_elements);
            })
            .catch(console.error);
    }, [page, query]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    useEffect(() => {
        PayOrderService.fetch_pay_stats()
            .then(data => {
                setStats(data.stats);
                setUnpaidUserCount(data.unpaid_user_count);
            })
            .catch(console.error);
    }, []);

    const columns: ColumnsType<PayOrder> = [
        { 
            title: '订单ID', 
            dataIndex: 'id', 
            width: 100,
            fixed: screens.md ? undefined : 'left',
        },
        {
            title: '用户',
            dataIndex: 'user_name',
            width: 200,
            render: (userName: string | undefined, record: PayOrder) => (
                userName ? (
                    <Link to={`/user?name=${encodeURIComponent(userName)}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar src={record.user_avatar} size={screens.xs ? 24 : 32}>
                            {userName.charAt(0)}
                        </Avatar>
                        {!screens.xs && <span>{userName}</span>}
                    </Link>
                ) : (
                    <Tooltip title={`用户ID: ${record.user_id}`}>
                        <span style={{ color: '#999' }}>用户{record.user_id}</span>
                    </Tooltip>
                )
            ),
        },
        {
            title: '会员类型',
            dataIndex: 'level',
            width: 120,
            responsive: ['sm'] as Breakpoint[],
            render: (level: OrderLevel) => OrderLevelDesc[level],
        },
        {
            title: '支付方式',
            dataIndex: 'pay_from',
            width: 120,
            responsive: ['md'] as Breakpoint[],
            render: (payFrom: PayFrom) => PayFromDesc[payFrom],
        },
        {
            title: '订单状态',
            dataIndex: 'status',
            width: 120,
            render: (status: OrderStatus) => (
                <Tag color={ORDER_STATUS_COLORS[status]}>{OrderStatusDesc[status]}</Tag>
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'created',
            width: 110,
            responsive: ['md'] as Breakpoint[],
            render: (v: string) => (
                <Tooltip title={dayjs(v).format('YYYY-MM-DD HH:mm:ss')}>
                    {dayjs(v).format('YYYY-MM-DD')}
                </Tooltip>
            ),
        },
        {
            title: '确认时间',
            dataIndex: 'confirm',
            width: 110,
            responsive: ['lg'] as Breakpoint[],
            render: (v: string | null) => v ? (
                <Tooltip title={dayjs(v).format('YYYY-MM-DD HH:mm:ss')}>
                    {dayjs(v).format('YYYY-MM-DD')}
                </Tooltip>
            ) : '-',
        },
        {
            title: '修改时间',
            dataIndex: 'modified',
            width: 110,
            responsive: ['lg'] as Breakpoint[],
            render: (v: string) => (
                <Tooltip title={dayjs(v).format('YYYY-MM-DD HH:mm:ss')}>
                    {dayjs(v).format('YYYY-MM-DD')}
                </Tooltip>
            ),
        },
    ];

    const onFinish = (values: { user_id?: string; status?: string; pay_from?: string }) => {
        const parsedQuery: PayOrderQuery = {
            user_id: values.user_id ? parseInt(values.user_id) : undefined,
            status: (values.status || undefined) as OrderStatus | undefined,
            pay_from: (values.pay_from || undefined) as PayFrom | undefined,
        };
        setPage(1); // 重置到第一页
        setQuery(parsedQuery);
    };

    const onReset = () => {
        form.resetFields();
        setPage(1);
        setQuery({});
    };

    const paidCountOption = {
        title: { text: '每日付款数量' },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: stats.map(s => s.day.split('T')[0]),
        },
        yAxis: { type: 'value' },
        series: [
            {
                name: '付款数量',
                type: 'line',
                data: stats.map(s => s.paid_count),
                smooth: true,
                lineStyle: { color: '#52c41a' },
                areaStyle: { color: '#f6ffed' },
            },
        ],
    };

    const paidAmountOption = {
        title: { text: '每日付款金额（元）' },
        tooltip: { 
            trigger: 'axis',
            formatter: (params: any) => {
                const item = params[0];
                return `${item.axisValue}<br/>${item.marker}${item.seriesName}: ${item.value}元`;
            }
        },
        xAxis: {
            type: 'category',
            data: stats.map(s => s.day.split('T')[0]),
        },
        yAxis: { type: 'value' },
        series: [
            {
                name: '付款金额',
                type: 'bar',
                data: stats.map(s => s.paid_amount / 100), // 分转元
                itemStyle: { color: '#1890ff' },
            },
        ],
    };

    const unpaidUserOption = {
        title: { text: '每日未付款用户数' },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: stats.map(s => s.day.split('T')[0]),
        },
        yAxis: { type: 'value' },
        series: [
            {
                name: '未付款用户',
                type: 'line',
                data: stats.map(s => s.unpaid_user_count),
                smooth: true,
                lineStyle: { color: '#faad14' },
                areaStyle: { color: '#fffbe6' },
            },
        ],
    };

    const todayPaidCount = stats.length > 0 ? stats[stats.length - 1]?.paid_count || 0 : 0;
    const yesterdayPaidCount = stats.length > 1 ? stats[stats.length - 2]?.paid_count || 0 : 0;
    const todayPaidAmount = stats.length > 0 ? (stats[stats.length - 1]?.paid_amount || 0) / 100 : 0; // 分转元
    const yesterdayPaidAmount = stats.length > 1 ? (stats[stats.length - 2]?.paid_amount || 0) / 100 : 0; // 分转元
    const totalPaidAmount = stats.reduce((sum, s) => sum + s.paid_amount, 0) / 100; // 总金额（元）
    const fontSize = { fontSize: "1.5em" };

    return (
        <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic 
                            title="订单总数"
                            value={total}
                            valueStyle={{ ...fontSize, fontSize: screens.xs ? '1.2em' : '1.5em' }}
                            suffix={<small style={{ marginLeft: 8, color: "#3f8600" }}>+{todayPaidCount}</small>} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic 
                            title="今日付款"
                            value={todayPaidCount}
                            valueStyle={{ 
                                ...fontSize, 
                                fontSize: screens.xs ? '1.2em' : '1.5em',
                                color: todayPaidCount >= yesterdayPaidCount ? '#3f8600' : '#cf1322' 
                            }}
                            prefix={todayPaidCount >= yesterdayPaidCount ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            suffix={`单 (${yesterdayPaidCount >= 0 ? (todayPaidCount - yesterdayPaidCount >= 0 ? '+' : '') + (todayPaidCount - yesterdayPaidCount) : 0})`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic 
                            title="今日金额"
                            value={todayPaidAmount}
                            precision={2}
                            valueStyle={{ 
                                ...fontSize, 
                                fontSize: screens.xs ? '1.2em' : '1.5em',
                                color: todayPaidAmount >= yesterdayPaidAmount ? '#3f8600' : '#cf1322' 
                            }}
                            prefix={todayPaidAmount >= yesterdayPaidAmount ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            suffix="元"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic 
                            title="未付款用户"
                            value={unpaidUserCount}
                            valueStyle={{ ...fontSize, fontSize: screens.xs ? '1.2em' : '1.5em', color: '#faad14' }}
                            suffix="人"
                        />
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                    <Card>
                        <ReactECharts 
                            option={paidCountOption} 
                            style={{ height: screens.xs ? '250px' : '400px' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card>
                        <ReactECharts 
                            option={paidAmountOption} 
                            style={{ height: screens.xs ? '250px' : '400px' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card>
                        <ReactECharts 
                            option={unpaidUserOption} 
                            style={{ height: screens.xs ? '250px' : '400px' }}
                        />
                    </Card>
                </Col>
            </Row>
            <Card 
                title="支付订单查询"
                styles={{
                    body: { padding: screens.xs ? 12 : 24 }
                }}
            >
            <Form 
                form={form} 
                layout={screens.md ? "inline" : "vertical"}
                onFinish={onFinish}
                style={{ marginBottom: 16 }}
            >
                <Row gutter={[12, 12]}>
                    <Col xs={24} sm={12} md={6} lg={4}>
                        <Form.Item name="user_id" style={{ marginBottom: screens.md ? 0 : undefined }}>
                            <Input placeholder="用户ID" allowClear />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={5}>
                        <Form.Item name="status" initialValue="" style={{ marginBottom: screens.md ? 0 : undefined }}>
                            <Select placeholder="订单状态">
                                <Select.Option value="">全部状态</Select.Option>
                                {Object.entries(OrderStatusDesc).map(([key, value]) => (
                                    <Select.Option key={key} value={key}>{value}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={5}>
                        <Form.Item name="pay_from" initialValue="" style={{ marginBottom: screens.md ? 0 : undefined }}>
                            <Select placeholder="支付方式">
                                <Select.Option value="">全部方式</Select.Option>
                                {Object.entries(PayFromDesc).map(([key, value]) => (
                                    <Select.Option key={key} value={key}>{value}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={10}>
                        <Space>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={onReset}>重置</Button>
                        </Space>
                    </Col>
                </Row>
            </Form>
            <Table 
                rowKey="id" 
                columns={columns} 
                dataSource={orders} 
                pagination={false}
                scroll={{ x: screens.xs ? 800 : 950 }}
                size={screens.xs ? 'small' : 'middle'}
            />
            <Pagination
                style={{ marginTop: 16, textAlign: screens.xs ? 'center' : 'right' }}
                total={total}
                current={page}
                pageSize={pageSize}
                onChange={setPage}
                showTotal={(total) => `共 ${total} 条`}
                size={screens.xs ? 'small' : 'default'}
                showSizeChanger={false}
            />
        </Card>
        </>
    );
};

export default PayOrderPage;


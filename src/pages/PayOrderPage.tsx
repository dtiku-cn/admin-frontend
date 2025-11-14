import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Table, Pagination, Card, Form, Row, Col, Input, Select, Button, Tag, Tooltip, Avatar, Grid, Space, Statistic, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
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
const { RangePicker } = DatePicker;

const PAGE_SIZE = 10;

// 图表颜色配置
const CHART_COLORS = {
    paidCount: '#52c41a',
    paidAmount: '#1890ff',
    unpaidUser: '#faad14',
} as const;

// 统计颜色配置
const STAT_COLORS = {
    success: '#3f8600',
    error: '#cf1322',
    warning: '#faad14',
} as const;

// 格式化日期（去掉时间部分）
const formatDate = (dateStr: string): string => dateStr.split('T')[0];

// 分转元
const centsToYuan = (cents: number): number => cents / 100;

const PayOrderPage: React.FC = () => {
    const [orders, setOrders] = useState<PayOrder[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState<PayOrderQuery>({});
    const [stats, setStats] = useState<PayStatsByDay[]>([]);
    const [unpaidUserCount, setUnpaidUserCount] = useState(0);
    const [form] = Form.useForm();
    const screens = useBreakpoint();
    
    // 日期范围状态，默认最近30天
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);

    const loadOrders = useCallback(() => {
        PayOrderService.fetch_pay_orders(page, PAGE_SIZE, query)
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
        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1].format('YYYY-MM-DD');
        
        PayOrderService.fetch_pay_stats(startDate, endDate)
            .then(data => {
                setStats(data.stats);
                setUnpaidUserCount(data.unpaid_user_count);
            })
            .catch(console.error);
    }, [dateRange]);

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

    // 统计数据计算
    const statsData = useMemo(() => {
        const today = stats[stats.length - 1];
        const yesterday = stats[stats.length - 2];
        
        return {
            todayPaidCount: today?.paid_count || 0,
            yesterdayPaidCount: yesterday?.paid_count || 0,
            todayPaidAmount: centsToYuan(today?.paid_amount || 0),
            yesterdayPaidAmount: centsToYuan(yesterday?.paid_amount || 0),
        };
    }, [stats]);

    // 图表配置 - 每日付款统计（双Y轴）
    const paidCombinedOption: EChartsOption = useMemo(() => {
        const dates = stats.map(s => formatDate(s.day));
        const paidCounts = stats.map(s => s.paid_count);
        const paidAmounts = stats.map(s => centsToYuan(s.paid_amount));

        return {
            title: { text: '每日付款统计' },
            tooltip: { 
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: { color: '#999' }
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter: (params: any) => {
                    const paramArray = Array.isArray(params) ? params : [params];
                    const date = paramArray[0].axisValue;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const items = paramArray.map((item: any) => {
                        const unit = item.seriesName === '付款数量' ? '单' : '元';
                        return `${item.marker}${item.seriesName}: ${item.value}${unit}`;
                    }).join('<br/>');
                    return `${date}<br/>${items}`;
                }
            },
            legend: {
                data: ['付款数量', '付款金额'],
                top: 30,
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisPointer: { type: 'shadow' }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '付款数量',
                    position: 'left',
                    axisLabel: { formatter: '{value} 单' },
                    splitLine: { show: true }
                },
                {
                    type: 'value',
                    name: '付款金额',
                    position: 'right',
                    axisLabel: { formatter: '{value} 元' },
                    splitLine: { show: false }
                }
            ],
            series: [
                {
                    name: '付款金额',
                    type: 'bar',
                    yAxisIndex: 1,
                    data: paidAmounts,
                    itemStyle: { color: CHART_COLORS.paidAmount },
                },
                {
                    name: '付款数量',
                    type: 'line',
                    yAxisIndex: 0,
                    data: paidCounts,
                    smooth: true,
                    lineStyle: { color: CHART_COLORS.paidCount },
                    areaStyle: { color: 'rgba(82, 196, 26, 0.1)' },
                },
            ],
        };
    }, [stats]);

    // 图表配置 - 每日未付款用户数
    const unpaidUserOption: EChartsOption = useMemo(() => {
        const dates = stats.map(s => formatDate(s.day));
        const unpaidCounts = stats.map(s => s.unpaid_user_count);

        return {
            title: { text: '每日未付款用户数' },
            tooltip: { trigger: 'axis' },
            xAxis: {
                type: 'category',
                data: dates,
            },
            yAxis: { type: 'value' },
            series: [
                {
                    name: '未付款用户',
                    type: 'line',
                    data: unpaidCounts,
                    smooth: true,
                    lineStyle: { color: CHART_COLORS.unpaidUser },
                    areaStyle: { color: '#fffbe6' },
                },
            ],
        };
    }, [stats]);

    const { todayPaidCount, yesterdayPaidCount, todayPaidAmount, yesterdayPaidAmount } = statsData;
    const countDiff = todayPaidCount - yesterdayPaidCount;
    const amountDiff = todayPaidAmount - yesterdayPaidAmount;
    const valueFontSize = screens.xs ? '1.2em' : '1.5em';

    return (
        <>
            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic 
                            title="订单总数"
                            value={total}
                            valueStyle={{ fontSize: valueFontSize }}
                            suffix={
                                <small style={{ marginLeft: 8, color: STAT_COLORS.success }}>
                                    +{todayPaidCount}
                                </small>
                            } 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic 
                            title="今日付款"
                            value={todayPaidCount}
                            valueStyle={{ 
                                fontSize: valueFontSize,
                                color: countDiff >= 0 ? STAT_COLORS.success : STAT_COLORS.error
                            }}
                            prefix={countDiff >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            suffix={`单 (${countDiff >= 0 ? '+' : ''}${countDiff})`}
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
                                fontSize: valueFontSize,
                                color: amountDiff >= 0 ? STAT_COLORS.success : STAT_COLORS.error
                            }}
                            prefix={amountDiff >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            suffix="元"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic 
                            title="未付款用户"
                            value={unpaidUserCount}
                            valueStyle={{ fontSize: valueFontSize, color: STAT_COLORS.warning }}
                            suffix="人"
                        />
                    </Card>
                </Col>
            </Row>
            {/* 统计图表 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <Card
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
                    >
                        <ReactECharts 
                            option={paidCombinedOption} 
                            style={{ height: screens.xs ? '300px' : '400px' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card>
                        <ReactECharts 
                            option={unpaidUserOption} 
                            style={{ height: screens.xs ? '300px' : '400px' }}
                        />
                    </Card>
                </Col>
            </Row>
            {/* 订单查询与列表 */}
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
                pageSize={PAGE_SIZE}
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


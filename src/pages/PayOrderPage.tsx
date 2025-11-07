import React, { useEffect, useState, useCallback } from 'react';
import { Table, Pagination, Card, Form, Row, Col, Input, Select, Button, Tag, Tooltip, Avatar, Grid, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
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
    ORDER_STATUS_COLORS
} from '../types';

const { useBreakpoint } = Grid;

const pageSize = 10;

const PayOrderPage: React.FC = () => {
    const [orders, setOrders] = useState<PayOrder[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState<PayOrderQuery>({});
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

    return (
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
    );
};

export default PayOrderPage;


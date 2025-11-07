import React, { useEffect, useState } from 'react';
import { Table, Pagination, Card, Form, Row, Col, Input, Select, Button, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PayOrderService } from '../services/api';
import { PayOrder, PayOrderQuery, OrderStatus, OrderLevel, PayFrom } from '../types';

const pageSize = 10;

const PayOrderPage: React.FC = () => {
    const [orders, setOrders] = useState<PayOrder[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState<PayOrderQuery>({});
    const [form] = Form.useForm();

    const loadOrders = () => {
        PayOrderService.fetch_pay_orders(page, pageSize, query)
            .then(data => {
                setOrders(data.content);
                setTotal(data.total_elements);
            })
            .catch(console.error);
    };

    useEffect(() => {
        loadOrders();
    }, [page, query]);

    const getStatusColor = (status: string) => {
        const colorMap: Record<string, string> = {
            'created': 'default',
            'paid': 'success',
            'canceled': 'error',
            'refunded': 'warning',
        };
        return colorMap[status] || 'default';
    };

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            'created': '已创建',
            'paid': '已付款',
            'canceled': '已取消',
            'refunded': '已退款',
        };
        return statusMap[status] || status;
    };

    const getLevelText = (level: string) => {
        const levelMap: Record<string, string> = {
            'monthly': '月度',
            'quarterly': '季度',
            'half_year': '半年',
            'annual': '一年',
        };
        return levelMap[level] || level;
    };

    const getPayFromText = (payFrom: string) => {
        const payFromMap: Record<string, string> = {
            'alipay': '支付宝',
            'wechat': '微信',
        };
        return payFromMap[payFrom] || payFrom;
    };

    const columns: ColumnsType<PayOrder> = [
        { title: '订单ID', dataIndex: 'id', width: 100 },
        { title: '用户ID', dataIndex: 'user_id', width: 100 },
        {
            title: '会员类型',
            dataIndex: 'level',
            width: 120,
            render: (level: string) => getLevelText(level),
        },
        {
            title: '支付方式',
            dataIndex: 'pay_from',
            width: 120,
            render: (payFrom: string) => getPayFromText(payFrom),
        },
        {
            title: '订单状态',
            dataIndex: 'status',
            width: 120,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'created',
            width: 180,
            render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '确认时间',
            dataIndex: 'confirm',
            width: 180,
            render: (v: string | null) => v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-',
        },
        {
            title: '修改时间',
            dataIndex: 'modified',
            width: 180,
            render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
        },
    ];

    const onFinish = (values: any) => {
        const parsedQuery: PayOrderQuery = {
            user_id: values.user_id ? parseInt(values.user_id) : undefined,
            status: values.status || undefined,
            pay_from: values.pay_from || undefined,
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
        <Card title="支付订单查询" extra={
            <Form form={form} layout="inline" onFinish={onFinish}>
                <Row gutter={12}>
                    <Col>
                        <Form.Item name="user_id">
                            <Input placeholder="用户ID" allowClear style={{ width: 120 }} />
                        </Form.Item>
                    </Col>
                    <Col>
                        <Form.Item name="status" initialValue="">
                            <Select style={{ width: 120 }} placeholder="订单状态">
                                <Select.Option value="">全部状态</Select.Option>
                                <Select.Option value="created">已创建</Select.Option>
                                <Select.Option value="paid">已付款</Select.Option>
                                <Select.Option value="canceled">已取消</Select.Option>
                                <Select.Option value="refunded">已退款</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col>
                        <Form.Item name="pay_from" initialValue="">
                            <Select style={{ width: 120 }} placeholder="支付方式">
                                <Select.Option value="">全部方式</Select.Option>
                                <Select.Option value="alipay">支付宝</Select.Option>
                                <Select.Option value="wechat">微信</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col>
                        <Button type="primary" htmlType="submit">查询</Button>
                    </Col>
                    <Col>
                        <Button onClick={onReset}>重置</Button>
                    </Col>
                </Row>
            </Form>
        }>
            <Table 
                rowKey="id" 
                columns={columns} 
                dataSource={orders} 
                pagination={false}
                scroll={{ x: 1200 }}
            />
            <Pagination
                style={{ marginTop: 16, textAlign: 'right' }}
                total={total}
                current={page}
                pageSize={pageSize}
                onChange={setPage}
                showTotal={(total) => `共 ${total} 条`}
            />
        </Card>
    );
};

export default PayOrderPage;


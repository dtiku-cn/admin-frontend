import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal, Space, Table, Tooltip, Typography, Switch, Grid } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import type { SystemConfig } from '../types.ts';
import { systemConfigService } from '../services/api.ts';

const { Paragraph } = Typography;
const { useBreakpoint } = Grid;

const SystemConfigPage: React.FC = () => {
    const [data, setData] = useState<SystemConfig[]>([]);
    const [total, setTotal] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const screens = useBreakpoint();

    const fetchData = async () => {
        try {
            const response = await systemConfigService.getList();
            setData(response.data);
            setTotal(response.total);
        } catch (error) {
            message.error('获取数据失败');
            console.error('Failed to fetch data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (record: SystemConfig) => {
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await systemConfigService.update({ ...values });
            setIsModalVisible(false);
            message.success("更新成功");
            fetchData();
        } catch (error) {
            console.error('Validate Failed:', error);
            message.error('更新失败');
        }
    };

    const handleChecked = async (value: SystemConfig) => {
        try {
            await systemConfigService.update(value);
            message.success("更新成功");
            fetchData();
        } catch (error) {
            console.error('Update Failed:', error);
            message.error('更新失败');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            responsive: ['md'] as Breakpoint[],
        },
        {
            title: '版本',
            dataIndex: 'version',
            key: 'version',
            responsive: ['lg'] as Breakpoint[],
        },
        {
            title: '配置键',
            dataIndex: 'key',
            key: 'key',
            render: (key: string, { key_desc }: SystemConfig) => (
                <Tooltip title={key_desc}>{key}</Tooltip>
            ),
        },
        {
            title: '值',
            dataIndex: 'value',
            key: 'value',
            render: (value: unknown, record: SystemConfig) => value === undefined ? '-' : typeof value === 'boolean' ? (
                <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    value={value}
                    onChange={(value: boolean) => handleChecked({ ...record, value })}
                    size={screens.xs ? 'small' : 'default'}
                />
            ) : (
                <Paragraph style={{ margin: 0 }}>
                    <pre style={{ margin: 0, fontSize: screens.xs ? '10px' : '14px', wordBreak: 'break-all' }}>
                        {JSON.stringify(value)}
                    </pre>
                </Paragraph>
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'created',
            key: 'created',
            responsive: ['lg'] as Breakpoint[],
            render: (created: string | null) => created || '-',
        },
        {
            title: '修改时间',
            dataIndex: 'modified',
            key: 'modified',
            responsive: ['md'] as Breakpoint[],
            render: (modified: string | null) => modified || '-',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: SystemConfig) => typeof record.value === 'boolean' ? null : (
                <Space size="middle">
                    <Button 
                        type="link" 
                        onClick={() => handleEdit(record)}
                        size={screens.xs ? 'small' : 'middle'}
                    >
                        编辑
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Table
                columns={columns}
                dataSource={data}
                rowKey={(record) => record.key}
                pagination={{
                    total,
                    showSizeChanger: !screens.xs,
                    showTotal: (total) => `共 ${total} 条`,
                    size: screens.xs ? 'small' : 'default',
                }}
                size={screens.xs ? 'small' : 'middle'}
                scroll={{ x: screens.xs ? 600 : undefined }}
            />

            <Modal
                title="编辑配置"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                width={screens.xs ? '90%' : 520}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="key"
                        label="配置键"
                        rules={[{ required: true, message: '请输入配置键' }]}
                    >
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name="key_desc"
                        label="描述"
                        rules={[{ required: true, message: '请输入描述' }]}
                    >
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name="value"
                        label="值"
                    >
                        <Input.TextArea rows={screens.xs ? 3 : 4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SystemConfigPage;
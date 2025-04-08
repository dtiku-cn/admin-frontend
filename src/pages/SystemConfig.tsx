import React, {useEffect, useState} from 'react';
import {Button, Form, Input, message, Modal, Space, Table, Tooltip, Typography} from 'antd';
import type {SystemConfig} from '../types.ts';
import {systemConfigService} from '../services/api.ts';

const {Paragraph} = Typography;

const SystemConfigPage: React.FC = () => {
    const [data, setData] = useState<SystemConfig[]>([]);
    const [total, setTotal] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

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

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: '版本',
            dataIndex: 'version',
            key: 'version',
        },
        {
            title: '配置键',
            dataIndex: 'key',
            key: 'key',
            render: (key: string, {key_desc}: SystemConfig) => (
                <Tooltip title={key_desc}>{key}</Tooltip>
            ),
        },
        {
            title: '值',
            dataIndex: 'value',
            key: 'value',
            render: (value: any) => value ? (
                <Paragraph style={{margin: 0}}>
                    <pre style={{margin: 0}}>{value}</pre>
                </Paragraph>
            ) : '-',
        },
        {
            title: '创建时间',
            dataIndex: 'created',
            key: 'created',
            render: (created: string | null) => created || '-',
        },
        {
            title: '修改时间',
            dataIndex: 'modified',
            key: 'modified',
            render: (modified: string | null) => modified || '-',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: SystemConfig) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                </Space>
            ),
        },
    ];

    const handleEdit = (record: SystemConfig) => {
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await systemConfigService.update({...values});
            setIsModalVisible(false);
            message.success("更新成功");
            fetchData();
        } catch (error) {
            console.error('Validate Failed:', error);
            message.error('更新失败');
        }
    };

    return (
        <div>
            <Table
                columns={columns}
                dataSource={data}
                rowKey={(record) => record.key}
                pagination={{
                    total,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                }}
            />

            <Modal
                title="编辑配置"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="key"
                        label="配置键"
                        rules={[{required: true, message: '请输入配置键'}]}
                    >
                        <Input disabled/>
                    </Form.Item>
                    <Form.Item
                        name="key_desc"
                        label="描述"
                        rules={[{required: true, message: '请输入描述'}]}
                    >
                        <Input disabled/>
                    </Form.Item>
                    <Form.Item
                        name="value"
                        label="值"
                    >
                        <Input.TextArea/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SystemConfigPage;
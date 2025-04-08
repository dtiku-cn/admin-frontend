import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Form, Input, message, Modal, Space, Switch, Table, Tooltip} from 'antd';
import type {ScheduleTask} from '../types.ts';
import {scheduleTaskService} from '../services/api.ts';

const ScheduleTaskPage: React.FC = () => {
    const [data, setData] = useState<ScheduleTask[]>([]);
    const [total, setTotal] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const response = await scheduleTaskService.getList();
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
            title: '类型',
            dataIndex: 'ty',
            key: 'ty',
            render: (ty: string, {desc}: ScheduleTask) => (
                <Tooltip title={desc}>{ty}</Tooltip>
            ),
        },
        {
            title: '状态',
            dataIndex: 'active',
            key: 'active',
            render: (active: boolean) => (
                <Switch checked={active} disabled/>
            ),
        },
        {
            title: '运行次数',
            dataIndex: 'runCount',
            key: 'runCount',
            render: (count: number) => count || 0,
        },
        {
            title: '上下文',
            dataIndex: 'context',
            key: 'context',
            render: (context: any) => context ? JSON.stringify(context) : '-',
        },
        {
            title: '实例',
            dataIndex: 'instances',
            key: 'instances',
            render: (instances: any) => instances ? JSON.stringify(instances) : '-',
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
            render: (_: any, record: ScheduleTask) => (
                <Space size="middle">
                    <Button
                        type="link"
                        onClick={() => handleToggleActive(record)}
                    >
                        {record.active ? '停用' : '启用'}
                    </Button>
                </Space>
            ),
        },
    ];

    const handleToggleActive = async (record: ScheduleTask) => {
        try {
            await scheduleTaskService.toggleActive(record.ty!, !record.active);
            message.success(`${record.active ? '停用' : '启用'}成功`);
            fetchData();
        } catch (error) {
            message.error(`${record.active ? '停用' : '启用'}失败`);
            console.error('Toggle active failed:', error);
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await scheduleTaskService.update({...values});
            setIsModalVisible(false);
            message.success('更新成功');
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
                rowKey={(record) => record.ty}
                pagination={{
                    total,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                }}
                onRow={(record) => ({onClick: () => navigate(`/schedule/${record.ty}`)})}
            />

            <Modal
                title="编辑任务"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="ty"
                        label="类型"
                        rules={[{required: true, message: '请输入任务类型'}]}
                    >
                        <Input disabled/>
                    </Form.Item>
                    <Form.Item
                        name="desc"
                        label="描述"
                        rules={[{required: true, message: '请输入描述'}]}
                    >
                        <Input disabled/>
                    </Form.Item>
                    <Form.Item
                        name="active"
                        label="状态"
                        valuePropName="checked"
                    >
                        <Switch/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ScheduleTaskPage;
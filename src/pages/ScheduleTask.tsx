import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, message, Modal, Space, Switch, Table, Tooltip, Card, Statistic, Row, Col, Tag, Select, Grid, Badge, Popconfirm, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, SearchOutlined, ThunderboltOutlined, PlayCircleOutlined, PauseCircleOutlined, EyeOutlined, SyncOutlined } from '@ant-design/icons';
import type { ScheduleTask } from '../types.ts';
import { scheduleTaskService } from '../services/api.ts';

const { Search } = Input;
const { useBreakpoint } = Grid;

const ScheduleTaskPage: React.FC = () => {
    const [data, setData] = useState<ScheduleTask[]>([]);
    const [filteredData, setFilteredData] = useState<ScheduleTask[]>([]);
    const [total, setTotal] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const screens = useBreakpoint();

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await scheduleTaskService.getList();
            setData(response.data);
            setFilteredData(response.data);
            setTotal(response.total);
        } catch (error) {
            message.error('获取数据失败');
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchText, statusFilter, data]);

    const applyFilters = () => {
        let filtered = [...data];
        
        // 搜索过滤
        if (searchText.trim()) {
            filtered = filtered.filter(item => 
                item.ty.toLowerCase().includes(searchText.toLowerCase()) ||
                item.desc.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        
        // 状态过滤
        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => 
                statusFilter === 'active' ? item.active : !item.active
            );
        }
        
        setFilteredData(filtered);
    };

    // 统计信息
    const activeCount = data.filter(item => item.active).length;
    const inactiveCount = data.filter(item => !item.active).length;
    const totalRunCount = data.reduce((sum, item) => sum + (item.run_count || 0), 0);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            responsive: ['md'] as const,
        },
        {
            title: '版本',
            dataIndex: 'version',
            key: 'version',
            width: 80,
            responsive: ['lg'] as const,
        },
        {
            title: '任务类型',
            dataIndex: 'ty',
            key: 'ty',
            width: 200,
            render: (ty: string, { desc, active }: ScheduleTask) => (
                <Space direction="vertical" size={2}>
                    <Space>
                        <Badge status={active ? 'processing' : 'default'} />
                        <strong>{ty}</strong>
                    </Space>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                        {desc}
                    </Typography.Text>
                </Space>
            ),
        },
        {
            title: '状态',
            dataIndex: 'active',
            key: 'active',
            width: 100,
            filters: [
                { text: '运行中', value: true },
                { text: '已停止', value: false },
            ],
            onFilter: (value, record) => record.active === value,
            render: (active: boolean) => (
                <Tag 
                    icon={active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    color={active ? 'success' : 'default'}
                >
                    {active ? '运行中' : '已停止'}
                </Tag>
            ),
        },
        {
            title: '运行次数',
            dataIndex: 'run_count',
            key: 'run_count',
            width: 120,
            sorter: (a, b) => (a.run_count || 0) - (b.run_count || 0),
            render: (count: number) => (
                <Tag color="blue">{count || 0} 次</Tag>
            ),
        },
        {
            title: '上下文',
            dataIndex: 'context',
            key: 'context',
            width: 200,
            responsive: ['lg'] as const,
            render: (context: any) => {
                if (!context) return '-';
                const contextStr = JSON.stringify(context);
                return (
                    <Tooltip title={<pre style={{ margin: 0 }}>{JSON.stringify(context, null, 2)}</pre>}>
                        <Typography.Text 
                            ellipsis 
                            style={{ 
                                maxWidth: 180,
                                fontFamily: 'monospace',
                                fontSize: '12px'
                            }}
                        >
                            {contextStr}
                        </Typography.Text>
                    </Tooltip>
                );
            },
        },
        {
            title: '实例数',
            dataIndex: 'instances',
            key: 'instances',
            width: 100,
            responsive: ['md'] as const,
            render: (instances: any) => {
                if (!instances) return '-';
                const count = Array.isArray(instances) ? instances.length : 
                             typeof instances === 'object' ? Object.keys(instances).length : 0;
                return <Tag color="purple">{count}</Tag>;
            },
        },
        {
            title: '创建时间',
            dataIndex: 'created',
            key: 'created',
            width: 180,
            responsive: ['xl'] as const,
            sorter: (a, b) => new Date(a.created || 0).getTime() - new Date(b.created || 0).getTime(),
            render: (created: string | null) => created ? new Date(created).toLocaleString('zh-CN') : '-',
        },
        {
            title: '修改时间',
            dataIndex: 'modified',
            key: 'modified',
            width: 180,
            responsive: ['lg'] as const,
            sorter: (a, b) => new Date(a.modified || 0).getTime() - new Date(b.modified || 0).getTime(),
            render: (modified: string | null) => modified ? new Date(modified).toLocaleString('zh-CN') : '-',
        },
        {
            title: '操作',
            key: 'action',
            width: 250,
            fixed: 'right' as const,
            render: (_: any, record: ScheduleTask) => (
                <Space size="small" wrap>
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/schedule/${record.ty}`);
                        }}
                    >
                        详情
                    </Button>
                    {record.active ? (
                        <>
                            <Popconfirm
                                title="确认停用任务？"
                                onConfirm={(e) => {
                                    e?.stopPropagation();
                                    handleToggleStart(record);
                                }}
                                okText="确认"
                                cancelText="取消"
                            >
                                <Button
                                    type="link"
                                    size="small"
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    停用
                                </Button>
                            </Popconfirm>
                            <Button
                                type="link"
                                size="small"
                                icon={<PauseCircleOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleContinue(record);
                                }}
                            >
                                暂停
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="link"
                                size="small"
                                icon={<SyncOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleStart(record);
                                }}
                            >
                                重启
                            </Button>
                            <Button
                                type="link"
                                size="small"
                                icon={<PlayCircleOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleContinue(record);
                                }}
                            >
                                继续
                            </Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const handleToggleStart = async (record: ScheduleTask) => {
        try {
            await scheduleTaskService.toggleActive(record.ty!, !record.active);
            message.success(`${record.active ? '停用' : '启用'}成功`);
            fetchData();
        } catch (error) {
            message.error(`${record.active ? '停用' : '启用'}失败`);
            console.error('Toggle active failed:', error);
        }
    };

    const handleToggleContinue = async (record: ScheduleTask) => {
        try {
            await scheduleTaskService.continueTask(record.ty!, !record.active);
            message.success(`${record.active ? '暂停' : '继续'}成功`);
            fetchData();
        } catch (error) {
            message.error(`${record.active ? '暂停' : '继续'}失败`);
            console.error('Toggle continue task failed:', error);
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await scheduleTaskService.update({ ...values });
            setIsModalVisible(false);
            message.success('更新成功');
            fetchData();
        } catch (error) {
            console.error('Validate Failed:', error);
            message.error('更新失败');
        }
    };

    return (
        <>
            {/* 统计信息卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic 
                            title="任务总数" 
                            value={total} 
                            prefix={<ThunderboltOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic 
                            title="运行中" 
                            value={activeCount} 
                            suffix={`/ ${total}`}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic 
                            title="已停止" 
                            value={inactiveCount} 
                            suffix={`/ ${total}`}
                            valueStyle={{ color: '#999' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic 
                            title="累计运行" 
                            value={totalRunCount} 
                            suffix="次"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 搜索和筛选栏 */}
            <Card style={{ marginBottom: 16 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                    <Space wrap>
                        <Search
                            placeholder="搜索任务类型或描述"
                            allowClear
                            enterButton={<SearchOutlined />}
                            size={screens.xs ? 'middle' : 'large'}
                            onSearch={setSearchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: screens.xs ? '100%' : 300 }}
                            value={searchText}
                        />
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: screens.xs ? '100%' : 120 }}
                            size={screens.xs ? 'middle' : 'large'}
                            options={[
                                { label: '全部状态', value: 'all' },
                                { label: '运行中', value: 'active' },
                                { label: '已停止', value: 'inactive' },
                            ]}
                        />
                    </Space>
                    <Button 
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={fetchData}
                        loading={loading}
                        size={screens.xs ? 'middle' : 'large'}
                    >
                        刷新
                    </Button>
                </Space>
            </Card>

            {/* 任务表格 */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey={(record) => record.ty}
                    loading={loading}
                    pagination={{
                        total: filteredData.length,
                        showSizeChanger: !screens.xs,
                        showTotal: (total) => `共 ${total} 个任务`,
                        size: screens.xs ? 'small' : 'default',
                        defaultPageSize: 10,
                        pageSizeOptions: ['10', '20', '50'],
                    }}
                    size={screens.xs ? 'small' : 'middle'}
                    scroll={{ x: 1200 }}
                    onRow={(record) => ({ 
                        onClick: () => navigate(`/schedule/${record.ty}`),
                        style: { cursor: 'pointer' }
                    })}
                />
            </Card>

            {/* 编辑任务对话框 */}
            <Modal
                title={
                    <Space>
                        <ThunderboltOutlined />
                        <span>编辑任务</span>
                    </Space>
                }
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                width={screens.xs ? '90%' : 600}
                okText="保存"
                cancelText="取消"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="ty"
                        label="任务类型"
                        rules={[{ required: true, message: '请输入任务类型' }]}
                    >
                        <Input disabled style={{ color: '#000', fontWeight: 500 }} />
                    </Form.Item>
                    <Form.Item
                        name="desc"
                        label="任务描述"
                    >
                        <Input disabled style={{ color: '#666' }} />
                    </Form.Item>
                    <Form.Item
                        name="active"
                        label="运行状态"
                        valuePropName="checked"
                    >
                        <Switch 
                            checkedChildren="运行中" 
                            unCheckedChildren="已停止" 
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ScheduleTaskPage;
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Descriptions, DescriptionsProps, message, Space, Tag, Statistic, Row, Col, Typography, Grid, Popconfirm, Divider, Collapse } from 'antd';
import { LeftOutlined, ReloadOutlined, PlayCircleOutlined, PauseCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, ThunderboltOutlined, CodeOutlined, DatabaseOutlined } from '@ant-design/icons';
import type { ScheduleTask } from '../types.ts';
import { scheduleTaskService } from '../services/api.ts';

const { Paragraph } = Typography;
const { useBreakpoint } = Grid;
const { Panel } = Collapse;

const ScheduleTaskDetail: React.FC = () => {
    const { ty } = useParams();
    const [data, setData] = useState<ScheduleTask>();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const screens = useBreakpoint();

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await scheduleTaskService.get(ty as string);
            setData(response);
        } catch (error) {
            message.error('获取数据失败');
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [ty]);

    const handleToggleActive = async () => {
        if (!data) return;
        try {
            await scheduleTaskService.toggleActive(data.ty, !data.active);
            message.success(`${data.active ? '停用' : '启用'}成功`);
            fetchData();
        } catch (error) {
            message.error(`${data.active ? '停用' : '启用'}失败`);
            console.error('Toggle active failed:', error);
        }
    };

    const handleContinue = async () => {
        if (!data) return;
        try {
            await scheduleTaskService.continueTask(data.ty, !data.active);
            message.success(`${data.active ? '暂停' : '继续'}成功`);
            fetchData();
        } catch (error) {
            message.error(`${data.active ? '暂停' : '继续'}失败`);
            console.error('Continue task failed:', error);
        }
    };

    // 解析实例列表
    const getInstances = () => {
        if (!data?.instances) return [];
        if (Array.isArray(data.instances)) return data.instances;
        if (typeof data.instances === 'object') {
            return Object.entries(data.instances).map(([key, value]) => ({
                key,
                value,
            }));
        }
        return [];
    };

    const instances = getInstances();

    const taskDetailItems: DescriptionsProps['items'] = [{
        key: 'id',
        label: 'ID',
        children: data?.id || '-',
        span: 1,
    }, {
        key: 'version',
        label: '版本',
        children: data?.version || '-',
        span: 1,
    }, {
        key: 'type',
        label: '任务类型',
        children: <Tag color="blue">{data?.ty}</Tag>,
        span: 1,
    }, {
        key: 'desc',
        label: '任务描述',
        children: data?.desc,
        span: 3,
    }, {
        key: 'active',
        label: '运行状态',
        children: (
            <Tag 
                icon={data?.active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                color={data?.active ? 'success' : 'default'}
            >
                {data?.active ? '运行中' : '已停止'}
            </Tag>
        ),
        span: 1,
    }, {
        key: 'runCount',
        label: '运行次数',
        children: <Tag color="blue">{data?.run_count || 0} 次</Tag>,
        span: 1,
    }, {
        key: 'instanceCount',
        label: '实例数量',
        children: <Tag color="purple">{instances.length}</Tag>,
        span: 1,
    }, {
        key: 'created',
        label: '创建时间',
        children: data?.created ? new Date(data.created).toLocaleString('zh-CN') : '-',
        span: 3,
    }, {
        key: 'modified',
        label: '最后修改',
        children: data?.modified ? new Date(data.modified).toLocaleString('zh-CN') : '-',
        span: 3,
    }];

    return (
        <div style={{ padding: screens.xs ? '12px' : '24px' }}>
            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic 
                            title="运行状态" 
                            value={data?.active ? '运行中' : '已停止'}
                            valueStyle={{ 
                                color: data?.active ? '#52c41a' : '#999',
                                fontSize: screens.xs ? '20px' : '24px'
                            }}
                            prefix={data?.active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic 
                            title="运行次数" 
                            value={data?.run_count || 0}
                            suffix="次"
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<ThunderboltOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic 
                            title="实例数量" 
                            value={instances.length}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<DatabaseOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic 
                            title="任务版本" 
                            value={data?.version || 0}
                            valueStyle={{ color: '#fa8c16' }}
                            prefix={<CodeOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 操作栏 */}
            <Card style={{ marginBottom: 16 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                    <Space wrap>
                        <Button 
                            type="text"
                            icon={<LeftOutlined />} 
                            onClick={() => navigate(-1)}
                        >
                            返回
                        </Button>
                        <Divider type="vertical" />
                        {data?.active ? (
                            <>
                                <Popconfirm
                                    title="确认停用任务？"
                                    onConfirm={handleToggleActive}
                                    okText="确认"
                                    cancelText="取消"
                                >
                                    <Button 
                                        danger
                                        icon={<CloseCircleOutlined />}
                                    >
                                        停用任务
                                    </Button>
                                </Popconfirm>
                                <Button 
                                    icon={<PauseCircleOutlined />}
                                    onClick={handleContinue}
                                >
                                    暂停任务
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button 
                                    type="primary"
                                    icon={<SyncOutlined />}
                                    onClick={handleToggleActive}
                                >
                                    重启任务
                                </Button>
                                <Button 
                                    icon={<PlayCircleOutlined />}
                                    onClick={handleContinue}
                                >
                                    继续任务
                                </Button>
                            </>
                        )}
                    </Space>
                    <Button 
                        icon={<ReloadOutlined />}
                        onClick={fetchData}
                        loading={loading}
                    >
                        刷新
                    </Button>
                </Space>
            </Card>

            {/* 基本信息 */}
            <Card title={<Space><ThunderboltOutlined />基本信息</Space>} style={{ marginBottom: 16 }} loading={loading}>
                <Descriptions 
                    items={taskDetailItems} 
                    column={{ xs: 1, sm: 2, md: 3 }}
                    bordered
                />
            </Card>

            {/* 上下文信息 */}
            {data?.context && (
                <Card 
                    title={<Space><CodeOutlined />上下文信息</Space>} 
                    style={{ marginBottom: 16 }}
                    loading={loading}
                >
                    <Paragraph 
                        copyable={{ text: JSON.stringify(data.context, null, 2) }}
                    >
                        <pre style={{
                            background: '#f5f5f5',
                            padding: '16px',
                            borderRadius: '4px',
                            overflow: 'auto',
                            maxHeight: '300px',
                            margin: 0,
                            fontSize: screens.xs ? '12px' : '14px',
                        }}>
                            {JSON.stringify(data.context, null, 2)}
                        </pre>
                    </Paragraph>
                </Card>
            )}

            {/* 实例列表 */}
            {instances.length > 0 && (
                <Card 
                    title={<Space><DatabaseOutlined />运行实例 ({instances.length})</Space>}
                    loading={loading}
                >
                    <Collapse defaultActiveKey={['0']} ghost>
                        {instances.map((instance, index) => (
                            <Panel 
                                header={
                                    <Space>
                                        <Tag color="purple">实例 {index + 1}</Tag>
                                        {typeof instance === 'object' && 'key' in instance && (
                                            <Typography.Text type="secondary">
                                                {instance.key}
                                            </Typography.Text>
                                        )}
                                    </Space>
                                } 
                                key={index.toString()}
                            >
                                <Paragraph 
                                    copyable={{ 
                                        text: JSON.stringify(
                                            typeof instance === 'object' && 'value' in instance 
                                                ? instance.value 
                                                : instance, 
                                            null, 
                                            2
                                        ) 
                                    }}
                                >
                                    <pre style={{
                                        background: '#fafafa',
                                        padding: '12px',
                                        borderRadius: '4px',
                                        overflow: 'auto',
                                        margin: 0,
                                        fontSize: screens.xs ? '11px' : '13px',
                                    }}>
                                        {JSON.stringify(
                                            typeof instance === 'object' && 'value' in instance 
                                                ? instance.value 
                                                : instance, 
                                            null, 
                                            2
                                        )}
                                    </pre>
                                </Paragraph>
                            </Panel>
                        ))}
                    </Collapse>
                </Card>
            )}
        </div>
    );
};

export default ScheduleTaskDetail;
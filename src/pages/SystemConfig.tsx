import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal, Space, Table, Typography, Switch, Grid, Card, Statistic, Row, Col, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import type { SystemConfig } from '../types.ts';
import { systemConfigService } from '../services/api.ts';

const { Paragraph } = Typography;
const { useBreakpoint } = Grid;
const { Search } = Input;

const SystemConfigPage: React.FC = () => {
    const [data, setData] = useState<SystemConfig[]>([]);
    const [filteredData, setFilteredData] = useState<SystemConfig[]>([]);
    const [total, setTotal] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();
    const screens = useBreakpoint();

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await systemConfigService.getList();
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

    const handleSearch = (value: string) => {
        setSearchText(value);
        if (!value.trim()) {
            setFilteredData(data);
            return;
        }
        const filtered = data.filter(item => 
            item.key.toLowerCase().includes(value.toLowerCase()) ||
            item.key_desc.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };

    const handleEdit = (record: SystemConfig) => {
        const formValue = { ...record };
        // 如果值是对象或数组，转换为JSON字符串方便编辑
        if (typeof record.value === 'object' && record.value !== null) {
            formValue.value = JSON.stringify(record.value, null, 2);
        }
        form.setFieldsValue(formValue);
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // 尝试解析JSON
            let parsedValue = values.value;
            try {
                parsedValue = JSON.parse(values.value);
            } catch {
                // 如果不是JSON，保持原值
            }
            await systemConfigService.update({ ...values, value: parsedValue });
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

    // 统计信息
    const booleanCount = data.filter(item => typeof item.value === 'boolean').length;
    const objectCount = data.filter(item => typeof item.value === 'object' && item.value !== null).length;
    const stringCount = data.filter(item => typeof item.value === 'string').length;

    // JSON 格式化显示
    const formatJsonValue = (value: unknown) => {
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            responsive: ['md'] as Breakpoint[],
        },
        {
            title: '版本',
            dataIndex: 'version',
            key: 'version',
            width: 80,
            responsive: ['lg'] as Breakpoint[],
        },
        {
            title: '配置键',
            dataIndex: 'key',
            key: 'key',
            width: 200,
            render: (key: string, { key_desc }: SystemConfig) => (
                <Space direction="vertical" size={2}>
                    <strong>{key}</strong>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                        {key_desc}
                    </Typography.Text>
                </Space>
            ),
        },
        {
            title: '值',
            dataIndex: 'value',
            key: 'value',
            render: (value: unknown, record: SystemConfig) => {
                if (value === undefined || value === null) return '-';
                
                const valueType = typeof value;
                const typeColor = valueType === 'boolean' ? 'blue' : 
                                 valueType === 'object' ? 'green' : 
                                 valueType === 'number' ? 'orange' : 'default';
                
                if (valueType === 'boolean') {
                    return (
                        <Space>
                            <Switch
                                checkedChildren={<CheckOutlined />}
                                unCheckedChildren={<CloseOutlined />}
                                checked={value as boolean}
                                onChange={(checked: boolean) => handleChecked({ ...record, value: checked })}
                                size={screens.xs ? 'small' : 'default'}
                            />
                            <Tag color={typeColor}>{valueType}</Tag>
                        </Space>
                    );
                }
                
                return (
                    <Space direction="vertical" style={{ width: '100%' }} size={4}>
                        <Tag color={typeColor}>{valueType}</Tag>
                        <Paragraph 
                            copyable={{ text: formatJsonValue(value) }}
                            style={{ margin: 0, maxWidth: screens.xs ? '200px' : '400px' }}
                        >
                            <pre style={{ 
                                margin: 0, 
                                fontSize: screens.xs ? '11px' : '13px', 
                                wordBreak: 'break-all',
                                whiteSpace: 'pre-wrap',
                                background: '#f5f5f5',
                                padding: '8px',
                                borderRadius: '4px',
                                maxHeight: '100px',
                                overflow: 'auto'
                            }}>
                                {formatJsonValue(value)}
                            </pre>
                        </Paragraph>
                    </Space>
                );
            },
        },
        {
            title: '创建时间',
            dataIndex: 'created',
            key: 'created',
            width: 180,
            responsive: ['lg'] as Breakpoint[],
            render: (created: string | null) => created ? new Date(created).toLocaleString('zh-CN') : '-',
        },
        {
            title: '修改时间',
            dataIndex: 'modified',
            key: 'modified',
            width: 180,
            responsive: ['md'] as Breakpoint[],
            render: (modified: string | null) => modified ? new Date(modified).toLocaleString('zh-CN') : '-',
        },
        {
            title: '操作',
            key: 'action',
            width: 100,
            fixed: 'right' as const,
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
        <>
            {/* 统计信息卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic 
                            title="配置总数" 
                            value={total} 
                            prefix={<SettingOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic 
                            title="布尔类型" 
                            value={booleanCount} 
                            suffix={`/ ${total}`}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic 
                            title="对象类型" 
                            value={objectCount} 
                            suffix={`/ ${total}`}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic 
                            title="字符串类型" 
                            value={stringCount} 
                            suffix={`/ ${total}`}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 操作栏 */}
            <Card style={{ marginBottom: 16 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                    <Search
                        placeholder="搜索配置键或描述"
                        allowClear
                        enterButton={<SearchOutlined />}
                        size={screens.xs ? 'middle' : 'large'}
                        onSearch={handleSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: screens.xs ? '100%' : 400 }}
                        value={searchText}
                    />
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

            {/* 表格 */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey={(record) => record.key}
                    loading={loading}
                    pagination={{
                        total: filteredData.length,
                        showSizeChanger: !screens.xs,
                        showTotal: (total) => `共 ${total} 条配置`,
                        size: screens.xs ? 'small' : 'default',
                        defaultPageSize: 10,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    size={screens.xs ? 'small' : 'middle'}
                    scroll={{ x: 800 }}
                />
            </Card>

            {/* 编辑配置对话框 */}
            <Modal
                title={
                    <Space>
                        <SettingOutlined />
                        <span>编辑配置</span>
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
                        name="key"
                        label="配置键"
                        rules={[{ required: true, message: '请输入配置键' }]}
                    >
                        <Input disabled style={{ color: '#000', fontWeight: 500 }} />
                    </Form.Item>
                    <Form.Item
                        name="key_desc"
                        label="描述"
                    >
                        <Input disabled style={{ color: '#666' }} />
                    </Form.Item>
                    <Form.Item
                        name="value"
                        label="值"
                        extra="支持 JSON 格式，将自动解析"
                        rules={[{ required: true, message: '请输入配置值' }]}
                    >
                        <Input.TextArea 
                            rows={screens.xs ? 6 : 8} 
                            placeholder="输入配置值，JSON 格式将自动解析"
                            style={{ fontFamily: 'monospace' }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default SystemConfigPage;
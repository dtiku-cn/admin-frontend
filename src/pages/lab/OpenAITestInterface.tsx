import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Form, Spin, Alert, Divider, Typography, Select } from 'antd';
import { LoadingOutlined, SendOutlined, CodeOutlined } from '@ant-design/icons';
import { TestService } from '../../services/api';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const OpenAITestInterface: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await fetch('/api/open_router_models');
                const data = await res.json();
                let models = (data.data || []).filter(m => m.name.includes("free"))
                    .map(m => ({ label: `${m.name} (${m.hf_slug || m.slug})`, value: m.slug }))
                setModels(models);
                if (data.data.length > 0) {
                    setSelectedModel(data.data[0].slug);
                }
            } catch (err) {
                console.error('模型加载失败:', err);
            }
        };

        fetchModels();
    }, []);

    const handleSubmit = async (values) => {
        const { text } = values;
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const resp = await TestService.fetchOpenAI(text, selectedModel);
            setResponse(resp);
        } catch (err) {
            setError('API调用失败：' + err.message);
            console.error('API调用错误:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderResponse = () => {
        if (!response) return null;

        try {
            const content = response.choices[0].message.content;
            const parsedContent = JSON.parse(content);

            return (
                <div className="response-container">
                    <Title level={4} style={{ marginTop: 16 }}>解析结果：</Title>
                    {Array.isArray(parsedContent) && parsedContent.map((item, index) => (
                        <Card
                            key={index}
                            style={{ marginBottom: 16, borderLeft: '3px solid #1890ff' }}
                        >
                            <Text strong>问题 {index + 1}:</Text>
                            <p style={{ margin: '8px 0' }}>{item.question}</p>
                            <Text strong>答案:</Text>
                            <p style={{ margin: '8px 0 0' }}>{item.solution}</p>
                        </Card>
                    ))}

                    <Divider />

                    <Title level={5} style={{ marginTop: 16 }}>原始响应：</Title>
                    <pre style={{
                        background: '#f6f8fa',
                        padding: 16,
                        borderRadius: 4,
                        maxHeight: 300,
                        overflow: 'auto'
                    }}>
                        {JSON.stringify(response, null, 2)}
                    </pre>

                    <div style={{ marginTop: 16 }}>
                        <Text type="secondary">Tokens 使用情况:</Text>
                        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                            <Text>Prompt: {response.usage.prompt_tokens}</Text>
                            <Text>Completion: {response.usage.completion_tokens}</Text>
                            <Text>总计: {response.usage.total_tokens}</Text>
                        </div>
                    </div>
                </div>
            );
        } catch (e) {
            return (
                <div className="response-container">
                    <Title level={4} style={{ marginTop: 16 }}>响应内容：</Title>
                    <pre style={{
                        background: '#f6f8fa',
                        padding: 16,
                        borderRadius: 4,
                        maxHeight: 300,
                        overflow: 'auto'
                    }}>
                        {response.choices[0].message.content}
                    </pre>
                </div>
            );
        }
    };

    return (
        <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: 24,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)',
            minHeight: '100vh'
        }}>
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CodeOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        <span>OpenAI 接口测试工具</span>
                    </div>
                }
                bordered={false}
                style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
                <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                    此工具用于测试调用 OpenAI 接口，输入文本后将从文本中提取问题与答案并以JSON格式返回。
                </Text>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="model"
                        label="选择模型"
                        rules={[{ required: true, message: '请选择模型' }]}
                    >
                        <Select
                            showSearch
                            virtual
                            value={selectedModel}
                            options={models}
                            onChange={setSelectedModel}
                            placeholder="请选择一个模型"
                            filterOption={(input, option) =>
                                option?.label.toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        name="text"
                        label="输入文本"
                        rules={[{ required: true, message: '请输入要处理的文本内容' }]}
                    >
                        <TextArea
                            rows={8}
                            placeholder="请输入文本内容，系统将从中提取问题和答案..."
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SendOutlined />}
                            size="large"
                            disabled={loading}
                            style={{ width: 150, height: 42, borderRadius: 8 }}
                        >
                            {loading ? '处理中...' : '调用API'}
                        </Button>
                    </Form.Item>
                </Form>

                {error && (
                    <Alert
                        message="错误"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin
                            indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />}
                            tip="正在处理文本，请稍候..."
                        />
                        <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
                            这可能需要几秒钟时间
                        </Text>
                    </div>
                ) : renderResponse()}
            </Card>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Text type="secondary">
                    接口路径: POST /api/test_call_open_ai | 当前模型: {selectedModel || '未选择'}
                </Text>
            </div>
        </div>
    );
};

export default OpenAITestInterface;
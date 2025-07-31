import React, { useState } from 'react';
import { Input, Button, Table, Form, Typography, message } from 'antd';

const { TextArea } = Input;
const { Title } = Typography;

interface KeywordResult {
    keyword: string;
    weight: number;
}

const TextRankKeywordExtractor: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<KeywordResult[]>([]);

    const onFinish = async (values: any) => {
        const { text, wordTags } = values;
        if (!text || !wordTags) {
            message.warning('请输入文本和词性标签');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/text_rank_keywords/${wordTags}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: text,
            });

            if (!response.ok) {
                throw new Error(`服务器返回错误: ${response.status}`);
            }

            const data = await response.json();
            setResults(data);
        } catch (err: any) {
            console.error(err);
            message.error('提取关键词失败');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: '关键词',
            dataIndex: 'keyword',
            key: 'keyword',
        },
        {
            title: '权重',
            dataIndex: 'weight',
            key: 'weight',
            render: (value: number) => value.toFixed(4),
        },
    ];

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
            <Title level={3}>TextRank 关键词提取</Title>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="文本内容"
                    name="text"
                    rules={[{ required: true, message: '请输入文本内容' }]}
                >
                    <TextArea rows={6} placeholder="请输入需要提取关键词的文本" />
                </Form.Item>
                <Form.Item
                    label="词性标签（逗号分隔）"
                    name="wordTags"
                    rules={[{ required: true, message: '请输入词性标签' }]}
                >
                    <Input placeholder="例如: n,v,a" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        提取关键词
                    </Button>
                </Form.Item>
            </Form>

            <Table
                dataSource={results}
                columns={columns}
                rowKey="keyword"
                pagination={false}
                style={{ marginTop: 24 }}
            />
        </div>
    );
};

export default TextRankKeywordExtractor;

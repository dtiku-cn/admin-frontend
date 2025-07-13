import React, { useState } from 'react';
import { Input, Button, Table, Space, message } from 'antd';
import { TextSimilarityResult } from '../../types';
import { TestService } from '../../services/api';

const { TextArea } = Input;

const TextSimilarity: React.FC = () => {
    const [source, setSource] = useState('');
    const [target, setTarget] = useState('');
    const [data, setData] = useState<TextSimilarityResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCompare = async () => {
        if (!source || !target) {
            message.warning('请输入 source 和 target');
            return;
        }

        setLoading(true);
        try {
            const result = await TestService.fetchTextSimilarity(source, target);
            setData(result);
        } catch (err) {
            message.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: '算法',
            dataIndex: 'metric',
            key: 'metric',
        },
        {
            title: '相似度',
            dataIndex: 'value',
            key: 'value',
        },
    ];

    const tableData = data
        ? Object.entries(data).map(([metric, value]) => ({
            key: metric,
            metric,
            value,
        }))
        : [];

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <h2>文本相似度计算</h2>
            <Space direction="vertical" style={{ width: '100%' }}>
                <TextArea
                    rows={3}
                    placeholder="请输入 Source 文本"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                />
                <TextArea
                    rows={3}
                    placeholder="请输入 Target 文本"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                />
                <Button type="primary" onClick={handleCompare} loading={loading}>
                    计算相似度
                </Button>
            </Space>

            {data && (
                <div style={{ marginTop: 24 }}>
                    <Table
                        dataSource={tableData}
                        columns={columns}
                        pagination={false}
                        bordered
                        size="middle"
                    />
                </div>
            )}
        </div>
    );
};

export default TextSimilarity;
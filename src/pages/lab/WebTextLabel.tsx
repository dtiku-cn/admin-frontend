import React, { useState } from 'react';
import { Input, Button, Form, Typography, Spin, Tooltip, Select, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { TestService } from '../../services/api';
import { LabelSentence } from '../../types';

const { TextArea } = Input;
const { Title } = Typography;

const WebTextLabel: React.FC = () => {
    const [url, setUrl] = useState('');
    const [labelText, setLabelText] = useState([{ key: '', value: '' }]);
    const [threshold, setThreshold] = useState<number | undefined>(0.1);
    const [algo, setAlgo] = useState('Label');
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState('');
    const [labeledText, setLabeledText] = useState([] as LabelSentence[]);

    const handleSubmit = async () => {
        if (!url) return;

        const labelMap: Record<string, string> = {};
        for (const { key, value } of labelText) {
            if (key && value) {
                labelMap[key] = value;
            }
        }

        if (Object.keys(labelMap).length === 0) {
            alert('请至少填写一个有效的标签和文本');
            return;
        }

        setLoading(true);
        try {
            let data;
            if (algo === "Label") {
                data = await TestService.fetchWebTextLabel({
                    url,
                    label_text: labelMap,
                    threshold,
                });
            } else {
                data = await TestService.fetchWebTextSimilarity({
                    url,
                    label_text: labelMap,
                    threshold,
                });
            }
            setText(data.text);
            setLabeledText(data.labeled_text);
        } catch (err) {
            console.error(err);
            alert('请求失败，请查看控制台');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={4}>网页内容标注工具</Title>
            <Select value={algo} onChange={setAlgo}>
                <Select.Option value="Label">Label</Select.Option>
                <Select.Option value="Similarity" disabled>Similarity (已禁用)</Select.Option>
            </Select>

            <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item label="网页 URL">
                    <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="请输入网页地址" />
                </Form.Item>

                <Form.Item label="标签文本（label_text）">
                    {labelText.map((item, index) => (
                        <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="start">
                            <Input
                                placeholder="标签名，如 question1"
                                value={item.key}
                                onChange={(e) => {
                                    const updated = [...labelText];
                                    updated[index].key = e.target.value;
                                    setLabelText(updated);
                                }}
                            />
                            <Input
                                placeholder="对应文本"
                                value={item.value}
                                onChange={(e) => {
                                    const updated = [...labelText];
                                    updated[index].value = e.target.value;
                                    setLabelText(updated);
                                }}
                            />
                            <MinusCircleOutlined
                                onClick={() => {
                                    const updated = labelText.filter((_, i) => i !== index);
                                    setLabelText(updated);
                                }}
                            />
                        </Space>
                    ))}
                    <Button
                        icon={<PlusOutlined />}
                        type="dashed"
                        onClick={() => setLabelText([...labelText, { key: '', value: '' }])}
                        block
                    >
                        添加标签
                    </Button>
                </Form.Item>

                <Form.Item label="相似度阈值（可选，默认 0.1）">
                    <Input
                        type="number"
                        step={0.01}
                        min={0}
                        max={1}
                        value={threshold}
                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                        placeholder="如 0.1"
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        提取并标注
                    </Button>
                </Form.Item>
            </Form>

            {loading && <Spin tip="加载中..." />}

            {text && (
                <>
                    <Title level={5}>原始正文</Title>
                    <TextArea rows={8} value={text} readOnly />

                    <Title level={5} style={{ marginTop: 20 }}>标注后的内容</Title>
                    <div
                        style={{
                            border: '1px solid #ccc',
                            padding: 12,
                            minHeight: 100,
                            background: '#f9f9f9',
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {labeledText.map(({ label, sentence }, i) =>
                            label ? (
                                <Tooltip title={label} key={i}>
                                    <span style={{
                                        color: label.startsWith("question") ? "red" : label.startsWith("solution") ? "green" : "black",
                                        background: label.startsWith("question") ? "#eee" : label.startsWith("solution") ? "#ece" : "#fff",
                                    }}>{sentence}</span>
                                </Tooltip>
                            ) : (
                                <span key={i}>{sentence}</span>
                            )
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default WebTextLabel;

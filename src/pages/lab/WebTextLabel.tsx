import React, { useState } from 'react';
import { Input, Button, Form, Typography, Spin, Tooltip, Select } from 'antd';
import { TestService } from '../../services/api';
import { LabelSentence } from '../../types';

const { TextArea } = Input;
const { Title } = Typography;

const WebTextLabel: React.FC = () => {
    const [url, setUrl] = useState('');
    const [questionId, setQuestionId] = useState('');
    const [algo, setAlgo] = useState('Label');
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState('');
    const [labeledText, setLabeledText] = useState([] as LabelSentence[]);

    const handleSubmit = async () => {
        if (!url || !questionId) return;

        setLoading(true);
        try {
            let data;
            if (algo === "Label") {
                data = await TestService.fetchWebTextLabel(Number(questionId), url);
            } else {
                data = await TestService.fetchWebTextSimilarity(Number(questionId), url);
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
                <Select.Option value="Similarity">Similarity</Select.Option>
            </Select>
            <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item label="网页 URL">
                    <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="请输入网页地址" />
                </Form.Item>
                <Form.Item label="Question ID">
                    <Input value={questionId} onChange={(e) => setQuestionId(e.target.value)} placeholder="请输入 question_id" />
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
                        {labeledText.map(({ label, sentence }) => (label ? <Tooltip title={label}>
                            <span style={{
                                color: label.startsWith("question") ? "red" : label.startsWith("solution") ? "green" : "black",
                                background: label.startsWith("question") ? "#eee" : label.startsWith("solution") ? "#ece" : "#fff",
                            }}>{sentence}</span>
                        </Tooltip> : sentence))}
                    </div>
                </>
            )}
        </div>
    );
};

export default WebTextLabel;

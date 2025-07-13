import React, { useState } from "react";
import { Input, Button, Typography, Space, Spin, message } from "antd";
import { TestService } from "../../services/api";

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const WebTextExtract: React.FC = () => {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [readability, setReadability] = useState<any>(null);
    const [domSmoothie, setDomSmoothie] = useState<any>(null);

    const handleExtract = async () => {
        if (!url) {
            message.warning("请输入合法网址");
            return;
        }

        setLoading(true);
        setReadability(null);
        setDomSmoothie(null);

        try {
            const data = await TestService.fetchWebContent(url)
            setReadability(data.readability_page);
            setDomSmoothie(data.dom_smoothie_article);
        } catch (err) {
            console.error(err);
            message.error("提取失败，请检查网址或服务是否正常");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 960, margin: "auto" }}>
            <Title level={3}>网页正文提取工具</Title>

            <Space.Compact style={{ width: "100%", marginBottom: 16 }}>
                <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="输入网页 URL（如：https://example.com）"
                />
                <Button type="primary" onClick={handleExtract} loading={loading}>
                    提取
                </Button>
            </Space.Compact>

            {loading && <Spin tip="提取中..." />}

            {readability && (
                <>
                    <Title level={4}>🔍 Readability 提取结果</Title>
                    <Paragraph strong>标题：</Paragraph>
                    <Paragraph>{readability.title}</Paragraph>
                    <Paragraph strong>内容（HTML）：</Paragraph>
                    <TextArea value={readability.content} rows={10} readOnly />
                    <Paragraph strong>纯文本：</Paragraph>
                    <TextArea value={readability.text} rows={10} readOnly />
                </>
            )}

            {domSmoothie && (
                <>
                    <Title level={4}>📄 DOM Smoothie 提取结果</Title>
                    <Paragraph strong>标题：</Paragraph>
                    <Paragraph>{domSmoothie.title}</Paragraph>
                    <Paragraph strong>内容（HTML）：</Paragraph>
                    <TextArea value={domSmoothie.content} rows={10} readOnly />
                    <Paragraph strong>纯文本：</Paragraph>
                    <TextArea value={domSmoothie.text} rows={10} readOnly />
                </>
            )}
        </div>
    );
}

export default WebTextExtract;
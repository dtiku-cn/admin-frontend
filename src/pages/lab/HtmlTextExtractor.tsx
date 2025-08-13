import React, { useState } from "react";
import { Input, Button, Card, Typography, message } from "antd";

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const HtmlTextExtractor: React.FC = () => {
    const [html, setHtml] = useState("");
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const extractText = async () => {
        if (!html.trim()) {
            message.warning("请输入 HTML 内容");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/html_text", {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: html,
            });
            if (!res.ok) throw new Error("请求失败");
            const data = await res.text(); // 接口返回的是纯文本
            setText(data);
        } catch (err) {
            console.error(err);
            message.error("提取失败，请检查接口");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
            <Card>
                <Title level={4}>HTML 文本提取器</Title>
                <Paragraph>输入 HTML 内容，提取其中的纯文本。</Paragraph>
                <TextArea
                    rows={8}
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    placeholder="在这里粘贴 HTML 代码..."
                    style={{ marginBottom: 16 }}
                />
                <Button type="primary" onClick={extractText} loading={loading}>
                    提取文本
                </Button>
            </Card>

            {text && (
                <Card style={{ marginTop: 24 }}>
                    <Title level={5}>提取结果</Title>
                    <Paragraph style={{ whiteSpace: "pre-wrap" }}>{text}</Paragraph>
                </Card>
            )}
        </div>
    );
}

export default HtmlTextExtractor;
import React, { useState } from "react";
import { Input, Button, Select, List, Typography, Spin, message } from "antd";
import { SearchItem } from "../../types";
import { TestService } from "../../services/api";

const { Option } = Select;
const { Title } = Typography;

const WebSearch: React.FC = () => {
    const [questionId, setQuestionId] = useState<string>("");
    const [searchEngine, setSearchEngine] = useState<string>("baidu");
    const [results, setResults] = useState<SearchItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSearch = async () => {
        if (!questionId) {
            message.warning("请输入问题 ID");
            return;
        }
        setLoading(true);
        try {
            const results = await TestService.fetchWebSearch(questionId, searchEngine);
            setResults(results);
        } catch (err) {
            message.error("搜索失败");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
            <Title level={3}>搜索相关内容</Title>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <Input
                    placeholder="请输入问题 ID"
                    value={questionId}
                    onChange={(e) => setQuestionId(e.target.value)}
                    style={{ width: 200 }}
                />
                <Select
                    value={searchEngine}
                    onChange={setSearchEngine}
                    style={{ width: 120 }}
                >
                    <Option value="baidu">百度</Option>
                    <Option value="sogou">搜狗</Option>
                    <Option value="bing">Bing</Option>
                </Select>
                <Button type="primary" onClick={handleSearch} loading={loading}>
                    搜索
                </Button>
            </div>

            {loading ? (
                <Spin />
            ) : (
                <List
                    itemLayout="vertical"
                    dataSource={results}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                title={
                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                        {item.title}
                                    </a>
                                }
                                description={item.desc}
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
}

export default WebSearch;
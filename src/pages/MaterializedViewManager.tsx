import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Space,
    Modal,
    message,
    Typography,
} from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";

const { Text } = Typography;

const fetchMatViews = async () => {
    const res = await fetch("/api/matviews");
    if (!res.ok) throw new Error("获取物化视图失败");
    return await res.json();
};

const refreshMatView = async (name: string) => {
    const res = await fetch(`/api/matviews/${name}/refresh`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("刷新失败");
};

const MaterializedViewManager = () => {
    const [loading, setLoading] = useState(false);
    const [views, setViews] = useState([]);
    const [definition, setDefinition] = useState("");
    const [defVisible, setDefVisible] = useState(false);

    const loadViews = async () => {
        setLoading(true);
        try {
            const data = await fetchMatViews();
            setViews(data);
        } catch (err) {
            message.error(err.message);
        }
        setLoading(false);
    };

    const handleRefresh = async (name: string) => {
        try {
            await refreshMatView(name);
            message.success(`刷新 ${name} 成功`);
        } catch (err) {
            message.error(err.message);
        }
    };

    const handleViewSQL = async (name: string) => {
        try {
            const res = await fetch(`/api/matviews/${name}/definition`);
            const text = await res.text();
            setDefinition(text);
            setDefVisible(true);
        } catch (err) {
            message.error("获取定义失败");
        }
    };

    useEffect(() => {
        loadViews();
    }, []);

    const columns = [
        {
            title: "视图名称",
            dataIndex: "matviewname",
            key: "matviewname",
        },
        {
            title: "所属 Schema",
            dataIndex: "schemaname",
            key: "schemaname",
        },
        {
            title: "是否已填充",
            dataIndex: "ispopulated",
            key: "ispopulated",
            render: (v: boolean) => (v ? "是" : "否"),
        },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => handleRefresh(record.matviewname)}
                    >
                        刷新
                    </Button>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewSQL(record.matviewname)}
                    >
                        查看SQL
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Button onClick={loadViews} loading={loading} type="primary" style={{ marginBottom: 16 }}>
                刷新列表
            </Button>
            <Table
                rowKey="matviewname"
                dataSource={views}
                columns={columns}
                loading={loading}
            />

            <Modal
                title="物化视图定义 SQL"
                open={defVisible}
                onCancel={() => setDefVisible(false)}
                footer={null}
                width={800}
            >
                <Text code style={{ whiteSpace: "pre-wrap" }}>{definition}</Text>
            </Modal>
        </>
    );
};

export default MaterializedViewManager;

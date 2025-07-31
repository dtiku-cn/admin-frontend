import { AlignLeftOutlined, ScheduleOutlined, SettingOutlined, UserOutlined, BugOutlined, TableOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ExamCategoryTree from './pages/ExamCategoryTree';
import ScheduleTaskPage from './pages/ScheduleTask';
import ScheduleTaskDetail from './pages/ScheduleTaskDetail';
import SystemConfigPage from './pages/SystemConfig';
import UserPage from './pages/UserPage';
import TextSimilarity from './pages/lab/TextSimilarity';
import WebTextExtract from './pages/lab/WebTextExtract';
import WebTextLabel from './pages/lab/WebTextLabel';
import MaterializedViewManager from './pages/MaterializedViewManager';
import WebSearch from './pages/lab/WebSearch';
import OpenAITestInterface from './pages/lab/OpenAITestInterface';
import TextRankKeywordExtractor from './pages/lab/TextRankKeywordExtractor';

const { Header, Content, Sider } = Layout;

const items = [
    {
        key: '/system',
        icon: <SettingOutlined />,
        label: <Link to="/system">系统配置</Link>,
    },
    {
        key: '/schedule',
        icon: <ScheduleOutlined />,
        label: <Link to="/schedule">任务调度</Link>,
    },
    {
        key: '/exam-category',
        icon: <AlignLeftOutlined />,
        label: <Link to="/exam-category">考试类目</Link>,
    },
    {
        key: '/user',
        icon: <UserOutlined />,
        label: <Link to="/user">用户管理</Link>,
    },
    {
        key: '/materialized-view',
        icon: <TableOutlined />,
        label: <Link to="/materialized-view">物化视图</Link>,
    },
    {
        key: '/test-lab',
        icon: <BugOutlined />,
        label: '实验室',
        children: [
            {
                key: '/test-lab/text-similarity',
                label: <Link to="/test-lab/text-similarity">文本相似度</Link>,
            },
            {
                key: '/test-lab/web-extract',
                label: <Link to="/test-lab/web-extract">网页提取</Link>,
            },
            {
                key: '/test-lab/web-text-label',
                label: <Link to="/test-lab/web-text-label">网页文本标注</Link>,
            },
            {
                key: '/test-lab/web-search',
                label: <Link to="/test-lab/web-search">网页搜索</Link>,
            },
            {
                key: '/test-lab/openai',
                label: <Link to="/test-lab/openai">OpenAI</Link>,
            },
            {
                key: '/test-lab/text-rank-keyword',
                label: <Link to="/test-lab/text-rank-keyword">TextRank</Link>,
            },
        ],
    },
];

function App() {
    const location = useLocation();
    const selectedKey = location.pathname;
    return (
        <Layout style={{ height: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                    管理后台
                </div>
            </Header>
            <Layout>
                <Sider width={200}>
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['/system']}
                        selectedKeys={[selectedKey]}
                        style={{ height: '100%', borderRight: 0 }}
                        items={items}
                    />
                </Sider>
                <Layout style={{ padding: '24px', overflow: "scroll", maxHeight: "100%" }}>
                    <Content
                        style={{
                            padding: 0,
                            margin: 0,
                            minHeight: "100%",
                        }}
                    >
                        <Routes>
                            <Route path="/system" element={<SystemConfigPage />} />
                            <Route path="/schedule" element={<ScheduleTaskPage />} />
                            <Route path="/schedule/:ty" element={<ScheduleTaskDetail />} />
                            <Route path="/exam-category" element={<ExamCategoryTree />} />
                            <Route path="/user" element={<UserPage />} />
                            <Route path="/materialized-view" element={<MaterializedViewManager />} />
                            <Route path="/test-lab/text-similarity" element={<TextSimilarity />} />
                            <Route path="/test-lab/web-extract" element={<WebTextExtract />} />
                            <Route path="/test-lab/web-text-label" element={<WebTextLabel />} />
                            <Route path="/test-lab/web-search" element={<WebSearch />} />
                            <Route path="/test-lab/openai" element={<OpenAITestInterface />} />
                            <Route path="/test-lab/text-rank-keyword" element={<TextRankKeywordExtractor />} />
                            <Route path="/" element={<Navigate to="/system" replace />} />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}

export default App;
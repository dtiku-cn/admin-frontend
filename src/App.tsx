import { AlignLeftOutlined, ScheduleOutlined, SettingOutlined, UserOutlined, BugOutlined, TableOutlined, DollarOutlined, MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined } from '@ant-design/icons';
import { Layout, Menu, Button, Grid } from 'antd';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useState } from 'react';
import ExamCategoryTree from './pages/ExamCategoryTree';
import ScheduleTaskPage from './pages/ScheduleTask';
import ScheduleTaskDetail from './pages/ScheduleTaskDetail';
import SystemConfigPage from './pages/SystemConfig';
import UserPage from './pages/UserPage';
import OnlineUsersPage from './pages/OnlineUsersPage';
import PayOrderPage from './pages/PayOrderPage';
import TextSimilarity from './pages/lab/TextSimilarity';
import WebTextExtract from './pages/lab/WebTextExtract';
import WebTextLabel from './pages/lab/WebTextLabel';
import MaterializedViewManager from './pages/MaterializedViewManager';
import WebSearch from './pages/lab/WebSearch';
import OpenAITestInterface from './pages/lab/OpenAITestInterface';
import TextRankKeywordExtractor from './pages/lab/TextRankKeywordExtractor';
import HtmlTextExtractor from './pages/lab/HtmlTextExtractor';
import RealtimeStats from './pages/RealtimeStats';

const { Header, Content, Sider } = Layout;
const { useBreakpoint } = Grid;

const items = [
    {
        key: '/system',
        icon: <SettingOutlined />,
        label: <Link to="/system">系统配置</Link>,
    },
    {
        key: '/realtime-stats',
        icon: <DashboardOutlined />,
        label: <Link to="/realtime-stats">实时监控</Link>,
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
        key: '/pay-orders',
        icon: <DollarOutlined />,
        label: <Link to="/pay-orders">支付订单</Link>,
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
                key: '/test-lab/html-text',
                label: <Link to="/test-lab/html-text">Html文本提取</Link>,
            },
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
    const [collapsed, setCollapsed] = useState(false);
    const screens = useBreakpoint();
    
    // 移动端默认折叠
    const isMobile = !screens.md;
    
    return (
        <Layout style={{ height: '100vh' }}>
            <Header style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: isMobile ? '0 16px' : '0 24px',
                gap: 12
            }}>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        fontSize: '16px',
                        width: 32,
                        height: 32,
                        color: 'white',
                    }}
                />
                <div style={{ 
                    color: 'white', 
                    fontSize: isMobile ? '16px' : '20px', 
                    fontWeight: 'bold' 
                }}>
                    管理后台
                </div>
            </Header>
            <Layout>
                <Sider 
                    width={200}
                    collapsed={collapsed}
                    collapsedWidth={isMobile ? 0 : 80}
                    breakpoint="md"
                    onBreakpoint={(broken) => {
                        setCollapsed(broken);
                    }}
                    style={{
                        overflow: 'auto',
                        height: 'calc(100vh - 64px)',
                        position: isMobile ? 'fixed' : 'relative',
                        left: 0,
                        zIndex: 999,
                    }}
                    trigger={null}
                >
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['/system']}
                        selectedKeys={[selectedKey]}
                        style={{ height: '100%', borderRight: 0 }}
                        items={items}
                        inlineCollapsed={collapsed}
                    />
                </Sider>
                <Layout style={{ 
                    padding: isMobile ? '12px' : '24px', 
                    overflow: "auto",
                    marginLeft: (isMobile && !collapsed) ? 0 : 0,
                }}>
                    <Content
                        style={{
                            padding: 0,
                            margin: 0,
                            minHeight: "100%",
                        }}
                    >
                        <Routes>
                            <Route path="/system" element={<SystemConfigPage />} />
                            <Route path="/realtime-stats" element={<RealtimeStats />} />
                            <Route path="/schedule" element={<ScheduleTaskPage />} />
                            <Route path="/schedule/:ty" element={<ScheduleTaskDetail />} />
                            <Route path="/exam-category" element={<ExamCategoryTree />} />
                            <Route path="/user" element={<UserPage />} />
                            <Route path="/user/online" element={<OnlineUsersPage />} />
                            <Route path="/pay-orders" element={<PayOrderPage />} />
                            <Route path="/materialized-view" element={<MaterializedViewManager />} />
                            <Route path="/test-lab/html-text" element={<HtmlTextExtractor />} />
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
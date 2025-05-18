import { AlignLeftOutlined, ScheduleOutlined, SettingOutlined } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ExamCategoryTree from './pages/ExamCategoryTree';
import ScheduleTaskPage from './pages/ScheduleTask';
import ScheduleTaskDetail from './pages/ScheduleTaskDetail';
import SystemConfigPage from './pages/SystemConfig';

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
];

function App() {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const location = useLocation();
    const selectedKey = '/' + location.pathname.split("/").filter(Boolean)[0];
    return (
        <Layout style={{ minHeight: '100vh' }}>
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
                <Layout style={{ padding: '24px' }}>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                            minHeight: 280,
                        }}
                    >
                        <Routes>
                            <Route path="/system" element={<SystemConfigPage />} />
                            <Route path="/schedule" element={<ScheduleTaskPage />} />
                            <Route path="/schedule/:ty" element={<ScheduleTaskDetail />} />
                            <Route path="/exam-category" element={<ExamCategoryTree />} />
                            <Route path="/" element={<Navigate to="/system" replace />} />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}

export default App;
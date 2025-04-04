import React from 'react';
import {Routes, Route, Link, Navigate} from 'react-router-dom';
import {Layout, Menu, theme} from 'antd';
import {SettingOutlined, ScheduleOutlined} from '@ant-design/icons';
import SystemConfigPage from './pages/SystemConfig';
import ScheduleTaskPage from './pages/ScheduleTask';
import {useLocation} from 'react-router-dom';


const {Header, Content, Sider} = Layout;

const items = [
    {
        key: '/system',
        icon: <SettingOutlined/>,
        label: <Link to="/system">系统配置</Link>,
    },
    {
        key: '/schedule',
        icon: <ScheduleOutlined/>,
        label: <Link to="/schedule">任务调度</Link>,
    },
];

function App() {
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();
    const location = useLocation();
    return (
        <Layout style={{minHeight: '100vh'}}>
            <Header style={{display: 'flex', alignItems: 'center'}}>
                <div style={{color: 'white', fontSize: '20px', fontWeight: 'bold'}}>
                    管理后台
                </div>
            </Header>
            <Layout>
                <Sider width={200}>
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['/system']}
                        selectedKeys={[location.pathname]}
                        style={{height: '100%', borderRight: 0}}
                        items={items}
                    />
                </Sider>
                <Layout style={{padding: '24px'}}>
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
                            <Route path="/system" element={<SystemConfigPage/>}/>
                            <Route path="/schedule" element={<ScheduleTaskPage/>}/>
                            <Route path="/" element={<Navigate to="/system" replace/>}/>
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}

export default App;
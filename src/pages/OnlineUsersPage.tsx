// src/pages/OnlineUsersPage.tsx
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Avatar, Typography, Grid, Button } from 'antd';
import { UserOutlined, ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/api';
import { OnlineUserStats } from '../types';

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

const OnlineUsersPage: React.FC = () => {
    const [onlineStats, setOnlineStats] = useState<OnlineUserStats>({ online_count: 0, online_users: [] });
    const [loading, setLoading] = useState(false);
    const screens = useBreakpoint();
    const navigate = useNavigate();

    // 加载在线用户数据
    const loadOnlineUsers = () => {
        setLoading(true);
        UserService.fetch_online_users()
            .then(data => {
                setOnlineStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadOnlineUsers();
        // 每30秒自动刷新一次
        const interval = setInterval(loadOnlineUsers, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card 
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/user')}
                        type="text"
                    />
                    <Title level={screens.xs ? 4 : 3} style={{ margin: 0 }}>
                        实时在线用户 ({onlineStats.online_count}人)
                    </Title>
                </div>
            }
            extra={
                <Button 
                    icon={<ReloadOutlined />} 
                    onClick={loadOnlineUsers}
                    loading={loading}
                >
                    {!screens.xs && '刷新'}
                </Button>
            }
            styles={{ body: { padding: screens.xs ? 12 : 24 } }}
        >
            {onlineStats.online_count === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    color: '#999'
                }}>
                    <UserOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <div>当前暂无在线用户</div>
                </div>
            ) : (
                <div style={{ 
                    maxHeight: screens.xs ? 'calc(100vh - 200px)' : 'calc(100vh - 250px)', 
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}>
                    <Row gutter={[8, 8]} justify="start">
                        {onlineStats.online_users.map((user) => (
                            <Col 
                                key={user.id} 
                                xs={8} 
                                sm={6} 
                                md={4} 
                                lg={3}
                                xl={2}
                                style={{ textAlign: 'center' }}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    padding: screens.xs ? 4 : 6,
                                    borderRadius: 6,
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                }}
                                className="online-user-item"
                                >
                                    <Avatar 
                                        src={user.avatar} 
                                        size={screens.xs ? 36 : 48} 
                                        icon={<UserOutlined />}
                                        style={{ 
                                            marginBottom: 4,
                                            border: '1.5px solid #1890ff',
                                            boxShadow: '0 1px 4px rgba(24, 144, 255, 0.2)',
                                        }}
                                    />
                                    <Text 
                                        ellipsis={{ tooltip: user.name }}
                                        style={{ 
                                            maxWidth: '100%',
                                            fontSize: screens.xs ? 11 : 12,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {user.name}
                                    </Text>
                                    <Text 
                                        type="secondary"
                                        style={{ 
                                            fontSize: screens.xs ? 9 : 10,
                                            marginTop: 2,
                                        }}
                                    >
                                        {dayjs(user.modified).format('HH:mm')}
                                    </Text>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
        </Card>
    );
};

export default OnlineUsersPage;


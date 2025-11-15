import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Grid, Row, Col, Statistic, Button, Spin, Empty, Typography, Select, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ReactECharts from 'echarts-for-react';
import { ReloadOutlined, WarningOutlined, UserOutlined, DashboardOutlined, FireOutlined } from '@ant-design/icons';
import { RealtimeStatsService } from '../services/api';
import type { BlockedIp, SuspiciousUser, TrafficStats, RateLimitConfig, HotUrl } from '../types';
import dayjs from 'dayjs';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

const RealtimeStats: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [hosts, setHosts] = useState<string[]>([]);
    const [selectedHost, setSelectedHost] = useState<string>('');
    const [blockedIps, setBlockedIps] = useState<BlockedIp[]>([]);
    const [suspiciousUsers, setSuspiciousUsers] = useState<SuspiciousUser[]>([]);
    const [trafficStats, setTrafficStats] = useState<TrafficStats[]>([]);
    const [rateLimits, setRateLimits] = useState<RateLimitConfig[]>([]);
    const [hotUrls, setHotUrls] = useState<HotUrl[]>([]);
    const screens = useBreakpoint();

    const loadHosts = async () => {
        try {
            const hostList = await RealtimeStatsService.fetch_hosts();
            setHosts(hostList);
            if (hostList.length > 0 && !selectedHost) {
                setSelectedHost(hostList[0]);
            }
        } catch (error) {
            console.error('加载 hosts 列表失败:', error);
        }
    };

    const loadAllStats = async () => {
        setLoading(true);
        try {
            const [ips, users, traffic, limits, urls] = await Promise.all([
                RealtimeStatsService.fetch_blocked_ips(selectedHost),
                RealtimeStatsService.fetch_suspicious_users(selectedHost),
                RealtimeStatsService.fetch_traffic_stats(selectedHost),
                RealtimeStatsService.fetch_rate_limits(selectedHost),
                RealtimeStatsService.fetch_hot_urls(selectedHost),
            ]);
            setBlockedIps(ips);
            setSuspiciousUsers(users);
            setTrafficStats(traffic);
            setRateLimits(limits);
            setHotUrls(urls);
        } catch (error) {
            console.error('加载实时统计数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHosts();
    }, []);

    useEffect(() => {
        if (selectedHost !== undefined) {
            loadAllStats();
            // 每30秒自动刷新
            const interval = setInterval(loadAllStats, 30000);
            return () => clearInterval(interval);
        }
    }, [selectedHost]);

    // 计算流量统计汇总
    const getTotalRequests = () => {
        const totalStat = trafficStats.find(s => s.metric_type === 'total_requests');
        return totalStat ? totalStat.value : 0;
    };

    const getStatusStats = () => {
        const statusStats = trafficStats.filter(s => s.metric_type === 'by_status');
        return {
            '2xx': statusStats.find(s => s.metric_key === '2xx')?.value || 0,
            '3xx': statusStats.find(s => s.metric_key === '3xx')?.value || 0,
            '4xx': statusStats.find(s => s.metric_key === '4xx')?.value || 0,
            '5xx': statusStats.find(s => s.metric_key === '5xx')?.value || 0,
        };
    };

    // 封禁IP表格列
    const ipColumns: ColumnsType<BlockedIp> = [
        {
            title: 'IP地址',
            dataIndex: 'ip',
            key: 'ip',
            fixed: screens.md ? 'left' : undefined,
            width: screens.xs ? 120 : 150,
        },
        {
            title: '请求次数',
            dataIndex: 'request_count',
            key: 'request_count',
            sorter: (a, b) => a.request_count - b.request_count,
            render: (count: number) => <Tag color="red">{count}</Tag>,
        },
        {
            title: '首次发现',
            dataIndex: 'first_seen',
            key: 'first_seen',
            responsive: ['md'],
            render: (time: string) => dayjs(time).format('MM-DD HH:mm:ss'),
        },
        {
            title: '最后发现',
            dataIndex: 'last_seen',
            key: 'last_seen',
            responsive: ['lg'],
            render: (time: string) => dayjs(time).format('MM-DD HH:mm:ss'),
        },
        {
            title: '封禁至',
            dataIndex: 'block_until',
            key: 'block_until',
            render: (time: string) => dayjs(time).format('MM-DD HH:mm:ss'),
        },
    ];

    // 异常用户表格列
    const userColumns: ColumnsType<SuspiciousUser> = [
        {
            title: '用户ID',
            dataIndex: 'user_id',
            key: 'user_id',
            width: screens.xs ? 100 : 120,
        },
        {
            title: '用户名',
            dataIndex: 'user_name',
            key: 'user_name',
            responsive: ['md'],
        },
        {
            title: '请求次数',
            dataIndex: 'request_count',
            key: 'request_count',
            sorter: (a, b) => a.request_count - b.request_count,
        },
        {
            title: '错误率',
            dataIndex: 'error_rate',
            key: 'error_rate',
            render: (rate: number) => (
                <Text type={rate > 0.3 ? 'danger' : rate > 0.1 ? 'warning' : undefined}>
                    {(rate * 100).toFixed(1)}%
                </Text>
            ),
        },
        {
            title: '风险等级',
            dataIndex: 'risk_level',
            key: 'risk_level',
            render: (level: string) => {
                const colors = { high: 'red', medium: 'orange', low: 'green' };
                const labels = { high: '高', medium: '中', low: '低' };
                return <Tag color={colors[level as keyof typeof colors]}>{labels[level as keyof typeof labels]}</Tag>;
            },
        },
        {
            title: '时间窗口',
            dataIndex: 'window_end',
            key: 'window_end',
            responsive: ['lg'],
            render: (time: string) => dayjs(time).format('MM-DD HH:mm'),
        },
    ];

    // 限流配置表格列
    const rateLimitColumns: ColumnsType<RateLimitConfig> = [
        {
            title: '端点',
            dataIndex: 'endpoint',
            key: 'endpoint',
            ellipsis: true,
            width: screens.xs ? 150 : 300,
        },
        {
            title: '当前QPS',
            dataIndex: 'current_qps',
            key: 'current_qps',
            sorter: (a, b) => a.current_qps - b.current_qps,
            render: (qps: number) => <Tag color="blue">{qps}</Tag>,
        },
        {
            title: '错误率',
            dataIndex: 'error_rate',
            key: 'error_rate',
            responsive: ['md'],
            render: (rate: number) => (
                <Text type={rate > 0.1 ? 'danger' : rate > 0.05 ? 'warning' : undefined}>
                    {(rate * 100).toFixed(2)}%
                </Text>
            ),
        },
        {
            title: '建议限流',
            dataIndex: 'suggested_limit',
            key: 'suggested_limit',
            render: (limit: number) => <Tag color="green">{limit} req/s</Tag>,
        },
    ];

    // 热门URL表格列
    const hotUrlColumns: ColumnsType<HotUrl> = [
        {
            title: 'URL路径',
            dataIndex: 'url_path',
            key: 'url_path',
            ellipsis: true,
            width: screens.xs ? 150 : 300,
        },
        {
            title: '请求次数',
            dataIndex: 'request_count',
            key: 'request_count',
            sorter: (a, b) => a.request_count - b.request_count,
        },
        {
            title: '4xx错误',
            dataIndex: 'status_4xx_count',
            key: 'status_4xx_count',
            responsive: ['md'],
            render: (count: number) => count > 0 ? <Tag color="orange">{count}</Tag> : <Text type="secondary">0</Text>,
        },
        {
            title: '5xx错误',
            dataIndex: 'status_5xx_count',
            key: 'status_5xx_count',
            responsive: ['md'],
            render: (count: number) => count > 0 ? <Tag color="red">{count}</Tag> : <Text type="secondary">0</Text>,
        },
        {
            title: '平均响应大小',
            dataIndex: 'avg_response_size',
            key: 'avg_response_size',
            responsive: ['lg'],
            render: (size: number) => `${(size / 1024).toFixed(2)} KB`,
        },
    ];

    // 状态码分布图表
    const statusChartOption = {
        title: { 
            text: '请求状态码分布',
            left: 'center',
            textStyle: { fontSize: screens.xs ? 14 : 16 }
        },
        tooltip: { trigger: 'item' },
        legend: {
            orient: 'horizontal',
            bottom: 0,
            textStyle: { fontSize: screens.xs ? 10 : 12 }
        },
        series: [
            {
                name: '状态码',
                type: 'pie',
                radius: screens.xs ? '50%' : '60%',
                center: ['50%', '45%'],
                data: [
                    { value: getStatusStats()['2xx'], name: '2xx 成功', itemStyle: { color: '#52c41a' } },
                    { value: getStatusStats()['3xx'], name: '3xx 重定向', itemStyle: { color: '#1890ff' } },
                    { value: getStatusStats()['4xx'], name: '4xx 客户端错误', itemStyle: { color: '#faad14' } },
                    { value: getStatusStats()['5xx'], name: '5xx 服务器错误', itemStyle: { color: '#f5222d' } },
                ],
                label: {
                    fontSize: screens.xs ? 10 : 12,
                    formatter: '{b}: {c} ({d}%)'
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    // Top QPS 端点图表
    const qpsChartOption = {
        title: { 
            text: 'Top 10 QPS端点',
            left: 'center',
            textStyle: { fontSize: screens.xs ? 14 : 16 }
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: {
            left: screens.xs ? '5%' : '3%',
            right: screens.xs ? '5%' : '4%',
            bottom: screens.xs ? '5%' : '3%',
            top: screens.xs ? '15%' : '12%',
            containLabel: true
        },
        xAxis: { 
            type: 'value',
            axisLabel: { fontSize: screens.xs ? 10 : 12 }
        },
        yAxis: {
            type: 'category',
            data: rateLimits.slice(0, 10).map(r => r.endpoint.substring(0, 30) + (r.endpoint.length > 30 ? '...' : '')),
            axisLabel: { fontSize: screens.xs ? 10 : 12 }
        },
        series: [
            {
                name: 'QPS',
                type: 'bar',
                data: rateLimits.slice(0, 10).map(r => r.current_qps),
                itemStyle: { color: '#1890ff' },
                label: {
                    show: true,
                    position: 'right',
                    fontSize: screens.xs ? 10 : 12
                }
            }
        ]
    };

    // 热门URL请求次数图表
    const hotUrlChartOption = {
        title: { 
            text: 'Top 10 热门URL',
            left: 'center',
            textStyle: { fontSize: screens.xs ? 14 : 16 }
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: {
            left: screens.xs ? '5%' : '3%',
            right: screens.xs ? '5%' : '4%',
            bottom: screens.xs ? '5%' : '3%',
            top: screens.xs ? '15%' : '12%',
            containLabel: true
        },
        xAxis: { 
            type: 'value',
            axisLabel: { fontSize: screens.xs ? 10 : 12 }
        },
        yAxis: {
            type: 'category',
            data: hotUrls.slice(0, 10).map(u => u.url_path.substring(0, 30) + (u.url_path.length > 30 ? '...' : '')),
            axisLabel: { fontSize: screens.xs ? 10 : 12 }
        },
        series: [
            {
                name: '请求次数',
                type: 'bar',
                data: hotUrls.slice(0, 10).map(u => u.request_count),
                itemStyle: { color: '#ff7a45' },
                label: {
                    show: true,
                    position: 'right',
                    fontSize: screens.xs ? 10 : 12
                }
            }
        ]
    };

    const statusStats = getStatusStats();
    const totalRequests = getTotalRequests();

    return (
        <Spin spinning={loading}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <Title level={screens.xs ? 4 : 3} style={{ margin: 0 }}>实时流量监控</Title>
                <Space size="middle">
                    <Select
                        value={selectedHost}
                        onChange={setSelectedHost}
                        style={{ width: screens.xs ? 150 : 200 }}
                        size={screens.xs ? 'small' : 'middle'}
                        placeholder="选择 Host"
                        options={hosts.map(host => ({
                            label: host || '(空)',
                            value: host,
                        }))}
                    />
                    <Button 
                        type="primary" 
                        icon={<ReloadOutlined />} 
                        onClick={loadAllStats}
                        size={screens.xs ? 'small' : 'middle'}
                    >
                        刷新数据
                    </Button>
                </Space>
            </div>

            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={12} md={6}>
                    <Card>
                        <Statistic 
                            title="总请求数" 
                            value={totalRequests} 
                            prefix={<DashboardOutlined />}
                            valueStyle={{ color: '#1890ff', fontSize: screens.xs ? '1.2em' : '1.5em' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card>
                        <Statistic 
                            title="封禁IP数" 
                            value={blockedIps.length} 
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#f5222d', fontSize: screens.xs ? '1.2em' : '1.5em' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card>
                        <Statistic 
                            title="异常用户数" 
                            value={suspiciousUsers.length} 
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#faad14', fontSize: screens.xs ? '1.2em' : '1.5em' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <Card>
                        <Statistic 
                            title="热门URL数" 
                            value={hotUrls.length} 
                            prefix={<FireOutlined />}
                            valueStyle={{ color: '#52c41a', fontSize: screens.xs ? '1.2em' : '1.5em' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 图表区域 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={12}>
                    <Card>
                        {trafficStats.length > 0 ? (
                            <ReactECharts 
                                option={statusChartOption} 
                                style={{ height: screens.xs ? '250px' : '350px' }}
                            />
                        ) : (
                            <Empty description="暂无流量数据" style={{ padding: '50px 0' }} />
                        )}
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card>
                        {rateLimits.length > 0 ? (
                            <ReactECharts 
                                option={qpsChartOption} 
                                style={{ height: screens.xs ? '250px' : '350px' }}
                            />
                        ) : (
                            <Empty description="暂无QPS数据" style={{ padding: '50px 0' }} />
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24}>
                    <Card>
                        {hotUrls.length > 0 ? (
                            <ReactECharts 
                                option={hotUrlChartOption} 
                                style={{ height: screens.xs ? '300px' : '400px' }}
                            />
                        ) : (
                            <Empty description="暂无热门URL数据" style={{ padding: '50px 0' }} />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* 详细表格 */}
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card 
                        title="DDoS防护 - 封禁IP列表" 
                        extra={<Tag color="red">{blockedIps.length}个IP已封禁</Tag>}
                        styles={{ body: { padding: screens.xs ? 12 : 24 } }}
                    >
                        <Table
                            rowKey="ip"
                            columns={ipColumns}
                            dataSource={blockedIps}
                            pagination={{ pageSize: 10, size: screens.xs ? 'small' : 'default' }}
                            size={screens.xs ? 'small' : 'middle'}
                            scroll={{ x: screens.xs ? 800 : undefined }}
                        />
                    </Card>
                </Col>
                
                <Col xs={24}>
                    <Card 
                        title="账户安全 - 异常用户监控" 
                        extra={<Tag color="orange">{suspiciousUsers.length}个异常用户</Tag>}
                        styles={{ body: { padding: screens.xs ? 12 : 24 } }}
                    >
                        <Table
                            rowKey="user_id"
                            columns={userColumns}
                            dataSource={suspiciousUsers}
                            pagination={{ pageSize: 10, size: screens.xs ? 'small' : 'default' }}
                            size={screens.xs ? 'small' : 'middle'}
                            scroll={{ x: screens.xs ? 800 : undefined }}
                        />
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card 
                        title="智能限流 - 端点QPS配置" 
                        extra={<Tag color="blue">{rateLimits.length}个端点</Tag>}
                        styles={{ body: { padding: screens.xs ? 12 : 24 } }}
                    >
                        <Table
                            rowKey="endpoint"
                            columns={rateLimitColumns}
                            dataSource={rateLimits}
                            pagination={{ pageSize: 10, size: screens.xs ? 'small' : 'default' }}
                            size={screens.xs ? 'small' : 'middle'}
                            scroll={{ x: screens.xs ? 800 : undefined }}
                        />
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card 
                        title="URL热点分析 - Top热门访问路径" 
                        extra={<Tag color="green">{hotUrls.length}个热门URL</Tag>}
                        styles={{ body: { padding: screens.xs ? 12 : 24 } }}
                    >
                        <Table
                            rowKey="url_path"
                            columns={hotUrlColumns}
                            dataSource={hotUrls}
                            pagination={{ pageSize: 10, size: screens.xs ? 'small' : 'default' }}
                            size={screens.xs ? 'small' : 'middle'}
                            scroll={{ x: screens.xs ? 800 : undefined }}
                        />
                    </Card>
                </Col>
            </Row>
        </Spin>
    );
};

export default RealtimeStats;


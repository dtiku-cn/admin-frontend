import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Card, Descriptions, DescriptionsProps, message, Space} from 'antd';
import type {ScheduleTask} from '../types.ts';
import {scheduleTaskService} from '../services/api.ts';
import {LeftOutlined} from "@ant-design/icons";

const ScheduleTaskDetail: React.FC = () => {
    const {ty} = useParams();
    const [data, setData] = useState<ScheduleTask>();
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const response = await scheduleTaskService.get(ty as string);
            setData(response);
        } catch (error) {
            message.error('获取数据失败');
            console.error('Failed to fetch data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const taskDetailItems: DescriptionsProps['items'] = [{
        key: 'id',
        label: 'ID',
        children: data?.id || '-',
    }, {
        key: 'type',
        label: '类型',
        children: data?.ty,
    }, {
        key: 'desc',
        label: '描述',
        children: data?.desc,
    }, {
        key: 'active',
        label: '是否启用',
        children: data?.active ? '启用' : '禁用',
    }, {
        key: 'created',
        label: '创建时间',
        children: data?.created,
    }, {
        key: 'modified',
        label: '修改时间',
        children: data?.modified,
    }, {
        key: 'runCount',
        label: '运行次数',
        children: data?.run_count,
    }, {
        key: 'context',
        label: '上下文',
        children: JSON.stringify(data?.context),
    }];


    return (
        <Card>
            <Descriptions title={
                <Space><Button type="text" icon={<LeftOutlined/>} onClick={() => navigate(-1)}/>任务详情</Space>
            } items={taskDetailItems}/>
        </Card>
    );
};

export default ScheduleTaskDetail;
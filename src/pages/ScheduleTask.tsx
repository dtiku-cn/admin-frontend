import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, Space, message } from 'antd';
import type { ScheduleTask } from '../types';

interface ApiResponse {
  data: ScheduleTask[];
  total: number;
}

const ScheduleTaskPage: React.FC = () => {
  const [data, setData] = useState<ScheduleTask[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | undefined>();

  useEffect(() => {
    // Simulating API call with mock data
    const mockData: ApiResponse = {
      data: [
        {
          id: null,
          version: 0,
          ty: "FenbiSync",
          desc: "同步粉笔数据",
          active: false,
          context: null,
          runCount: 0,
          instances: null,
          created: null,
          modified: null
        }
      ],
      total: 1
    };

    setData(mockData.data);
    setTotal(mockData.total);
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '类型',
      dataIndex: 'ty',
      key: 'ty',
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
    },
    {
      title: '状态',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Switch checked={active} disabled />
      ),
    },
    {
      title: '运行次数',
      dataIndex: 'runCount',
      key: 'runCount',
      render: (count: number) => count || 0,
    },
    {
      title: '上下文',
      dataIndex: 'context',
      key: 'context',
      render: (context: any) => context ? JSON.stringify(context) : '-',
    },
    {
      title: '实例',
      dataIndex: 'instances',
      key: 'instances',
      render: (instances: any) => instances ? JSON.stringify(instances) : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created',
      key: 'created',
      render: (created: string | null) => created || '-',
    },
    {
      title: '修改时间',
      dataIndex: 'modified',
      key: 'modified',
      render: (modified: string | null) => modified || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ScheduleTask) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button 
            type="link" 
            onClick={() => handleToggleActive(record)}
          >
            {record.active ? '停用' : '启用'}
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: ScheduleTask) => {
    setEditingId(record.id || undefined);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setEditingId(undefined);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleToggleActive = (record: ScheduleTask) => {
    setData(data.map(item =>
      item.id === record.id ? { ...item, active: !item.active } : item
    ));
    message.success(`${record.active ? '停用' : '启用'}成功`);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        // Update existing task
        setData(data.map(item => 
          item.id === editingId ? { ...item, ...values } : item
        ));
      } else {
        // Add new task
        setData([...data, {
          ...values,
          id: null,
          version: 0,
          runCount: 0,
          instances: null,
          context: null,
          created: null,
          modified: null
        }]);
        setTotal(total + 1);
      }
      setIsModalVisible(false);
      message.success(`${editingId ? '更新' : '添加'}成功`);
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>
          添加任务
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey={(record) => record.ty}
        pagination={{
          total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
      
      <Modal
        title={editingId ? "编辑任务" : "添加任务"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="ty"
            label="类型"
            rules={[{ required: true, message: '请输入任务类型' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="desc"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="active"
            label="状态"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleTaskPage;
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message } from 'antd';
import type { SystemConfig } from '../types';

interface ApiResponse {
  data: SystemConfig[];
  total: number;
}

const SystemConfigPage: React.FC = () => {
  const [data, setData] = useState<SystemConfig[]>([]);
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
          key: "AdsScript",
          keyDesc: "联盟广告位脚本，show_ads开启时生效",
          value: null,
          created: null,
          modified: null
        },
        {
          id: null,
          version: 0,
          key: "RalineConfig",
          keyDesc: "Raline评论配置",
          value: null,
          created: null,
          modified: null
        }
      ],
      total: 2
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
      title: '配置键',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: '描述',
      dataIndex: 'keyDesc',
      key: 'keyDesc',
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      render: (value: any) => value ? JSON.stringify(value) : '-',
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
      render: (_: any, record: SystemConfig) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: SystemConfig) => {
    setEditingId(record.id || undefined);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setEditingId(undefined);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        // Update existing config
        setData(data.map(item => 
          item.id === editingId ? { ...item, ...values } : item
        ));
      } else {
        // Add new config
        setData([...data, { 
          ...values, 
          id: null,
          version: 0,
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
          添加配置
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey={(record) => record.key}
        pagination={{
          total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
      
      <Modal
        title={editingId ? "编辑配置" : "添加配置"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="key"
            label="配置键"
            rules={[{ required: true, message: '请输入配置键' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="keyDesc"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="value"
            label="值"
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemConfigPage;
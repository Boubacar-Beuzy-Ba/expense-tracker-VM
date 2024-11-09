import React, { useState } from 'react';
import { Card, Tabs, Button, Table, Modal, Form, Input, Select, App, Tag, Space } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

export function PettyCashSettings() {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: custodians, isLoading } = useQuery({
    queryKey: ['custodians'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return profiles || [];
    },
  });

  const createUser = useMutation({
    mutationFn: async (values: any) => {
      // 1. Create auth user with admin role
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: values.email,
        password: values.password,
        email_confirm: true,
        user_metadata: {
          full_name: values.full_name,
          role: 'custodian',
          department: values.department
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custodians'] });
      message.success('User created successfully');
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to create user');
      console.error('Create user error:', error);
    },
  });

  const updateUser = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: values.full_name,
          department: values.department
        })
        .eq('id', editingUser.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custodians'] });
      message.success('User updated successfully');
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error('Failed to update user');
      console.error('Update user error:', error);
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custodians'] });
      message.success('User deleted successfully');
    },
    onError: (error: any) => {
      message.error('Failed to delete user');
      console.error('Delete user error:', error);
    },
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (department: string) => (
        <Tag color="blue">{department?.toUpperCase() || 'N/A'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Delete User',
                content: 'Are you sure you want to delete this user?',
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: () => deleteUser.mutate(record.id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <Tabs
          items={[
            {
              key: 'users',
              label: 'User Management',
              children: (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingUser(null);
                        form.resetFields();
                        setIsModalVisible(true);
                      }}
                    >
                      Add User
                    </Button>
                  </div>
                  <Table
                    columns={columns}
                    dataSource={custodians}
                    loading={isLoading}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (editingUser) {
              updateUser.mutate(values);
            } else {
              createUser.mutate(values);
            }
          }}
        >
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input />
            </Form.Item>
          )}

          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select>
              <Select.Option value="warehouse">Warehouse</Select.Option>
              <Select.Option value="office">Office</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createUser.isPending || updateUser.isPending}
              block
            >
              {editingUser ? 'Update' : 'Create'} User
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
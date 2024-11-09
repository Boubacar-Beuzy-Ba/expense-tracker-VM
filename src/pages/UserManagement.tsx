import React from 'react';
import { Table, Button, Modal, Form, Input, Select, Card, Space, App } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name is required'),
  role: z.string().min(1, 'Role is required')
});

type UserForm = z.infer<typeof userSchema>;

export function UserManagement() {
  const { message } = App.useApp();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserForm>({
    resolver: zodResolver(userSchema)
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const createUser = useMutation({
    mutationFn: async (values: UserForm) => {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: values.email,
        password: values.password,
        email_confirm: true,
        user_metadata: {
          full_name: values.full_name,
          role: values.role
        }
      });

      if (authError) throw authError;
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User created successfully');
      setIsModalVisible(false);
      reset();
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to create user');
      console.error('Create user error:', error);
    },
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User role updated successfully');
    },
    onError: (error) => {
      message.error('Failed to update user role');
      console.error('Update role error:', error);
    },
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      responsive: ['md'],
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record: any) => (
        <Select
          value={role}
          onChange={(value) => updateUserRole.mutate({ userId: record.id, role: value })}
          style={{ width: 120 }}
        >
          <Select.Option value="admin">Admin</Select.Option>
          <Select.Option value="manager">Manager</Select.Option>
          <Select.Option value="user">User</Select.Option>
        </Select>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <Card
        title="User Management"
        extra={
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Create User
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={isLoadingUsers}
          pagination={{
            pageSize: isMobile ? 5 : 10,
            showSizeChanger: !isMobile,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title="Create New User"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          reset();
        }}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmit((data) => createUser.mutate(data))}
        >
          <Form.Item
            label="Email"
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} type="email" placeholder="Enter email" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} placeholder="Enter password" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Full Name"
            validateStatus={errors.full_name ? 'error' : ''}
            help={errors.full_name?.message}
          >
            <Controller
              name="full_name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter full name" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Role"
            validateStatus={errors.role ? 'error' : ''}
            help={errors.role?.message}
          >
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select role">
                  <Select.Option value="admin">Admin</Select.Option>
                  <Select.Option value="manager">Manager</Select.Option>
                  <Select.Option value="user">User</Select.Option>
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                reset();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
}

export default UserManagement;
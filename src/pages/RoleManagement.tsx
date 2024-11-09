import React from 'react';
import { Table, Button, Modal, Form, Input, Card, Space, Checkbox, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Role, Permission } from '../types/auth';
import { motion } from 'framer-motion';

export function RoleManagement() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions (
            permissions (
              id,
              name,
              description
            )
          )
        `);
      if (error) throw error;
      return data as (Role & { role_permissions: { permissions: Permission }[] })[];
    },
  });

  const { data: permissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*');
      if (error) throw error;
      return data as Permission[];
    },
  });

  const createRole = useMutation({
    mutationFn: async (values: any) => {
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .insert([{
          name: values.name,
          description: values.description,
        }])
        .select()
        .single();

      if (roleError) throw roleError;

      if (values.permissions?.length) {
        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(
            values.permissions.map((permId: string) => ({
              role_id: roleData.id,
              permission_id: permId,
            }))
          );
        if (permError) throw permError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      message.success('Role created successfully');
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error('Failed to create role');
      console.error(error);
    },
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (text: string, record: Role & { role_permissions: { permissions: Permission }[] }) => (
        <Space wrap>
          {record.role_permissions?.map(({ permissions }) => (
            <span 
              key={permissions.id} 
              className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
            >
              {permissions.name}
            </span>
          )) || 'No permissions'}
        </Space>
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
        title="Role Management"
        extra={
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Create Role
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={roles || []}
          rowKey="id"
          loading={isLoadingRoles}
        />
      </Card>

      <Modal
        title="Create New Role"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createRole.mutate(values)}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a role name' }]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea placeholder="Enter role description" />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Permissions"
          >
            <Checkbox.Group>
              <Space direction="vertical">
                {permissions?.map((permission) => (
                  <Checkbox key={permission.id} value={permission.id}>
                    {permission.name}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
}

export default RoleManagement;
import React from 'react';
import { Form, Input, InputNumber, Select, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../context/CurrencyContext';

type Props = {
  onSubmit: (data: any) => void;
  initialData?: any;
  isSubmitting?: boolean;
};

export function FundForm({ onSubmit, initialData, isSubmitting }: Props) {
  const [form] = Form.useForm();
  const { currency } = useCurrency();

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name')
        .order('full_name', { ascending: true });
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      return data || [];
    },
    retry: 1
  });

  const departments = [
    { label: 'Warehouse', value: 'warehouse' },
    { label: 'Office', value: 'office' },
  ];

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialData}
    >
      <Form.Item
        name="name"
        label="Fund Name"
        rules={[{ required: true, message: 'Please enter fund name' }]}
      >
        <Input placeholder="Enter fund name" />
      </Form.Item>

      <Form.Item
        name="initial_balance"
        label={`Initial Balance (${currency})`}
        rules={[
          { required: true, message: 'Please enter initial balance' },
          { type: 'number', min: 0, message: 'Balance must be positive' }
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          precision={2}
          prefix={currency}
          placeholder="Enter initial balance"
        />
      </Form.Item>

      <Form.Item
        name="department"
        label="Department"
        rules={[{ required: true, message: 'Please select department' }]}
      >
        <Select
          placeholder="Select department"
          options={departments}
        />
      </Form.Item>

      <Form.Item
        name="custodian_id"
        label="Custodian"
        rules={[{ required: true, message: 'Please select a custodian' }]}
        tooltip="The person responsible for managing this petty cash fund"
      >
        <Select
          placeholder="Select custodian"
          loading={isLoadingUsers}
          showSearch
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={users?.map(user => ({
            value: user.id,
            label: `${user.full_name} (${user.email})`
          }))}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          block
        >
          {initialData ? 'Update' : 'Create'} Fund
        </Button>
      </Form.Item>
    </Form>
  );
}
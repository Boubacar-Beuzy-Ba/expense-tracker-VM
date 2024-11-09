import React from 'react';
import { Form, Select, DatePicker, Button, Card, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

type Props = {
  onFilter: (values: any) => void;
  onReset: () => void;
};

const categories = [
  'Office Supplies',
  'Transportation',
  'Meals',
  'Maintenance',
  'Other',
];

export function TransactionFilters({ onFilter, onReset }: Props) {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Card>
      <Form
        form={form}
        layout="horizontal"
        onFinish={onFilter}
      >
        <div className="flex flex-wrap gap-4">
          <Form.Item name="type" style={{ marginBottom: 0 }}>
            <Select
              placeholder="Transaction Type"
              style={{ width: 200 }}
              allowClear
            >
              <Select.Option value="expense">Expense</Select.Option>
              <Select.Option value="replenishment">Replenishment</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="category" style={{ marginBottom: 0 }}>
            <Select
              placeholder="Category"
              style={{ width: 200 }}
              allowClear
            >
              {categories.map(category => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" style={{ marginBottom: 0 }}>
            <RangePicker />
          </Form.Item>

          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              htmlType="submit"
            >
              Filter
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Space>
        </div>
      </Form>
    </Card>
  );
}
import React from 'react';
import { Form, Input, InputNumber, Select, Button, Radio } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCurrency } from '../../context/CurrencyContext';

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['replenishment', 'expense']),
  description: z.string().min(1, 'Description is required'),
  receipt_number: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

type Props = {
  fundId: string;
  onSubmit: (data: TransactionFormData) => void;
};

const categories = [
  'Office Supplies',
  'Transportation',
  'Meals',
  'Maintenance',
  'Other',
];

export function TransactionForm({ onSubmit }: Props) {
  const { currency } = useCurrency();
  const [form] = Form.useForm();

  const { control, handleSubmit, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
    },
  });

  const onFinish = async (data: TransactionFormData) => {
    await onSubmit(data);
    form.resetFields();
  };

  return (
    <Form 
      form={form}
      layout="vertical" 
      onFinish={handleSubmit(onFinish)}
    >
      <Form.Item
        label="Transaction Type"
        validateStatus={errors.type ? 'error' : ''}
        help={errors.type?.message}
      >
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Radio.Group {...field}>
              <Radio.Button value="expense">Expense</Radio.Button>
              <Radio.Button value="replenishment">Replenishment</Radio.Button>
            </Radio.Group>
          )}
        />
      </Form.Item>

      <Form.Item
        label={`Amount (${currency})`}
        validateStatus={errors.amount ? 'error' : ''}
        help={errors.amount?.message}
      >
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              className="w-full"
              min={0}
              step={0.01}
              prefix={currency}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Description"
        validateStatus={errors.description ? 'error' : ''}
        help={errors.description?.message}
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="Enter description" />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Receipt Number"
        validateStatus={errors.receipt_number ? 'error' : ''}
        help={errors.receipt_number?.message}
      >
        <Controller
          name="receipt_number"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="Enter receipt number (optional)" />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Category"
        validateStatus={errors.category ? 'error' : ''}
        help={errors.category?.message}
      >
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select {...field} placeholder="Select category">
              {categories.map((category) => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Record Transaction
        </Button>
      </Form.Item>
    </Form>
  );
}
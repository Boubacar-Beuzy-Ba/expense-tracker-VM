import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Form, Input, Select, InputNumber, Button, Card, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useCurrency } from '../context/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const transactionSchema = z.object({
  amount: z.number(),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  department: z.string().min(1, 'Department is required'),
  project_id: z.string().optional(),
});

type TransactionInput = z.infer<typeof transactionSchema>;

type Props = {
  onSubmit: (data: TransactionInput & { files?: File[] }) => void;
};

const categories = [
  { value: 'supplies', label: 'Supplies' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'other', label: 'Other' },
];

const departments = [
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'office', label: 'Office' },
];

export function TransactionForm({ onSubmit }: Props) {
  const { currency } = useCurrency();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
  });
  const [fileList, setFileList] = React.useState<File[]>([]);

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    },
  });

  const onSubmitForm = (data: TransactionInput) => {
    onSubmit({ ...data, files: fileList });
    reset();
    setFileList([]);
  };

  const handleFileChange = (info: any) => {
    if (info.file.status === 'done') {
      setFileList([...fileList, info.file.originFileObj]);
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  return (
    <Card 
      title="Add Transaction" 
      className="w-full"
      styles={{
        body: { padding: '24px' }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmit(onSubmitForm)}
          className="space-y-4"
        >
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
                  prefix={currency}
                  placeholder="Enter amount"
                  step="0.01"
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
            label="Category"
            validateStatus={errors.category ? 'error' : ''}
            help={errors.category?.message}
          >
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select category"
                  options={categories}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Department"
            validateStatus={errors.department ? 'error' : ''}
            help={errors.department?.message}
          >
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select department"
                  options={departments}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Project"
          >
            <Controller
              name="project_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select project (optional)"
                  allowClear
                  options={projects?.map(p => ({
                    value: p.id,
                    label: p.name
                  }))}
                />
              )}
            />
          </Form.Item>

          <Form.Item label="Attachments">
            <Upload
              multiple
              beforeUpload={(file) => {
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('File must be smaller than 2MB!');
                  return false;
                }
                return false;
              }}
              onChange={handleFileChange}
              fileList={fileList.map((file, index) => ({
                uid: `-${index}`,
                name: file.name,
                status: 'done',
                originFileObj: file,
              }))}
            >
              <Button icon={<UploadOutlined />}>Upload Files</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Add Transaction
            </Button>
          </Form.Item>
        </Form>
      </motion.div>
    </Card>
  );
}
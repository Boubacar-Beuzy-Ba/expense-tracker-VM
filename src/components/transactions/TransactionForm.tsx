import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Form, Input, Select, InputNumber, Button, Card, Upload, Radio } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useCurrency } from '../../context/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Transaction } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  department: z.string().min(1, 'Department is required'),
  project_id: z.string().optional(),
});

type TransactionInput = z.infer<typeof transactionSchema>;

type Props = {
  onSubmit: (data: TransactionInput, files: File[]) => Promise<void>;
  initialData?: Transaction;
};

export function TransactionForm({ onSubmit, initialData }: Props) {
  const { currency } = useCurrency();
  const { t } = useTranslation();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData ? {
      amount: Math.abs(initialData.amount),
      type: initialData.type,
      description: initialData.description,
      category: initialData.category,
      department: initialData.department,
      project_id: initialData.project_id,
    } : {
      type: 'expense' // Default to expense
    },
  });
  const [fileList, setFileList] = React.useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const categories = [
    { value: 'supplies', label: t('transactions.categories.supplies') },
    { value: 'equipment', label: t('transactions.categories.equipment') },
    { value: 'maintenance', label: t('transactions.categories.maintenance') },
    { value: 'utilities', label: t('transactions.categories.utilities') },
    { value: 'other', label: t('transactions.categories.other') },
  ];

  const departments = [
    { value: 'warehouse', label: t('transactions.departments.warehouse') },
    { value: 'office', label: t('transactions.departments.office') },
  ];

  const onSubmitForm = async (data: TransactionInput) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data, fileList);
      if (!initialData) {
        reset();
        setFileList([]);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (info: any) => {
    const newFileList = [...info.fileList];
    setFileList(newFileList.map(file => file.originFileObj));
  };

  return (
    <Card 
      title={initialData ? t('transactions.edit') : t('transactions.new')}
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
            label={t('transactions.type')}
            validateStatus={errors.type ? 'error' : ''}
            help={errors.type?.message}
          >
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Radio.Group {...field}>
                  <Radio.Button value="income">{t('transactions.types.income')}</Radio.Button>
                  <Radio.Button value="expense">{t('transactions.types.expense')}</Radio.Button>
                </Radio.Group>
              )}
            />
          </Form.Item>

          <Form.Item 
            label={t('transactions.amount')}
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
                  placeholder={t('transactions.amountPlaceholder')}
                  step="0.01"
                  min={0}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={t('transactions.description')}
            validateStatus={errors.description ? 'error' : ''}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  placeholder={t('transactions.descriptionPlaceholder')}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={t('transactions.category')}
            validateStatus={errors.category ? 'error' : ''}
            help={errors.category?.message}
          >
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder={t('transactions.category')}
                  options={categories}
                  showSearch
                  allowClear
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Button 
                        type="link" 
                        className="w-full mt-2"
                        onClick={() => {
                          // TODO: Implement custom category creation
                        }}
                      >
                        + Add new category
                      </Button>
                    </>
                  )}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={t('transactions.department')}
            validateStatus={errors.department ? 'error' : ''}
            help={errors.department?.message}
          >
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder={t('transactions.department')}
                  options={departments}
                  showSearch
                  allowClear
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Button 
                        type="link" 
                        className="w-full mt-2"
                        onClick={() => {
                          // TODO: Implement custom department creation
                        }}
                      >
                        + Add new department
                      </Button>
                    </>
                  )}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={t('transactions.project')}
          >
            <Controller
              name="project_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder={t('projects.select')}
                  allowClear
                  options={projects?.map(p => ({
                    value: p.id,
                    label: p.name
                  }))}
                />
              )}
            />
          </Form.Item>

          <Form.Item label={t('transactions.attachments')}>
            <Upload
              multiple
              beforeUpload={() => false}
              onChange={handleFileChange}
              fileList={fileList.map((file, index) => ({
                uid: `-${index}`,
                name: file.name,
                status: 'done',
                originFileObj: file,
              }))}
            >
              <Button icon={<UploadOutlined />}>
                {t('transactions.uploadFiles')}
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {initialData ? t('common.save') : t('common.create')}
            </Button>
          </Form.Item>
        </Form>
      </motion.div>
    </Card>
  );
}
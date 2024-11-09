import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Descriptions, Button, Progress, Table, Typography, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../context/CurrencyContext';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { t } = useTranslation();

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_budget_analysis')
        .select('*')
        .eq('project_id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ['project-transactions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (!project || !transactions) return null;

  const budgetUsagePercentage = Math.abs((project.total_spent / project.total_budget) * 100);

  const columns = [
    {
      title: t('transactions.table.date'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => format(new Date(date), 'PPP'),
    },
    {
      title: t('transactions.table.description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('transactions.table.amount', { currency }),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span className={amount < 0 ? 'text-red-500' : 'text-green-500'}>
          {currency}{Math.abs(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: t('transactions.table.category'),
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => t(`transactions.categories.${category}`),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/projects')}
        >
          {t('common.back')}
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          {project.project_name}
        </Title>
      </div>

      <Card>
        <Descriptions
          layout="horizontal"
          column={1}
          bordered
        >
          <Descriptions.Item label={t('projects.budget')}>
            {currency}{project.total_budget.toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label={t('projects.spent')}>
            <span className={project.total_spent < 0 ? 'text-red-500' : 'text-green-500'}>
              {currency}{Math.abs(project.total_spent).toFixed(2)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={t('projects.remaining')}>
            <span className={project.remaining_budget < 0 ? 'text-red-500' : 'text-green-500'}>
              {currency}{project.remaining_budget.toFixed(2)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={t('projects.budgetUsage')}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Progress
                percent={budgetUsagePercentage}
                status={project.is_over_budget ? 'exception' : 'active'}
                strokeColor={project.is_over_budget ? '#ff4d4f' : '#1890ff'}
              />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={t('transactions.summary.transactionCount')}>
            {project.transaction_count}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={t('projects.transactions')}>
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => t('common.pagination', {
              start: range[0],
              end: range[1],
              total
            }),
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
}
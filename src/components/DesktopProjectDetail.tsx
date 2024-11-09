import React from 'react';
import { Card, Descriptions, Button, Progress, Table, Typography, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ProjectBudgetAnalysis } from '../types/project';
import { Transaction } from '../lib/supabase';
import { useCurrency } from '../context/CurrencyContext';

const { Title } = Typography;

type Props = {
  project: ProjectBudgetAnalysis;
  transactions: Transaction[];
};

export function DesktopProjectDetail({ project, transactions }: Props) {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const budgetUsagePercentage = Math.abs((project.total_spent / project.total_budget) * 100);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => format(new Date(date), 'PPP'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: `Amount (${currency})`,
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span className={amount < 0 ? 'text-red-500' : 'text-green-500'}>
          {currency}{Math.abs(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/projects')}
        >
          Back
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
          <Descriptions.Item label="Total Budget">
            {currency}{project.total_budget.toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="Total Spent">
            <span className={project.total_spent < 0 ? 'text-red-500' : 'text-green-500'}>
              {currency}{Math.abs(project.total_spent).toFixed(2)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Remaining Budget">
            <span className={project.remaining_budget < 0 ? 'text-red-500' : 'text-green-500'}>
              {currency}{project.remaining_budget.toFixed(2)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Budget Usage">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Progress
                percent={budgetUsagePercentage}
                status={project.is_over_budget ? 'exception' : 'active'}
                strokeColor={project.is_over_budget ? '#ff4d4f' : '#1890ff'}
              />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Transaction Count">
            {project.transaction_count}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Project Transactions">
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
}
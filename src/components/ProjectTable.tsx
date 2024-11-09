import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useTranslation } from 'react-i18next';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

type Props = {
  projects: any[];
  loading?: boolean;
  onEdit: (project: any) => void;
  onDelete: (id: string) => void;
};

const statusColors: Record<string, string> = {
  active: 'green',
  completed: 'blue',
  cancelled: 'red'
};

export function ProjectTable({ projects = [], loading, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const { t } = useTranslation();

  const columns: ColumnsType<any> = [
    {
      title: t('projects.name'),
      dataIndex: 'project_name',
      key: 'project_name',
      render: (text: string, record: any) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/project/${record.project_id}`)}
          style={{ padding: 0, height: 'auto' }}
        >
          {text || t('projects.untitled')}
        </Button>
      ),
    },
    {
      title: t('projects.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const displayStatus = status?.toLowerCase() || 'unknown';
        return (
          <Tag color={statusColors[displayStatus] || 'default'}>
            {t(`projects.statuses.${displayStatus}`)}
          </Tag>
        );
      },
    },
    {
      title: t('projects.budget', { currency }),
      dataIndex: 'total_budget',
      key: 'total_budget',
      render: (budget: number) => {
        if (typeof budget !== 'number') return `${currency}0.00`;
        return `${currency}${budget.toFixed(2)}`;
      },
    },
    {
      title: t('projects.spent', { currency }),
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (spent: number) => {
        if (typeof spent !== 'number') return `${currency}0.00`;
        return (
          <span className={spent > 0 ? 'text-red-500' : 'text-green-500'}>
            {currency}{Math.abs(spent).toFixed(2)}
          </span>
        );
      },
    },
    {
      title: t('projects.progress'),
      key: 'progress',
      render: (_, record: any) => {
        if (!record.total_budget || typeof record.total_spent !== 'number') {
          return '0%';
        }
        const percentage = ((Math.abs(record.total_spent) / record.total_budget) * 100).toFixed(1);
        const isOverBudget = Math.abs(record.total_spent) > record.total_budget;
        return (
          <span className={isOverBudget ? 'text-red-500' : 'text-green-500'}>
            {percentage}%
          </span>
        );
      },
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={t('common.view')}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/project/${record.project_id}`)}
            />
          </Tooltip>
          <Tooltip title={t('common.edit')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <Popconfirm
              title={t('common.confirmDelete')}
              onConfirm={() => onDelete(record.project_id)}
              okText={t('common.yes')}
              cancelText={t('common.no')}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={projects?.map(project => ({ ...project, key: project.project_id })) || []}
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) => t('common.pagination', {
          start: range[0],
          end: range[1],
          total
        }),
      }}
    />
  );
}
import React from 'react';
import { Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { Project } from '../../types/project';

type Props = {
  projects: Project[];
  isMobile: boolean;
};

export function ProjectTable({ projects, isMobile }: Props) {
  const navigate = useNavigate();
  const { currency } = useCurrency();

  const columns = [
    {
      title: 'Project',
      dataIndex: 'project_name',
      key: 'project_name',
      render: (text: string, record: Project) => (
        <a onClick={() => navigate(`/project/${record.project_id}`)}>{text || '-'}</a>
      ),
    },
    {
      title: `Budget (${currency})`,
      dataIndex: 'total_budget',
      key: 'total_budget',
      render: (amount: number) => {
        if (amount === undefined || amount === null) return '-';
        return `${currency}${amount.toFixed(2)}`;
      },
    },
    {
      title: `Spent (${currency})`,
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (amount: number) => {
        if (amount === undefined || amount === null) return '-';
        return (
          <span className={amount < 0 ? 'text-red-500' : 'text-green-500'}>
            {currency}{Math.abs(amount).toFixed(2)}
          </span>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={projects}
      rowKey="project_id"
      pagination={false}
      size={isMobile ? 'small' : 'middle'}
    />
  );
}
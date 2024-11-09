import React from 'react';
import { Table, Button, Space, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PettyCashTransaction } from '../../types/petty-cash';
import { useCurrency } from '../../context/CurrencyContext';
import { format } from 'date-fns';

type Props = {
  transactions: PettyCashTransaction[];
  loading: boolean;
  onView: (transaction: PettyCashTransaction) => void;
  onEdit: (transaction: PettyCashTransaction) => void;
  onDelete: (id: string) => void;
};

export function TransactionTable({ transactions, loading, onView, onEdit, onDelete }: Props) {
  const { currency } = useCurrency();

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => format(new Date(date), 'PPP'),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <span className="capitalize">{type}</span>
      ),
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
      render: (category: string) => (
        <span className="capitalize">{category}</span>
      ),
    },
    {
      title: 'Receipt #',
      dataIndex: 'receipt_number',
      key: 'receipt_number',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PettyCashTransaction) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={transactions}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      }}
    />
  );
}
import React from 'react';
import { Table, Tag, Button, Space, Tooltip } from 'antd';
import { format } from 'date-fns';
import { PettyCashReconciliation } from '../../types/petty-cash';
import { useCurrency } from '../../context/CurrencyContext';
import { FiEye, FiCheck, FiX } from 'react-icons/fi';

type Props = {
  reconciliations: PettyCashReconciliation[];
  loading?: boolean;
  onView?: (reconciliation: PettyCashReconciliation) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
};

export function ReconciliationTable({ 
  reconciliations, 
  loading, 
  onView,
  onApprove,
  onReject 
}: Props) {
  const { currency } = useCurrency();

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => format(new Date(date), 'PPP'),
      sorter: (a: PettyCashReconciliation, b: PettyCashReconciliation) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Physical Count',
      dataIndex: 'physical_count',
      key: 'physical_count',
      render: (amount: number) => `${currency}${amount.toFixed(2)}`,
    },
    {
      title: 'System Balance',
      dataIndex: 'system_balance',
      key: 'system_balance',
      render: (amount: number) => `${currency}${amount.toFixed(2)}`,
    },
    {
      title: 'Difference',
      dataIndex: 'difference',
      key: 'difference',
      render: (amount: number) => (
        <span className={amount < 0 ? 'text-red-500' : 'text-green-500'}>
          {currency}{Math.abs(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          pending: 'gold',
          approved: 'green',
          rejected: 'red',
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {status.toUpperCase()}
          </Tag>
        );
      },
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value: string, record: PettyCashReconciliation) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PettyCashReconciliation) => (
        <Space>
          {onView && (
            <Tooltip title="View details">
              <Button
                type="text"
                icon={<FiEye />}
                onClick={() => onView(record)}
              />
            </Tooltip>
          )}
          {record.status === 'pending' && onApprove && (
            <Tooltip title="Approve reconciliation">
              <Button
                type="text"
                icon={<FiCheck />}
                className="text-green-600"
                onClick={() => onApprove(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'pending' && onReject && (
            <Tooltip title="Reject reconciliation">
              <Button
                type="text"
                danger
                icon={<FiX />}
                onClick={() => onReject(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={reconciliations}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
      }}
      scroll={{ x: 'max-content' }}
    />
  );
}
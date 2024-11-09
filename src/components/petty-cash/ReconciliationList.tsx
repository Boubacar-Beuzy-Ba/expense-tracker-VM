import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Modal, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { pettyCashApi } from '../../lib/supabase-v2';
import { ReconciliationForm } from './ReconciliationForm';
import { useCurrency } from '../../context/CurrencyContext';
import { PettyCashReconciliation } from '../../types/petty-cash';

type Props = {
  fundId: string;
};

export function ReconciliationList({ fundId }: Props) {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const queryClient = useQueryClient();
  const { currency } = useCurrency();

  const { data: reconciliations, isLoading } = useQuery({
    queryKey: ['petty-cash-reconciliations', fundId],
    queryFn: () => pettyCashApi.getReconciliations(fundId),
  });

  const createReconciliation = useMutation({
    mutationFn: pettyCashApi.createReconciliation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash-reconciliations', fundId] });
      message.success('Reconciliation recorded successfully');
      setIsModalVisible(false);
    },
    onError: (error) => {
      message.error('Failed to record reconciliation');
      console.error('Create reconciliation error:', error);
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      pettyCashApi.updateReconciliationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash-reconciliations', fundId] });
      message.success('Status updated successfully');
    },
    onError: (error) => {
      message.error('Failed to update status');
      console.error('Update status error:', error);
    },
  });

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
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
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PettyCashReconciliation) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => updateStatus.mutate({ id: record.id, status: 'approved' })}
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                onClick={() => updateStatus.mutate({ id: record.id, status: 'rejected' })}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          New Reconciliation
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={reconciliations}
        rowKey="id"
        loading={isLoading}
      />

      <Modal
        title="New Reconciliation"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <ReconciliationForm
          fundId={fundId}
          onSubmit={(data) => createReconciliation.mutate({ ...data, fund_id: fundId })}
        />
      </Modal>
    </>
  );
}
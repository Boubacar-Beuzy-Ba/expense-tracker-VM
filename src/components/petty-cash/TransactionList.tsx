import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Modal, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { pettyCashApi } from '../../lib/supabase-v2';
import { TransactionForm } from './TransactionForm';
import { useCurrency } from '../../context/CurrencyContext';
import { PettyCashTransaction } from '../../types/petty-cash';
import { useAuth } from '../../context/AuthContext';

type Props = {
  fundId: string;
};

export function TransactionList({ fundId }: Props) {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();
  const { currency } = useCurrency();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['petty-cash-transactions', fundId],
    queryFn: () => pettyCashApi.getTransactions(fundId),
  });

  const createTransaction = useMutation({
    mutationFn: async (values: any) => {
      const transaction = {
        ...values,
        user_id: user?.id
      };
      return pettyCashApi.createTransaction(transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash-transactions', fundId] });
      queryClient.invalidateQueries({ queryKey: ['petty-cash-fund', fundId] });
      message.success('Transaction recorded successfully');
      setIsModalVisible(false);
    },
    onError: (error) => {
      message.error('Failed to record transaction');
      console.error('Create transaction error:', error);
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
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => type.toUpperCase(),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: PettyCashTransaction) => (
        <span className={record.type === 'expense' ? 'text-red-500' : 'text-green-500'}>
          {currency}{Math.abs(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Receipt #',
      dataIndex: 'receipt_number',
      key: 'receipt_number',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
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
          Record Transaction
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={transactions}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} items`,
        }}
      />

      <Modal
        title="Record Transaction"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <TransactionForm
          fundId={fundId}
          onSubmit={(data) => createTransaction.mutate(data)}
          isSubmitting={createTransaction.isPending}
        />
      </Modal>
    </>
  );
}
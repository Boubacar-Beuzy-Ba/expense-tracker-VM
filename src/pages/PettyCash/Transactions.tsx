import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { pettyCashApi } from '../../lib/supabase-v2';
import { TransactionTable } from '../../components/petty-cash/TransactionTable';
import { TransactionModal } from '../../components/petty-cash/TransactionModal';
import { TransactionFormModal } from '../../components/petty-cash/TransactionFormModal';
import { TransactionFilters } from '../../components/petty-cash/TransactionFilters';
import { TransactionStats } from '../../components/petty-cash/TransactionStats';
import { PettyCashTransaction } from '../../types/petty-cash';
import { useAuth } from '../../context/AuthContext';

export function PettyCashTransactions() {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [selectedTransaction, setSelectedTransaction] = useState<PettyCashTransaction | null>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<PettyCashTransaction | null>(null);
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['petty-cash-transactions'],
    queryFn: () => pettyCashApi.getTransactions(),
  });

  const createTransaction = useMutation({
    mutationFn: async (data: any) => {
      const transaction = {
        ...data,
        user_id: user?.id,
      };
      return pettyCashApi.createTransaction(transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash-transactions'] });
      message.success('Transaction created successfully');
      setIsFormModalVisible(false);
    },
    onError: (error) => {
      message.error('Failed to create transaction');
      console.error('Create transaction error:', error);
    },
  });

  const updateTransaction = useMutation({
    mutationFn: pettyCashApi.updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash-transactions'] });
      message.success('Transaction updated successfully');
      setIsFormModalVisible(false);
      setEditingTransaction(null);
    },
    onError: (error) => {
      message.error('Failed to update transaction');
      console.error('Update transaction error:', error);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: pettyCashApi.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash-transactions'] });
      message.success('Transaction deleted successfully');
    },
    onError: (error) => {
      message.error('Failed to delete transaction');
      console.error('Delete transaction error:', error);
    },
  });

  const handleSubmit = (data: any) => {
    if (editingTransaction) {
      updateTransaction.mutate({
        ...data,
        id: editingTransaction.id,
      });
    } else {
      createTransaction.mutate(data);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {transactions && <TransactionStats transactions={transactions} />}

      <TransactionFilters
        onFilter={() => {}}
        onReset={() => {}}
      />

      <Card
        title="Petty Cash Transactions"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTransaction(null);
              setIsFormModalVisible(true);
            }}
          >
            New Transaction
          </Button>
        }
      >
        <TransactionTable
          transactions={transactions || []}
          loading={isLoading}
          onView={(transaction) => {
            setSelectedTransaction(transaction);
            setIsViewModalVisible(true);
          }}
          onEdit={(transaction) => {
            setEditingTransaction(transaction);
            setIsFormModalVisible(true);
          }}
          onDelete={(id) => deleteTransaction.mutate(id)}
        />
      </Card>

      <TransactionModal
        transaction={selectedTransaction}
        visible={isViewModalVisible}
        onClose={() => {
          setSelectedTransaction(null);
          setIsViewModalVisible(false);
        }}
      />

      <TransactionFormModal
        fundId="default"
        visible={isFormModalVisible}
        onClose={() => {
          setIsFormModalVisible(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingTransaction}
        isSubmitting={createTransaction.isPending || updateTransaction.isPending}
      />
    </div>
  );
}
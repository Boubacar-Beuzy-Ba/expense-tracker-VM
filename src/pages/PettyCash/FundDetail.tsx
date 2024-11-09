import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Tabs, Space, Modal, App } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { pettyCashApi } from '../../lib/supabase-v2';
import { TransactionTable } from '../../components/petty-cash/TransactionTable';
import { ReconciliationTable } from '../../components/petty-cash/ReconciliationTable';
import { FundSummaryCard } from '../../components/petty-cash/FundSummaryCard';
import { TransactionFormModal } from '../../components/petty-cash/TransactionFormModal';
import { TransactionModal } from '../../components/petty-cash/TransactionModal';
import { ReconciliationModal } from '../../components/petty-cash/ReconciliationModal';
import { useAuth } from '../../context/AuthContext';

export function FundDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedReconciliation, setSelectedReconciliation] = useState(null);
  const [isTransactionFormVisible, setIsTransactionFormVisible] = useState(false);
  const [isTransactionViewVisible, setIsTransactionViewVisible] = useState(false);
  const [isReconciliationViewVisible, setIsReconciliationViewVisible] = useState(false);

  const { data: fund } = useQuery({
    queryKey: ['petty-cash-fund', id],
    queryFn: () => pettyCashApi.getFund(id!),
    enabled: !!id,
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['petty-cash-transactions', id],
    queryFn: () => pettyCashApi.getTransactions(id),
    enabled: !!id,
  });

  const { data: reconciliations, isLoading: isLoadingReconciliations } = useQuery({
    queryKey: ['petty-cash-reconciliations', id],
    queryFn: () => pettyCashApi.getReconciliations(id),
    enabled: !!id,
  });

  const createTransaction = useMutation({
    mutationFn: async (data: any) => {
      const transaction = {
        ...data,
        fund_id: id,
        user_id: user?.id,
      };
      return pettyCashApi.createTransaction(transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash-transactions', id] });
      queryClient.invalidateQueries({ queryKey: ['petty-cash-fund', id] });
      message.success('Transaction recorded successfully');
      setIsTransactionFormVisible(false);
    },
    onError: (error) => {
      message.error('Failed to record transaction');
      console.error('Create transaction error:', error);
    },
  });

  const updateReconciliationStatus = useMutation({
    mutationFn: ({ reconciliationId, status }: { reconciliationId: string; status: 'approved' | 'rejected' }) =>
      pettyCashApi.updateReconciliationStatus(reconciliationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash-reconciliations', id] });
      message.success('Reconciliation status updated successfully');
    },
    onError: (error) => {
      message.error('Failed to update reconciliation status');
      console.error('Update reconciliation status error:', error);
    },
  });

  if (!fund) return null;

  return (
    <div className="p-6 space-y-6">
      <Space className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/petty-cash/funds')}
        >
          Back to Funds
        </Button>
      </Space>

      <FundSummaryCard fund={fund} />

      <Card>
        <Tabs
          items={[
            {
              key: 'transactions',
              label: 'Transactions',
              children: (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setIsTransactionFormVisible(true)}
                    >
                      New Transaction
                    </Button>
                  </div>
                  <TransactionTable
                    transactions={transactions || []}
                    loading={isLoadingTransactions}
                    onView={(transaction) => {
                      setSelectedTransaction(transaction);
                      setIsTransactionViewVisible(true);
                    }}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              ),
            },
            {
              key: 'reconciliations',
              label: 'Reconciliations',
              children: (
                <ReconciliationTable
                  reconciliations={reconciliations || []}
                  loading={isLoadingReconciliations}
                  onView={(reconciliation) => {
                    setSelectedReconciliation(reconciliation);
                    setIsReconciliationViewVisible(true);
                  }}
                  onApprove={(reconciliationId) => 
                    updateReconciliationStatus.mutate({ reconciliationId, status: 'approved' })
                  }
                  onReject={(reconciliationId) => 
                    updateReconciliationStatus.mutate({ reconciliationId, status: 'rejected' })
                  }
                />
              ),
            },
          ]}
        />
      </Card>

      <TransactionFormModal
        fundId={id!}
        visible={isTransactionFormVisible}
        onClose={() => setIsTransactionFormVisible(false)}
        onSubmit={(data) => createTransaction.mutate(data)}
        isSubmitting={createTransaction.isPending}
      />

      <TransactionModal
        transaction={selectedTransaction}
        visible={isTransactionViewVisible}
        onClose={() => {
          setSelectedTransaction(null);
          setIsTransactionViewVisible(false);
        }}
      />

      <ReconciliationModal
        reconciliation={selectedReconciliation}
        visible={isReconciliationViewVisible}
        onClose={() => {
          setSelectedReconciliation(null);
          setIsReconciliationViewVisible(false);
        }}
      />
    </div>
  );
}
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Row, Col, Card, Modal } from 'antd';
import { supabase } from '../lib/supabase';
import { TransactionList, TransactionForm, ImportExport } from '../components/transactions';
import { useAuth } from '../context/AuthContext';
import { useMediaQuery } from 'react-responsive';
import toast from 'react-hot-toast';
import { Transaction } from '../lib/supabase';

export default function Transactions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          files:transaction_files(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addTransaction = useMutation({
    mutationFn: async ({ transaction, files }: { transaction: any; files: File[] }) => {
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user?.id }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      if (files?.length) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user?.id}/${transactionData.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('transaction-files')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { error: fileRecordError } = await supabase
            .from('transaction_files')
            .insert([{
              transaction_id: transactionData.id,
              file_name: file.name,
              file_path: filePath,
              content_type: file.type
            }]);

          if (fileRecordError) throw fileRecordError;
        }
      }

      return transactionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add transaction');
      console.error(error);
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, data, files }: { id: string; data: any; files: File[] }) => {
      // Update transaction
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          amount: data.amount,
          description: data.description,
          category: data.category,
          department: data.department,
          project_id: data.project_id,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Handle file uploads
      if (files?.length) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user?.id}/${id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('transaction-files')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { error: fileRecordError } = await supabase
            .from('transaction_files')
            .insert([{
              transaction_id: id,
              file_name: file.name,
              file_path: filePath,
              content_type: file.type
            }]);

          if (fileRecordError) throw fileRecordError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction updated successfully');
      setEditingTransaction(null);
    },
    onError: (error) => {
      toast.error('Failed to update transaction');
      console.error(error);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      // First, get the transaction files
      const { data: files } = await supabase
        .from('transaction_files')
        .select('file_path')
        .eq('transaction_id', id);

      // Delete files from storage
      if (files?.length) {
        for (const file of files) {
          await supabase.storage
            .from('transaction-files')
            .remove([file.file_path]);
        }
      }

      // Delete the transaction (this will cascade delete the file records)
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete transaction');
      console.error(error);
    },
  });

  const importTransactions = useMutation({
    mutationFn: async (newTransactions) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransactions.map((t: any) => ({ ...t, user_id: user?.id })))
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transactions imported successfully');
    },
    onError: (error) => {
      toast.error('Failed to import transactions');
      console.error(error);
    },
  });

  return (
    <div className="space-y-6 p-6">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={isMobile ? 24 : 16} order={isMobile ? 2 : 1}>
          <Card title="Transactions" extra={
            <ImportExport
              transactions={transactions || []}
              onImport={(data) => importTransactions.mutate(data)}
            />
          }>
            {transactions && (
              <TransactionList
                transactions={transactions}
                onDelete={(id) => deleteTransaction.mutate(id)}
                onEdit={setEditingTransaction}
              />
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={isMobile ? 24 : 8} order={isMobile ? 1 : 2}>
          <TransactionForm 
            onSubmit={async (data, files) => {
              await addTransaction.mutateAsync({ transaction: data, files });
            }}
          />
        </Col>
      </Row>

      <Modal
        title="Edit Transaction"
        open={!!editingTransaction}
        onCancel={() => setEditingTransaction(null)}
        footer={null}
      >
        {editingTransaction && (
          <TransactionForm
            initialData={editingTransaction}
            onSubmit={async (data, files) => {
              await updateTransaction.mutateAsync({
                id: editingTransaction.id,
                data,
                files
              });
            }}
          />
        )}
      </Modal>
    </div>
  );
}
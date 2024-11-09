import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Modal, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { pettyCashApi } from '../../lib/supabase-v2';
import { ReconciliationTable } from '../../components/petty-cash/ReconciliationTable';
import { ReconciliationModal } from '../../components/petty-cash/ReconciliationModal';
import { ReconciliationForm } from '../../components/petty-cash/ReconciliationForm';
import { ReconciliationStats } from '../../components/petty-cash/ReconciliationStats';
import { PettyCashReconciliation } from '../../types/petty-cash';
import { useAuth } from '../../context/AuthContext';

export function PettyCashReconciliations() {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [selectedReconciliation, setSelectedReconciliation] = useState<PettyCashReconciliation | null>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const { data: reconciliations, isLoading } = useQuery({
    queryKey: ['petty-cash-reconciliations'],
    queryFn: () => pettyCashApi.getReconciliations(),
  });

  const { data: funds } = useQuery({
    queryKey: ['petty-cash-funds'],
    queryFn: pettyCashApi.getFunds,
  });

  const createReconciliation = useMutation({
    mutationFn: async (data: any) => {
      const reconciliation = {
        ...data,
        reconciled_by: user?.id,
        status: 'pending',
      };
      return pettyCashApi.createReconciliation(reconciliation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash-reconciliations'] });
      message.success('Reconciliation created successfully');
      setIsFormModalVisible(false);
    },
    onError: (error) => {
      message.error('Failed to create reconciliation');
      console.error('Create reconciliation error:', error);
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      pettyCashApi.updateReconciliationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash-reconciliations'] });
      message.success('Status updated successfully');
    },
    onError: (error) => {
      message.error('Failed to update status');
      console.error('Update status error:', error);
    },
  });

  return (
    <div className="p-6 space-y-6">
      {reconciliations && <ReconciliationStats reconciliations={reconciliations} />}

      <Card
        title="Reconciliations"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsFormModalVisible(true)}
          >
            New Reconciliation
          </Button>
        }
      >
        <ReconciliationTable
          reconciliations={reconciliations || []}
          loading={isLoading}
          onView={(reconciliation) => {
            setSelectedReconciliation(reconciliation);
            setIsViewModalVisible(true);
          }}
          onApprove={(id) => updateStatus.mutate({ id, status: 'approved' })}
          onReject={(id) => updateStatus.mutate({ id, status: 'rejected' })}
        />
      </Card>

      <ReconciliationModal
        reconciliation={selectedReconciliation}
        visible={isViewModalVisible}
        onClose={() => {
          setSelectedReconciliation(null);
          setIsViewModalVisible(false);
        }}
      />

      <Modal
        title="New Reconciliation"
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={null}
      >
        <ReconciliationForm
          funds={funds || []}
          onSubmit={(data) => createReconciliation.mutate(data)}
          isSubmitting={createReconciliation.isPending}
        />
      </Modal>
    </div>
  );
}
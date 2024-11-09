import React from 'react';
import { Modal } from 'antd';
import { TransactionForm } from './TransactionForm';
import { PettyCashTransaction } from '../../types/petty-cash';

type Props = {
  fundId: string;
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialData?: PettyCashTransaction | null;
  isSubmitting?: boolean;
};

export function TransactionFormModal({ 
  fundId, 
  visible, 
  onClose, 
  onSubmit, 
  initialData, 
  isSubmitting 
}: Props) {
  return (
    <Modal
      title={initialData ? 'Edit Transaction' : 'New Transaction'}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <TransactionForm
        fundId={fundId}
        onSubmit={onSubmit}
        initialData={initialData}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
}
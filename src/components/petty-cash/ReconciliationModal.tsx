import React from 'react';
import { Modal, Descriptions, Tag } from 'antd';
import { format } from 'date-fns';
import { PettyCashReconciliation } from '../../types/petty-cash';
import { useCurrency } from '../../context/CurrencyContext';

type Props = {
  reconciliation: PettyCashReconciliation | null;
  visible: boolean;
  onClose: () => void;
};

export function ReconciliationModal({ reconciliation, visible, onClose }: Props) {
  const { currency } = useCurrency();

  if (!reconciliation) return null;

  const statusColors = {
    pending: 'gold',
    approved: 'green',
    rejected: 'red',
  };

  return (
    <Modal
      title="Reconciliation Details"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Date">
          {format(new Date(reconciliation.created_at), 'PPP')}
        </Descriptions.Item>
        <Descriptions.Item label="Physical Count">
          {currency}{reconciliation.physical_count.toFixed(2)}
        </Descriptions.Item>
        <Descriptions.Item label="System Balance">
          {currency}{reconciliation.system_balance.toFixed(2)}
        </Descriptions.Item>
        <Descriptions.Item label="Difference">
          <span className={reconciliation.difference < 0 ? 'text-red-500' : 'text-green-500'}>
            {currency}{Math.abs(reconciliation.difference).toFixed(2)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={statusColors[reconciliation.status as keyof typeof statusColors]}>
            {reconciliation.status.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        {reconciliation.notes && (
          <Descriptions.Item label="Notes">
            {reconciliation.notes}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
}
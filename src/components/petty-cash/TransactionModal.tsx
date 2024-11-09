import React from 'react';
import { Modal, Descriptions, Tag } from 'antd';
import { PettyCashTransaction } from '../../types/petty-cash';
import { useCurrency } from '../../context/CurrencyContext';
import { format } from 'date-fns';

type Props = {
  transaction: PettyCashTransaction | null;
  visible: boolean;
  onClose: () => void;
};

export function TransactionModal({ transaction, visible, onClose }: Props) {
  const { currency } = useCurrency();

  if (!transaction) return null;

  return (
    <Modal
      title="Transaction Details"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Date">
          {format(new Date(transaction.created_at), 'PPP')}
        </Descriptions.Item>
        <Descriptions.Item label="Type">
          <Tag color={transaction.type === 'expense' ? 'red' : 'green'}>
            {transaction.type.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Description">
          {transaction.description}
        </Descriptions.Item>
        <Descriptions.Item label="Amount">
          <span className={transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}>
            {currency}{Math.abs(transaction.amount).toFixed(2)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Category">
          {transaction.category}
        </Descriptions.Item>
        {transaction.receipt_number && (
          <Descriptions.Item label="Receipt Number">
            {transaction.receipt_number}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
}
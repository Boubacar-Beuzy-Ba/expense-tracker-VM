import React from 'react';
import { Card, Tag, Descriptions, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FundSummary } from '../../types/petty-cash';
import { useCurrency } from '../../context/CurrencyContext';

type Props = {
  fund: FundSummary;
};

export function FundCard({ fund }: Props) {
  const navigate = useNavigate();
  const { currency } = useCurrency();

  return (
    <Card
      title={fund.name}
      extra={
        <Tag color={fund.status === 'active' ? 'green' : 'red'}>
          {fund.status.toUpperCase()}
        </Tag>
      }
      actions={[
        <Button 
          type="link" 
          onClick={() => navigate(`/petty-cash/funds/${fund.id}`)}
        >
          View Details
        </Button>
      ]}
    >
      <Descriptions column={1}>
        <Descriptions.Item label="Current Balance">
          <span className={fund.current_balance < 0 ? 'text-red-500' : 'text-green-500'}>
            {currency}{fund.current_balance.toFixed(2)}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Initial Balance">
          {currency}{fund.initial_balance.toFixed(2)}
        </Descriptions.Item>
        <Descriptions.Item label="Custodian">
          {fund.custodian_email}
        </Descriptions.Item>
        <Descriptions.Item label="Department">
          {fund.department}
        </Descriptions.Item>
        <Descriptions.Item label="Transactions">
          {fund.transaction_count}
        </Descriptions.Item>
        <Descriptions.Item label="Reconciliations">
          {fund.reconciliation_count}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
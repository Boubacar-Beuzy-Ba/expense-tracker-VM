import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { PettyCashTransaction } from '../../types/petty-cash';
import { useCurrency } from '../../context/CurrencyContext';

type Props = {
  transactions: PettyCashTransaction[];
};

export function TransactionStats({ transactions }: Props) {
  const { currency } = useCurrency();

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalReplenishments = transactions
    .filter(t => t.type === 'replenishment')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalReplenishments - totalExpenses;

  return (
    <Row gutter={16}>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Current Balance"
            value={balance}
            precision={2}
            prefix={currency}
            valueStyle={{ color: balance >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Total Expenses"
            value={totalExpenses}
            precision={2}
            prefix={currency}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Total Replenishments"
            value={totalReplenishments}
            precision={2}
            prefix={currency}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
    </Row>
  );
}
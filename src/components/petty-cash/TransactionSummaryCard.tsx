import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { PettyCashTransaction } from '../../types/petty-cash';
import { useCurrency } from '../../context/CurrencyContext';

type Props = {
  transactions: PettyCashTransaction[];
};

export function TransactionSummaryCard({ transactions }: Props) {
  const { currency } = useCurrency();

  const expenses = transactions.filter(t => t.type === 'expense');
  const replenishments = transactions.filter(t => t.type === 'replenishment');

  const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalReplenishments = replenishments.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalReplenishments - totalExpenses;

  return (
    <Card title="Transaction Summary">
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="Current Balance"
            value={balance}
            precision={2}
            prefix={currency}
            valueStyle={{ color: balance >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Total Expenses"
            value={totalExpenses}
            precision={2}
            prefix={currency}
            valueStyle={{ color: '#cf1322' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Total Replenishments"
            value={totalReplenishments}
            precision={2}
            prefix={currency}
            valueStyle={{ color: '#3f8600' }}
          />
        </Col>
      </Row>
    </Card>
  );
import React from 'react';
import { Transaction } from '../lib/supabase';
import { Card, Row, Col, Statistic } from 'antd';
import { useCurrency } from '../context/CurrencyContext';
import { useMediaQuery } from 'react-responsive';

type Props = {
  transactions: Transaction[];
};

export function TransactionSummary({ transactions }: Props) {
  const { currency } = useCurrency();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card styles={{ body: { padding: '24px' } }}>
          <Statistic
            title="Total Balance"
            value={Math.abs(total)}
            precision={2}
            prefix={currency}
            valueStyle={{ color: total >= 0 ? '#3f8600' : '#cf1322', fontSize: isMobile ? '24px' : '32px' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card styles={{ body: { padding: '24px' } }}>
          <Statistic
            title="Total Expenses"
            value={Math.abs(totalExpenses)}
            precision={2}
            prefix={currency}
            valueStyle={{ color: '#cf1322', fontSize: isMobile ? '24px' : '32px' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card styles={{ body: { padding: '24px' } }}>
          <Statistic
            title="Number of Transactions"
            value={transactions.length}
            valueStyle={{ color: '#1677ff', fontSize: isMobile ? '24px' : '32px' }}
          />
        </Card>
      </Col>
    </Row>
  );
}
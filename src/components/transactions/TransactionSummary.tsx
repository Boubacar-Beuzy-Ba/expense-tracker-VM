import React from 'react';
import { Transaction } from '../../lib/supabase';
import { Card, Row, Col, Statistic } from 'antd';
import { useCurrency } from '../../context/CurrencyContext';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';

type Props = {
  transactions: Transaction[];
};

export function TransactionSummary({ transactions }: Props) {
  const { currency } = useCurrency();
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Calculate income (transactions with type 'income')
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate expenses (transactions with type 'expense')
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Total balance is income minus expenses
  const balance = income - expenses;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card styles={{ body: { padding: '24px' } }}>
          <Statistic
            title={t('transactions.summary.totalBalance')}
            value={balance}
            precision={2}
            prefix={currency}
            valueStyle={{ 
              color: balance >= 0 ? '#3f8600' : '#cf1322', 
              fontSize: isMobile ? '24px' : '32px' 
            }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card styles={{ body: { padding: '24px' } }}>
          <Statistic
            title={t('transactions.summary.totalIncome')}
            value={income}
            precision={2}
            prefix={currency}
            valueStyle={{ 
              color: '#3f8600', 
              fontSize: isMobile ? '24px' : '32px' 
            }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card styles={{ body: { padding: '24px' } }}>
          <Statistic
            title={t('transactions.summary.totalExpenses')}
            value={expenses}
            precision={2}
            prefix={currency}
            valueStyle={{ 
              color: '#cf1322', 
              fontSize: isMobile ? '24px' : '32px' 
            }}
          />
        </Card>
      </Col>
    </Row>
  );
}
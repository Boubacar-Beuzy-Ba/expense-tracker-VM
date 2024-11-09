import React from 'react';
import { Card, Statistic, Row, Col, Tag } from 'antd';
import { FundSummary } from '../../types/petty-cash';
import { useCurrency } from '../../context/CurrencyContext';

type Props = {
  fund: FundSummary;
};

export function FundSummaryCard({ fund }: Props) {
  const { currency } = useCurrency();

  return (
    <Card
      title={fund.name}
      extra={
        <Tag color={fund.status === 'active' ? 'green' : 'red'}>
          {fund.status.toUpperCase()}
        </Tag>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Statistic
            title="Current Balance"
            value={fund.current_balance}
            precision={2}
            prefix={currency}
            valueStyle={{ color: fund.current_balance >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Initial Balance"
            value={fund.initial_balance}
            precision={2}
            prefix={currency}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Transactions"
            value={fund.transaction_count}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Reconciliations"
            value={fund.reconciliation_count}
          />
        </Col>
      </Row>
    </Card>
  );
}
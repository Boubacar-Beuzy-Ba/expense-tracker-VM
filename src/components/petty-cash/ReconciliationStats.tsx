import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { PettyCashReconciliation } from '../../types/petty-cash';
import { useCurrency } from '../../context/CurrencyContext';

type Props = {
  reconciliations: PettyCashReconciliation[];
};

export function ReconciliationStats({ reconciliations }: Props) {
  const { currency } = useCurrency();

  const totalDifference = reconciliations.reduce((sum, r) => sum + r.difference, 0);
  const pendingCount = reconciliations.filter(r => r.status === 'pending').length;
  const approvedCount = reconciliations.filter(r => r.status === 'approved').length;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Total Difference"
            value={totalDifference}
            precision={2}
            prefix={currency}
            valueStyle={{ color: totalDifference >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Pending Reconciliations"
            value={pendingCount}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Approved Reconciliations"
            value={approvedCount}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
    </Row>
  );
}
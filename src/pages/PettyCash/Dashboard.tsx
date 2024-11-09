import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { pettyCashApi } from '../../lib/supabase-v2';
import { FundGrid } from '../../components/petty-cash/FundGrid';
import { useCurrency } from '../../context/CurrencyContext';
import { PlusOutlined } from '@ant-design/icons';

export function PettyCashDashboard() {
  const { currency } = useCurrency();
  const navigate = useNavigate();

  const { data: funds = [] } = useQuery({
    queryKey: ['petty-cash-funds'],
    queryFn: pettyCashApi.getFunds,
  });

  const totalBalance = funds.reduce((sum, fund) => sum + fund.current_balance, 0);
  const activeFunds = funds.filter(fund => fund.status === 'active').length;
  const totalTransactions = funds.reduce((sum, fund) => sum + fund.transaction_count, 0);

  return (
    <div className="p-6 space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Balance"
              value={totalBalance}
              precision={2}
              prefix={currency}
              valueStyle={{ color: totalBalance >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Active Funds"
              value={activeFunds}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={totalTransactions}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Petty Cash Funds"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/petty-cash/funds')}
          >
            Create Fund
          </Button>
        }
      >
        <FundGrid funds={funds} />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            title="Quick Actions"
            className="h-full"
          >
            <div className="space-y-4">
              <Button 
                type="primary" 
                block
                onClick={() => navigate('/petty-cash/transactions')}
              >
                Record Transaction
              </Button>
              <Button 
                block
                onClick={() => navigate('/petty-cash/reconciliations')}
              >
                Perform Reconciliation
              </Button>
              <Button 
                block
                onClick={() => navigate('/petty-cash/funds')}
              >
                Manage Funds
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="System Status"
            className="h-full"
          >
            <div className="space-y-4">
              <Statistic
                title="Pending Reconciliations"
                value={funds.reduce((sum, fund) => sum + (
                  fund.reconciliation_count || 0
                ), 0)}
                valueStyle={{ color: '#faad14' }}
              />
              <Statistic
                title="Last Reconciliation"
                value="2 days ago"
                valueStyle={{ color: '#1890ff' }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
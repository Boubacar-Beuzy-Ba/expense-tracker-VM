import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card } from 'antd';
import { supabase } from '../lib/supabase';
import { TransactionSummary } from '../components/transactions';
import { useMediaQuery } from 'react-responsive';
import { TransactionTable } from '../components/dashboard/TransactionTable';
import { ProjectTable } from '../components/dashboard/ProjectTable';
import { Transaction } from '../types/transaction';
import { Project } from '../types/project';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { t } = useTranslation();

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['project_budget_analysis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_budget_analysis')
        .select('*')
        .order('total_spent', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
  });

  const highValueTransactions = transactions
    .filter(t => t.amount && Math.abs(t.amount) > 1000)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 p-6">
      <TransactionSummary transactions={transactions} />
      
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={12}>
          <Card title={t('dashboard.highValueTransactions')} className="h-full">
            <TransactionTable 
              transactions={highValueTransactions}
              isMobile={isMobile}
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title={t('dashboard.recentTransactions')} className="h-full">
            <TransactionTable 
              transactions={recentTransactions}
              isMobile={isMobile}
            />
          </Card>
        </Col>
        <Col xs={24}>
          <Card title={t('dashboard.topProjects')} className="h-full">
            <ProjectTable 
              projects={projects}
              isMobile={isMobile}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
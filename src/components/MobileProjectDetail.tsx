import React from 'react';
import { NavBar, Card, List } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ProjectBudgetAnalysis } from '../types/project';
import { Transaction } from '../lib/supabase';
import { useCurrency } from '../context/CurrencyContext';

type Props = {
  project: ProjectBudgetAnalysis;
  transactions: Transaction[];
};

export function MobileProjectDetail({ project, transactions }: Props) {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const budgetUsagePercentage = Math.abs((project.total_spent / project.total_budget) * 100);

  return (
    <div className="pb-4">
      <NavBar onBack={() => navigate('/projects')}>
        {project.project_name}
      </NavBar>

      <div className="p-4 space-y-4">
        <Card>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Total Budget</div>
              <div className="text-lg font-semibold">
                {currency}{project.total_budget.toFixed(2)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Total Spent</div>
              <div className={`text-lg font-semibold ${project.total_spent < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {currency}{Math.abs(project.total_spent).toFixed(2)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Remaining Budget</div>
              <div className={`text-lg font-semibold ${project.remaining_budget < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {currency}{project.remaining_budget.toFixed(2)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-2">Budget Usage</div>
              <div 
                className="h-2 rounded-full bg-gray-200 overflow-hidden"
                style={{ width: '100%' }}
              >
                <div
                  className={`h-full rounded-full ${project.is_over_budget ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(budgetUsagePercentage, 100)}%` }}
                />
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {budgetUsagePercentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>

        <Card title="Transactions">
          <List>
            {transactions.map((transaction) => (
              <List.Item
                key={transaction.id}
                description={format(new Date(transaction.created_at), 'PPP')}
                extra={
                  <span className={transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}>
                    {currency}{Math.abs(transaction.amount).toFixed(2)}
                  </span>
                }
              >
                {transaction.description}
              </List.Item>
            ))}
          </List>
        </Card>
      </div>
    </div>
  );
}
import React from 'react';
import { Line } from '@ant-design/plots';
import { useCurrency } from '../../context/CurrencyContext';
import { Transaction } from '../../lib/supabase';
import { format } from 'date-fns';

type Props = {
  transactions: Transaction[];
};

type MonthlyData = {
  month: string;
  amount: number;
};

export function MonthlyExpenses({ transactions }: Props) {
  const { currency } = useCurrency();

  const monthlyData = transactions.reduce((acc: MonthlyData[], transaction) => {
    const month = format(new Date(transaction.created_at), 'MMM yyyy');
    const existingMonth = acc.find(item => item.month === month);
    
    if (existingMonth) {
      existingMonth.amount += Math.abs(transaction.amount);
    } else {
      acc.push({
        month,
        amount: Math.abs(transaction.amount)
      });
    }
    
    return acc;
  }, []).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  const config = {
    data: monthlyData,
    xField: 'month',
    yField: 'amount',
    point: {
      size: 5,
      shape: 'circle',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    tooltip: {
      customContent: (title: string, items: any[]) => {
        return `<div>
          <span>${title}</span>
          <br/>
          <span>Amount: ${currency}${items[0]?.data?.amount.toFixed(2) || '0.00'}</span>
        </div>`;
      }
    },
  };

  return <Line {...config} />;
}
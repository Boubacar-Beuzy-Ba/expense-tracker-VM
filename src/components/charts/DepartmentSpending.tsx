import React from 'react';
import { Column } from '@ant-design/plots';
import { useCurrency } from '../../context/CurrencyContext';
import { Transaction } from '../../lib/supabase';

type Props = {
  transactions: Transaction[];
};

type DepartmentData = {
  department: string;
  amount: number;
};

export function DepartmentSpending({ transactions }: Props) {
  const { currency } = useCurrency();

  const departmentData = transactions.reduce((acc: DepartmentData[], transaction) => {
    const existingDept = acc.find(item => item.department === transaction.department);
    
    if (existingDept) {
      existingDept.amount += Math.abs(transaction.amount);
    } else {
      acc.push({
        department: transaction.department || 'Unassigned',
        amount: Math.abs(transaction.amount)
      });
    }
    
    return acc;
  }, []);

  const config = {
    data: departmentData,
    xField: 'department',
    yField: 'amount',
    label: {
      position: 'top',
    },
    tooltip: {
      customContent: (_: string, items: any[]) => {
        const item = items[0];
        if (!item) return '';
        return `<div>
          <span>${item.data.department}</span>
          <br/>
          <span>Amount: ${currency}${item.data.amount.toFixed(2)}</span>
        </div>`;
      }
    },
  };

  return <Column {...config} />;
}
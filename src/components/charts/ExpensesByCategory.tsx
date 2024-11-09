import React from 'react';
import { Pie } from '@ant-design/plots';
import { useCurrency } from '../../context/CurrencyContext';
import { Transaction } from '../../lib/supabase';

type Props = {
  transactions: Transaction[];
};

type CategoryData = {
  category: string;
  amount: number;
};

export function ExpensesByCategory({ transactions }: Props) {
  const { currency } = useCurrency();

  const categoryData = transactions.reduce((acc: CategoryData[], transaction) => {
    const existingCategory = acc.find(item => item.category === transaction.category);
    
    if (existingCategory) {
      existingCategory.amount += Math.abs(transaction.amount);
    } else {
      acc.push({
        category: transaction.category || 'Uncategorized',
        amount: Math.abs(transaction.amount)
      });
    }
    
    return acc;
  }, []);

  const config = {
    data: categoryData,
    angleField: 'amount',
    colorField: 'category',
    radius: 0.8,
    label: {
      type: 'outer',
    },
    tooltip: {
      customContent: (_: string, items: any[]) => {
        const item = items[0];
        if (!item) return '';
        return `<div>
          <span>${item.data.category}</span>
          <br/>
          <span>Amount: ${currency}${item.data.amount.toFixed(2)}</span>
        </div>`;
      }
    },
  };

  return <Pie {...config} />;
}
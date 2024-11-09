import React from 'react';
import { Table } from 'antd';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { Transaction } from '../../types/transaction';

type Props = {
  transactions: Transaction[];
  isMobile: boolean;
};

export function TransactionTable({ transactions, isMobile }: Props) {
  const navigate = useNavigate();
  const { currency } = useCurrency();

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => date ? format(new Date(date), 'MMM d, yyyy') : '-',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: Transaction) => (
        <a onClick={() => navigate(`/transaction/${record.id}`)}>{text || '-'}</a>
      ),
    },
    {
      title: `Amount (${currency})`,
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => {
        if (amount === undefined || amount === null) return '-';
        return (
          <span className={amount < 0 ? 'text-red-500' : 'text-green-500'}>
            {currency}{Math.abs(amount).toFixed(2)}
          </span>
        );
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      responsive: ['md'],
      render: (category: string) => category || '-',
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={transactions}
      rowKey="id"
      pagination={false}
      size={isMobile ? 'small' : 'middle'}
    />
  );
}
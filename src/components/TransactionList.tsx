import React from 'react';
import { Transaction } from '../lib/supabase';
import { format } from 'date-fns';
import { Table, Button, Tooltip, Space, Card } from 'antd';
import { FiTrash2, FiEye } from 'react-icons/fi';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

type Props = {
  transactions: Transaction[];
  onDelete: (id: string) => void;
};

export function TransactionList({ transactions, onDelete }: Props) {
  const { currency } = useCurrency();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => format(new Date(date), 'MMM d, yyyy'),
      responsive: ['md'],
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: `Amount (${currency})`,
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span className={`font-medium ${amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
          {currency}{Math.abs(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      responsive: ['lg'],
      render: (category: string) => (
        <span className="capitalize">{category}</span>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      responsive: ['xl'],
      render: (department: string) => (
        <span className="capitalize">{department}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Transaction) => (
        <Space>
          <Tooltip title="View details">
            <Button
              type="text"
              icon={<FiEye />}
              onClick={() => navigate(`/transaction/${record.id}`)}
              className="flex items-center justify-center"
            />
          </Tooltip>
          <Tooltip title="Delete transaction">
            <Button
              type="text"
              danger
              icon={<FiTrash2 />}
              onClick={() => onDelete(record.id)}
              className="flex items-center justify-center hover:text-red-500"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        className="overflow-hidden"
        styles={{
          body: { padding: 0 }
        }}
      >
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          pagination={{
            pageSize: isMobile ? 5 : 10,
            showSizeChanger: !isMobile,
            showTotal: (total, range) => 
              !isMobile && `${range[0]}-${range[1]} of ${total} items`,
          }}
          className={isDark ? 'dark-table' : ''}
          scroll={{ x: 'max-content' }}
          size={isMobile ? 'small' : 'middle'}
        />
      </Card>
    </motion.div>
  );
}
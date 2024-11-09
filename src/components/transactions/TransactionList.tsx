import React from 'react';
import { Transaction } from '../../lib/supabase';
import { format } from 'date-fns';
import { Table, Button, Tooltip, Space, Card } from 'antd';
import { FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';

type Props = {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
};

export function TransactionList({ transactions, onDelete, onEdit }: Props) {
  const { currency } = useCurrency();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { t } = useTranslation();

  const columns = [
    {
      title: t('transactions.table.date'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => format(new Date(date), 'MMM d, yyyy'),
      responsive: ['md'],
    },
    {
      title: t('transactions.table.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string, record: Transaction) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/transaction/${record.id}`)}
          style={{ padding: 0, height: 'auto' }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: t('transactions.table.amount', { currency }),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span className={`font-medium ${amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
          {currency}{Math.abs(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: t('transactions.table.category'),
      dataIndex: 'category',
      key: 'category',
      responsive: ['lg'],
      render: (category: string) => (
        <span className="capitalize">
          {t(`transactions.categories.${category}`)}
        </span>
      ),
    },
    {
      title: t('transactions.table.department'),
      dataIndex: 'department',
      key: 'department',
      responsive: ['xl'],
      render: (department: string) => (
        <span className="capitalize">
          {t(`transactions.departments.${department}`)}
        </span>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: Transaction) => (
        <Space>
          <Tooltip title={t('common.view')}>
            <Button
              type="text"
              icon={<FiEye />}
              onClick={() => navigate(`/transaction/${record.id}`)}
              className="flex items-center justify-center"
            />
          </Tooltip>
          <Tooltip title={t('common.edit')}>
            <Button
              type="text"
              icon={<FiEdit2 />}
              onClick={() => onEdit(record)}
              className="flex items-center justify-center"
            />
          </Tooltip>
          <Tooltip title={t('common.delete')}>
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
              !isMobile && t('common.pagination', {
                start: range[0],
                end: range[1],
                total
              }),
          }}
          className={isDark ? 'dark-table' : ''}
          scroll={{ x: 'max-content' }}
          size={isMobile ? 'small' : 'middle'}
        />
      </Card>
    </motion.div>
  );
}
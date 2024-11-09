import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Descriptions, Button, Space, Typography, Image } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../context/CurrencyContext';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const { Title } = Typography;

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { t } = useTranslation();

  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          project:project_id (
            name
          ),
          files:transaction_files(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('transaction-files')
        .download(filePath);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(t('common.error'));
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card loading />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center">
            <p className="text-red-500">{t('common.error')}</p>
            <Button onClick={() => navigate('/transactions')} className="mt-4">
              {t('common.back')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/transactions')}
        >
          {t('common.back')}
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          {t('transactions.title')}
        </Title>
      </div>

      <Card>
        <Descriptions
          layout={isMobile ? 'vertical' : 'horizontal'}
          column={1}
          bordered
        >
          <Descriptions.Item label={t('transactions.table.date')}>
            {format(new Date(transaction.created_at), 'PPP')}
          </Descriptions.Item>
          <Descriptions.Item label={t('transactions.table.amount')}>
            <span className={transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}>
              {currency}{Math.abs(transaction.amount).toFixed(2)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={t('transactions.table.description')}>
            {transaction.description}
          </Descriptions.Item>
          <Descriptions.Item label={t('transactions.table.category')}>
            {t(`transactions.categories.${transaction.category}`)}
          </Descriptions.Item>
          <Descriptions.Item label={t('transactions.table.department')}>
            {t(`transactions.departments.${transaction.department}`)}
          </Descriptions.Item>
          {transaction.project && (
            <Descriptions.Item label={t('transactions.project')}>
              {transaction.project.name}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {transaction.files && transaction.files.length > 0 && (
        <Card title={t('transactions.attachments')}>
          <Space size="large" wrap>
            {transaction.files.map((file) => {
              const isImage = file.content_type.startsWith('image/');
              const { data } = supabase.storage
                .from('transaction-files')
                .getPublicUrl(file.file_path);

              return isImage ? (
                <div key={file.id} className="relative group">
                  <Image
                    src={data.publicUrl}
                    alt={file.file_name}
                    className="max-w-[200px] rounded-lg"
                    preview={{
                      mask: (
                        <div className="flex items-center justify-center">
                          <DownloadOutlined className="mr-2" />
                          {t('common.download')}
                        </div>
                      ),
                    }}
                    onClick={() => downloadFile(file.file_path, file.file_name)}
                  />
                  <p className="mt-2 text-sm text-center">{file.file_name}</p>
                </div>
              ) : (
                <Button
                  key={file.id}
                  icon={<DownloadOutlined />}
                  onClick={() => downloadFile(file.file_path, file.file_name)}
                >
                  {file.file_name}
                </Button>
              );
            })}
          </Space>
        </Card>
      )}
    </div>
  );
}
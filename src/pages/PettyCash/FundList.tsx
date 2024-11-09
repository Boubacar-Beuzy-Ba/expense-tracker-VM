import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Modal, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { pettyCashApi } from '../../lib/supabase-v2';
import { FundForm } from '../../components/petty-cash/FundForm';
import { FundGrid } from '../../components/petty-cash/FundGrid';
import { useAuth } from '../../context/AuthContext';

export function FundList() {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: funds, isLoading } = useQuery({
    queryKey: ['petty-cash-funds'],
    queryFn: pettyCashApi.getFunds,
    retry: 1,
    onError: (error) => {
      console.error('Error fetching funds:', error);
      message.error('Failed to fetch petty cash funds');
    }
  });

  const createFund = useMutation({
    mutationFn: async (values: any) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const fund = {
        name: values.name,
        initial_balance: values.initial_balance,
        current_balance: values.initial_balance,
        custodian_id: values.custodian_id,
        department: values.department,
        status: 'active',
        created_by: user.id,
      };

      return await pettyCashApi.createFund(fund);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash-funds'] });
      message.success('Petty cash fund created successfully');
      setIsModalVisible(false);
    },
    onError: (error: any) => {
      console.error('Create fund error:', error);
      message.error(error.message || 'Failed to create petty cash fund');
    },
  });

  return (
    <div className="p-6">
      <Card
        title="Petty Cash Funds"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Create Fund
          </Button>
        }
      >
        <FundGrid funds={funds || []} isLoading={isLoading} />
      </Card>

      <Modal
        title="Create Petty Cash Fund"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <FundForm
          onSubmit={(data) => createFund.mutate(data)}
          isSubmitting={createFund.isPending}
        />
      </Modal>
    </div>
  );
}
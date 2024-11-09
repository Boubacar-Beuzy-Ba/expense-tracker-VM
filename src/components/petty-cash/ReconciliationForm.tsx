import React from 'react';
import { Form, InputNumber, Select, Input, Button } from 'antd';
import { useCurrency } from '../../context/CurrencyContext';
import { FundSummary } from '../../types/petty-cash';

type Props = {
  funds: FundSummary[];
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
};

export function ReconciliationForm({ funds, onSubmit, isSubmitting }: Props) {
  const [form] = Form.useForm();
  const { currency } = useCurrency();

  const [selectedFund, setSelectedFund] = React.useState<FundSummary | null>(null);

  const handleFundChange = (fundId: string) => {
    const fund = funds.find(f => f.id === fundId);
    setSelectedFund(fund || null);
    if (fund) {
      form.setFieldValue('system_balance', fund.current_balance);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
    >
      <Form.Item
        name="fund_id"
        label="Select Fund"
        rules={[{ required: true, message: 'Please select a fund' }]}
      >
        <Select
          placeholder="Select fund"
          onChange={handleFundChange}
        >
          {funds.map(fund => (
            <Select.Option key={fund.id} value={fund.id}>
              {fund.name} ({currency}{fund.current_balance.toFixed(2)})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="physical_count"
        label={`Physical Count (${currency})`}
        rules={[
          { required: true, message: 'Please enter physical count' },
          { type: 'number', min: 0, message: 'Amount must be positive' }
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          precision={2}
          prefix={currency}
        />
      </Form.Item>

      <Form.Item
        name="system_balance"
        label={`System Balance (${currency})`}
      >
        <InputNumber
          style={{ width: '100%' }}
          precision={2}
          prefix={currency}
          disabled
          value={selectedFund?.current_balance}
        />
      </Form.Item>

      <Form.Item
        name="notes"
        label="Notes"
      >
        <Input.TextArea
          rows={4}
          placeholder="Enter any notes or observations"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          block
        >
          Submit Reconciliation
        </Button>
      </Form.Item>
    </Form>
  );
}
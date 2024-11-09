import React from 'react';
import { Form, Select, Switch, Button } from 'antd';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../LanguageSelector';

const currencies = [
  { value: '$', label: 'USD' },
  { value: '€', label: 'EUR' },
  { value: '£', label: 'GBP' },
  { value: '¥', label: 'JPY' },
  { value: 'XOF', label: 'XOF' },
];

export function GeneralSettings() {
  const { currency, setCurrency } = useCurrency();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const handleSave = () => {
    // Handle save
  };

  return (
    <Form layout="vertical" onFinish={handleSave}>
      <Form.Item label={t('settings.language.title')}>
        <LanguageSelector />
      </Form.Item>

      <Form.Item label={t('settings.currency.title')}>
        <Select
          value={currency}
          onChange={setCurrency}
          options={currencies}
          style={{ width: 200 }}
        />
      </Form.Item>
      
      <Form.Item label={t('settings.theme.title')}>
        <Switch
          checked={isDark}
          onChange={toggleTheme}
          checkedChildren={t('settings.theme.dark')}
          unCheckedChildren={t('settings.theme.light')}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {t('common.save')}
        </Button>
      </Form.Item>
    </Form>
  );
}
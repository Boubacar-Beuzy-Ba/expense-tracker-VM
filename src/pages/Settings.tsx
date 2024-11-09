import React from 'react';
import { Card, Tabs, App } from 'antd';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GeneralSettings } from '../components/settings/GeneralSettings';
import { TranslationManager } from '../components/settings/TranslationManager';

export function Settings() {
  const { t } = useTranslation();

  const items = [
    {
      key: 'general',
      label: t('settings.general.title'),
      children: <GeneralSettings />
    },
    {
      key: 'translations',
      label: t('settings.translations.title'),
      children: <TranslationManager />
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <App>
        <Card title={t('settings.title')}>
          <Tabs items={items} />
        </Card>
      </App>
    </motion.div>
  );
}

export default Settings;
import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' }
];

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleChange = (value: string) => {
    i18n.changeLanguage(value).then(() => {
      // Force a re-render of components by updating localStorage
      localStorage.setItem('i18nextLng', value);
      // Reload the page to ensure all components are updated
      window.location.reload();
    });
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      options={languages}
      style={{ width: 100 }}
    />
  );
}
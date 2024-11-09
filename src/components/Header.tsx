import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiSettings, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { Select, Button, Space, Tooltip } from 'antd';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';

const currencies = [
  { value: '$', label: 'USD' },
  { value: '€', label: 'EUR' },
  { value: '£', label: 'GBP' },
  { value: '¥', label: 'JPY' },
  { value: 'XOF', label: 'XOF' },
];

export function Header() {
  const { signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  return (
    <header 
      className={`fixed right-0 top-0 z-10 shadow ${isDark ? 'bg-[#141414]' : 'bg-white'}`} 
      style={{ 
        paddingLeft: 24,
        paddingRight: 24,
        left: 'inherit'
      }}
    >
      <div className="flex justify-end items-center h-16">
        <Space size="middle">
          <Select
            value={currency}
            onChange={setCurrency}
            options={currencies}
            style={{ width: 100 }}
          />
          
          <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
            <Button 
              type="text"
              icon={isDark ? <FiSun /> : <FiMoon />}
              onClick={toggleTheme}
            />
          </Tooltip>

          <Link to="/settings">
            <Tooltip title="Settings">
              <Button
                type="text"
                icon={<FiSettings />}
              />
            </Tooltip>
          </Link>
          
          <Tooltip title="Sign out">
            <Button
              type="primary"
              danger
              icon={<FiLogOut />}
              onClick={signOut}
            />
          </Tooltip>
        </Space>
      </div>
    </header>
  );
}
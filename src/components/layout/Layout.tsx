import React, { useState } from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  ProjectOutlined,
  TransactionOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Header } from './Header';
import { usePermissions } from '../../hooks/usePermissions';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { Content, Sider } = AntLayout;

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = usePermissions();
  const { isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('navigation.dashboard'),
    },
    {
      key: '/transactions',
      icon: <TransactionOutlined />,
      label: t('navigation.transactions'),
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: t('navigation.projects'),
    },
    {
      key: 'petty-cash',
      icon: <WalletOutlined />,
      label: t('navigation.pettyCash.main'),
      children: [
        {
          key: '/petty-cash',
          label: t('navigation.pettyCash.dashboard'),
        },
        {
          key: '/petty-cash/funds',
          label: t('navigation.pettyCash.funds'),
        },
        {
          key: '/petty-cash/transactions',
          label: t('navigation.pettyCash.transactions'),
        },
        {
          key: '/petty-cash/reconciliations',
          label: t('navigation.pettyCash.reconciliations'),
        },
        {
          key: '/petty-cash/settings',
          label: t('navigation.pettyCash.settings'),
        },
      ],
    },
    hasRole('admin') && {
      key: '/users',
      icon: <UserOutlined />,
      label: t('navigation.users'),
    },
    hasRole('admin') && {
      key: '/roles',
      icon: <SafetyCertificateOutlined />,
      label: t('navigation.roles'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('navigation.settings'),
    },
  ].filter(Boolean);

  return (
    <AntLayout className={isDark ? 'dark' : 'light'}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className={`fixed left-0 top-0 h-screen ${isDark ? 'dark' : ''}`}
        style={{ 
          background: isDark ? '#141414' : '#fff',
          borderRight: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
          zIndex: 1001
        }}
        theme={isDark ? 'dark' : 'light'}
      >
        <div className="h-16 flex items-center justify-center border-b border-[#f0f0f0] dark:border-[#303030]">
          <h1 className="text-lg font-bold">{t('app.title')}</h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['petty-cash']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ 
            height: 'calc(100% - 64px)',
            borderRight: 0,
            background: 'transparent'
          }}
          className={isDark ? 'dark' : ''}
          theme={isDark ? 'dark' : 'light'}
        />
      </Sider>
      <AntLayout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header />
        <Content
          style={{
            margin: '24px',
            marginTop: '88px',
            minHeight: 'calc(100vh - 112px)',
            background: isDark ? '#141414' : '#fff',
            borderRadius: '8px',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
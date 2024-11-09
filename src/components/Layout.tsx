import React, { useState } from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ProjectOutlined,
  SettingOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Header } from './Header';
import { usePermissions } from '../hooks/usePermissions';
import { useTheme } from '../context/ThemeContext';

const { Content, Sider } = AntLayout;

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const { isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: 'Projects',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    hasPermission('manage:users') && {
      key: '/users',
      icon: <UserOutlined />,
      label: 'User Management',
    },
    hasPermission('manage:roles') && {
      key: '/roles',
      icon: <SafetyCertificateOutlined />,
      label: 'Role Management',
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
          <h1 className="text-lg font-bold">Expense Tracker</h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
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
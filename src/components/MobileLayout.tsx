import React from 'react';
import { TabBar } from 'antd-mobile';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
  SetOutline,
} from 'antd-mobile-icons';
import { usePermissions } from '../hooks/usePermissions';
import { useTheme } from '../context/ThemeContext';

export function MobileLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const { isDark } = useTheme();

  const tabs = [
    {
      key: '/',
      title: 'Dashboard',
      icon: <AppOutline />,
    },
    {
      key: '/projects',
      title: 'Projects',
      icon: <UnorderedListOutline />,
    },
    hasPermission('manage:users') && {
      key: '/users',
      title: 'Users',
      icon: <UserOutline />,
    },
    {
      key: '/settings',
      title: 'Settings',
      icon: <SetOutline />,
    },
  ].filter(Boolean);

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#141414]' : 'bg-gray-50'}`}>
      <div className="pb-12">
        <Outlet />
      </div>
      <TabBar
        activeKey={location.pathname}
        onChange={value => navigate(value)}
        className="fixed bottom-0 w-full border-t border-gray-200 dark:border-gray-800"
        style={{
          backgroundColor: isDark ? '#141414' : '#fff',
        }}
      >
        {tabs.map(item => (
          <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
        ))}
      </TabBar>
    </div>
  );
}
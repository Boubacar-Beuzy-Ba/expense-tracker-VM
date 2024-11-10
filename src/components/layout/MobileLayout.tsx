// src/components/layout/MobileLayout.tsx
import React from "react";
import { TabBar, SpinLoading } from "antd-mobile";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
  SetOutline,
  BillOutline,
} from "antd-mobile-icons";
import { usePermissions } from "../../hooks/usePermissions";
import { useTheme } from "../../context/ThemeContext";

export const MobileLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole, isLoading } = usePermissions();
  const { isDark } = useTheme();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <SpinLoading color="primary" />
      </div>
    );
  }

  const tabs = [
    {
      key: "/dashboard",
      title: "Dashboard",
      icon: <AppOutline />,
    },
    {
      key: "/transactions",
      title: "Transactions",
      icon: <BillOutline />,
    },
    {
      key: "/projects",
      title: "Projects",
      icon: <UnorderedListOutline />,
    },
    ...(hasRole("admin")
      ? [
          {
            key: "/users",
            title: "Users",
            icon: <UserOutline />,
          },
        ]
      : []),
    {
      key: "/settings",
      title: "Settings",
      icon: <SetOutline />,
    },
  ];

  return (
    <div
      className={`min-h-screen ${isDark ? "dark bg-[#141414]" : "bg-gray-50"}`}
    >
      <div className="pb-12">
        <Outlet />
      </div>
      <TabBar
        activeKey={location.pathname}
        onChange={(value: string) => navigate(value)}
        className="fixed bottom-0 w-full border-t border-gray-200 dark:border-gray-800"
        style={{
          backgroundColor: isDark ? "#141414" : "#fff",
        }}
      >
        {tabs.map((item) => (
          <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
        ))}
      </TabBar>
    </div>
  );
};

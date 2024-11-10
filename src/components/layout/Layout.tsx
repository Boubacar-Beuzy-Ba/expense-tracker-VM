import React, { useState } from "react";
import { Layout as AntLayout, Menu, Spin } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  ProjectOutlined,
  TransactionOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Header } from "./Header";
import { usePermissions } from "../../hooks/usePermissions";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

const { Content, Sider } = AntLayout;

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole, hasPermission, userProfile, isLoading } = usePermissions(); // Add hasPermission
  const { isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  // Add debug logging
  console.log("Layout render:", {
    userProfile,
    isAdmin: hasRole("admin"),
    canViewTransactions: hasPermission("read:transactions"),
    canManagePettyCash: hasPermission("manage:petty-cash"),
  });

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Base menu items remain the same
  const baseMenuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: t("navigation.dashboard"),
    },
    {
      key: "/transactions",
      icon: <TransactionOutlined />,
      label: t("navigation.transactions"),
    },
  ];

  // Project menu items remain the same
  const projectMenuItems = [
    {
      key: "/projects",
      icon: <ProjectOutlined />,
      label: t("navigation.projects"),
    },
  ];

  // Update petty cash menu items to check for permissions
  const pettyCashMenuItems = hasPermission("manage:petty-cash")
    ? [
        {
          key: "petty-cash",
          icon: <WalletOutlined />,
          label: t("navigation.pettyCash.main"),
          children: [
            {
              key: "/petty-cash",
              label: t("navigation.pettyCash.dashboard"),
            },
            hasPermission("manage:funds") && {
              key: "/petty-cash/funds",
              label: t("navigation.pettyCash.funds"),
            },
            hasPermission("manage:transactions") && {
              key: "/petty-cash/transactions",
              label: t("navigation.pettyCash.transactions"),
            },
            hasPermission("manage:reconciliations") && {
              key: "/petty-cash/reconciliations",
              label: t("navigation.pettyCash.reconciliations"),
            },
            {
              key: "/petty-cash/settings",
              label: t("navigation.pettyCash.settings"),
            },
          ].filter(Boolean), // Filter out false values from permission checks
        },
      ]
    : [];

  // Admin menu items remain the same
  const adminMenuItems = hasRole("admin")
    ? [
        {
          key: "/users",
          icon: <UserOutlined />,
          label: t("navigation.users"),
        },
        {
          key: "/roles",
          icon: <SafetyCertificateOutlined />,
          label: t("navigation.roles"),
        },
      ]
    : [];

  // Settings menu item remains the same
  const settingsMenuItem = [
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: t("navigation.settings"),
    },
  ];

  // Update menu items combination
  const menuItems = [
    ...baseMenuItems,// Now based on permissions
    ...projectMenuItems,
    ...pettyCashMenuItems, // Now based on permissions
    ...adminMenuItems,
    ...settingsMenuItem,
  ];

  // Rest of the component remains the same
  return (
    <AntLayout className={isDark ? "dark" : "light"}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className={`fixed left-0 top-0 h-screen ${isDark ? "dark" : ""}`}
        style={{
          background: isDark ? "#141414" : "#fff",
          borderRight: `1px solid ${isDark ? "#303030" : "#f0f0f0"}`,
          zIndex: 1001,
        }}
        theme={isDark ? "dark" : "light"}
      >
        <div className="h-16 flex items-center justify-center border-b border-[#f0f0f0] dark:border-[#303030]">
          <h1 className="text-lg font-bold">{t("app.title")}</h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["petty-cash"]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            height: "calc(100% - 64px)",
            borderRight: 0,
            background: "transparent",
          }}
          className={isDark ? "dark" : ""}
          theme={isDark ? "dark" : "light"}
        />
      </Sider>
      <AntLayout
        style={{
          marginLeft: collapsed ? 80 : 200,
          transition: "margin-left 0.2s",
        }}
      >
        <Header />
        <Content
          style={{
            margin: "24px",
            marginTop: "88px",
            minHeight: "calc(100vh - 112px)",
            background: isDark ? "#141414" : "#fff",
            borderRadius: "8px",
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

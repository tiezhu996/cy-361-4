import { useState } from "react";
import {
  ConfigProvider,
  Layout,
  Menu,
  theme,
  Button,
  Space,
} from "antd";
import {
  ApiOutlined,
  DashboardOutlined,
  CalendarOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { APP_CODE, APP_NAME, APP_THEME } from "./constants/app";
import { REQUEST_MESSAGES } from "./constants/messages";
import Dashboard from "./pages/Dashboard";
import ReservationBoard from "./pages/ReservationBoard";
import CheckinPage from "./pages/CheckinPage";

const { Header, Content, Sider } = Layout;

import type { MenuProps } from "antd";

type MenuItem = Required<MenuProps>["items"][number];

const menuItems: MenuItem[] = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: "总览",
  },
  {
    key: "/board",
    icon: <CalendarOutlined />,
    label: "预约看板",
  },
];

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = location.pathname.startsWith("/checkin")
    ? "/checkin"
    : location.pathname;

  const showSider = !location.pathname.startsWith("/checkin");

  function handleMenuClick({ key }: { key: string }) {
    navigate(key);
  }

  return (
    <Layout className="app-shell" style={{ minHeight: "100vh" }}>
      <Header className="topbar" style={{ padding: "0 24px" }}>
        <div className="brand-block">
          <span className="brand-code">{APP_CODE}</span>
          <h1 className="brand-title">{APP_NAME}</h1>
        </div>
        <Space>
          <Button
            type="default"
            icon={<QrcodeOutlined />}
            onClick={() => navigate("/board")}
          >
            我的预约
          </Button>
          <Button
            type="primary"
            icon={<ApiOutlined />}
            href={REQUEST_MESSAGES.healthPath}
            target="_blank"
          >
            API Health
          </Button>
        </Space>
      </Header>
      <Layout>
        {showSider && (
          <Sider
            width={200}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            style={{
              background: APP_THEME.surface,
              borderRight: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              items={menuItems}
              onClick={handleMenuClick}
              style={{
                height: "100%",
                borderRight: 0,
                background: "transparent",
                paddingTop: "16px",
              }}
            />
          </Sider>
        )}
        <Content className="workspace">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/board" element={<ReservationBoard />} />
            <Route path="/checkin" element={<CheckinPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: APP_THEME.accent,
          colorText: APP_THEME.ink,
          colorBgBase: APP_THEME.paper,
          borderRadius: 8,
        },
        components: {
          Layout: {
            headerBg: APP_THEME.accent,
            headerColor: "#fff",
            siderBg: APP_THEME.surface,
          },
          Menu: {
            darkItemBg: "transparent",
            darkSubMenuItemBg: "transparent",
          },
        },
      }}
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ConfigProvider>
  );
}

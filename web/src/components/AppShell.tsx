import {
  ApartmentOutlined,
  DashboardOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname.startsWith("/tools") ? "tools" : "dashboard";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsible theme="dark" width={228}>
        <div
          style={{
            padding: "18px 16px",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: 0.5,
          }}
        >
          relath
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            {
              key: "dashboard",
              icon: <DashboardOutlined />,
              label: "概览",
              onClick: () => navigate("/dashboard"),
            },
            {
              key: "tools",
              icon: <ApartmentOutlined />,
              label: "关系工具",
              onClick: () => navigate("/tools"),
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            paddingInline: 24,
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography.Text type="secondary">
            商业关系图谱 · 管理端
          </Typography.Text>
          <a
            href="https://github.com/fengurt/relath01"
            target="_blank"
            rel="noreferrer"
            style={{ color: "inherit" }}
          >
            <GithubOutlined /> GitHub
          </a>
        </Header>
        <Content style={{ padding: 24, background: "#f5f5f5" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

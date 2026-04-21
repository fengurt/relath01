import {
  AccountBookOutlined,
  ApartmentOutlined,
  BranchesOutlined,
  ClusterOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  GithubOutlined,
  LinkOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Breadcrumb, FloatButton, Layout, Menu, Tooltip } from "antd";
import type { MenuProps } from "antd";
import type { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const SUB_MANAGE = "subManage";

const ENTITY_CRUMB: Record<string, string> = {
  merchants: "商户",
  consumers: "消费者",
  employees: "员工",
  partners: "合伙人",
  orders: "订单",
  settles: "结算",
};

function breadcrumbItems(pathname: string): ItemType[] {
  const items: ItemType[] = [
    {
      title: <Link to="/dashboard">工作台</Link>,
    },
  ];

  if (pathname === "/dashboard" || pathname === "/") {
    items.push({ title: "概览" });
    return items;
  }

  if (pathname === "/tools") {
    items.push({ title: "关系工具" });
    return items;
  }

  if (pathname === "/relations") {
    items.push({ title: "数据管理" });
    items.push({ title: "关系浏览" });
    return items;
  }

  if (pathname.startsWith("/manage/")) {
    const slug = pathname.replace("/manage/", "");
    items.push({ title: "数据管理" });
    items.push({ title: ENTITY_CRUMB[slug] ?? slug });
    return items;
  }

  items.push({ title: "页面" });
  return items;
}

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([SUB_MANAGE]);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  useEffect(() => {
    if (
      location.pathname.startsWith("/manage") ||
      location.pathname === "/relations"
    ) {
      setOpenKeys((previous) =>
        previous.includes(SUB_MANAGE) ? previous : [...previous, SUB_MANAGE]
      );
    }
  }, [location.pathname]);

  const selectedKey = useMemo(() => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") {
      return "/dashboard";
    }
    return path;
  }, [location.pathname]);

  const crumbs = useMemo(
    () => breadcrumbItems(location.pathname),
    [location.pathname]
  );

  const menuItems: MenuProps["items"] = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "概览",
      onClick: () => navigate("/dashboard"),
    },
    {
      key: SUB_MANAGE,
      icon: <DatabaseOutlined />,
      label: "数据管理",
      popupClassName: "relath-sider-submenu-flyout",
      children: [
        {
          key: "/manage/merchants",
          icon: <ShopOutlined className="relath-sider-menu-leaf-icon" />,
          label: "商户",
          onClick: () => navigate("/manage/merchants"),
        },
        {
          key: "/manage/consumers",
          icon: <TeamOutlined className="relath-sider-menu-leaf-icon" />,
          label: "消费者",
          onClick: () => navigate("/manage/consumers"),
        },
        {
          key: "/manage/employees",
          icon: <SolutionOutlined className="relath-sider-menu-leaf-icon" />,
          label: "员工",
          onClick: () => navigate("/manage/employees"),
        },
        {
          key: "/manage/partners",
          icon: <BranchesOutlined className="relath-sider-menu-leaf-icon" />,
          label: "合伙人",
          onClick: () => navigate("/manage/partners"),
        },
        {
          key: "/manage/orders",
          icon: <ShoppingCartOutlined className="relath-sider-menu-leaf-icon" />,
          label: "订单",
          onClick: () => navigate("/manage/orders"),
        },
        {
          key: "/manage/settles",
          icon: <AccountBookOutlined className="relath-sider-menu-leaf-icon" />,
          label: "结算",
          onClick: () => navigate("/manage/settles"),
        },
        {
          key: "/relations",
          icon: <LinkOutlined className="relath-sider-menu-leaf-icon" />,
          label: "关系浏览",
          onClick: () => navigate("/relations"),
        },
      ],
    },
    {
      key: "/tools",
      icon: <ApartmentOutlined />,
      label: "关系工具",
      onClick: () => navigate("/tools"),
    },
  ];

  return (
    <Layout className="relath-app-shell" style={{ minHeight: "100vh" }}>
      <Sider
        breakpoint="lg"
        collapsible
        theme="dark"
        width={244}
        onCollapse={(collapsed) => setSiderCollapsed(collapsed)}
        style={{
          background:
            "linear-gradient(175deg, #0a0a0a 0%, #141414 48%, rgba(30, 61, 89, 0.35) 100%)",
        }}
      >
        <div className="relath-sider-inner">
          <Tooltip
            placement="right"
            title={
              siderCollapsed ? "Relath — The Neural Cartographer · 商业关系图谱" : undefined
            }
          >
            <div className="relath-sider-brand">
              <div className="relath-sider-mark" aria-hidden>
                <ClusterOutlined />
              </div>
              <div className="relath-sider-brand-text">
                <div className="relath-sider-title">Relath</div>
                <div className="relath-sider-sub">The Neural Cartographer · 商业关系图谱</div>
              </div>
            </div>
          </Tooltip>
          <nav className="relath-sider-nav" aria-label="主导航">
            <Menu
              theme="dark"
              mode="inline"
              className="relath-sider-menu"
              openKeys={openKeys}
              onOpenChange={(keys) => setOpenKeys(keys as string[])}
              selectedKeys={[selectedKey]}
              items={menuItems}
              style={{
                background: "transparent",
                borderInlineEnd: "none",
              }}
            />
          </nav>
        </div>
      </Sider>
      <Layout>
        <Header
          className="relath-header-bar"
          style={{
            paddingInline: 24,
            height: 56,
            lineHeight: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Breadcrumb items={crumbs} style={{ margin: 0 }} />
          <a
            href="https://github.com/fengurt/relath01"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
            }}
          >
            <GithubOutlined /> 源码
          </a>
        </Header>
        <Content
          style={{
            padding: "24px 28px 32px",
            minWidth: 0,
            maxWidth: "100%",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      <FloatButton.BackTop duration={380} visibilityHeight={320} />
    </Layout>
  );
}

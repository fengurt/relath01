import { Layout, Typography } from "antd";

const { Header, Content } = Layout;

export function App() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ color: "#fff" }}>relath 管理端</Header>
      <Content style={{ padding: 24 }}>
        <Typography.Title level={3}>图可视化占位</Typography.Title>
        <Typography.Paragraph>
          后续接入 AntV G6 WebGL 与业务接口。
        </Typography.Paragraph>
      </Content>
    </Layout>
  );
}

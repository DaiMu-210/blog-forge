import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined,
  PictureOutlined,
  CloudUploadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';

const { Sider, Content } = Layout;

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/articles',
      icon: <FileTextOutlined />,
      label: '文章管理',
    },
    {
      key: '/images',
      icon: <PictureOutlined />,
      label: '图片管理',
    },
    {
      key: '/deploy',
      icon: <CloudUploadOutlined />,
      label: '发布中心',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  return (
    <Layout className="h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        className="bg-white dark:bg-[#1F1F1F]"
        width={240}
      >
        <div className="h-16 flex items-center justify-center border-b border-[#F0F0F0] dark:border-[#434343]">
          <h1 className={`text-lg font-semibold text-primary ${sidebarCollapsed ? 'hidden' : ''}`}>
            BlogForge
          </h1>
          {sidebarCollapsed && (
            <span className="text-lg font-semibold text-primary">BF</span>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-r-0"
        />
      </Sider>
      <Layout>
        <div className="h-16 flex items-center px-4 bg-white dark:bg-[#1F1F1F] border-b border-[#F0F0F0] dark:border-[#434343]">
          <div className="text-2xl cursor-pointer" onClick={toggleSidebar}>
            {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
        </div>
        <Content className="m-4 p-4 bg-white dark:bg-[#1F1F1F] rounded-lg overflow-auto">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

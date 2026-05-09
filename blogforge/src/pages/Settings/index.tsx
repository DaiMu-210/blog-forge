import React from 'react';
import { Card, Form, Switch, Select, Button, Divider, message, Space } from 'antd';
import { useAppStore } from '../../stores/appStore';

export const Settings: React.FC = () => {
  const { darkMode, setDarkMode } = useAppStore();

  const handleSave = () => {
    message.success('设置已保存');
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold mb-6">设置</h1>

      <Card title="外观" className="mb-4">
        <Form layout="vertical">
          <Form.Item label="深色模式">
            <Switch checked={darkMode} onChange={setDarkMode} />
          </Form.Item>
          <Form.Item label="语言">
            <Select
              defaultValue="zh-CN"
              options={[
                { value: 'zh-CN', label: '简体中文' },
                { value: 'en-US', label: 'English' },
              ]}
              style={{ width: 200 }}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="编辑器" className="mb-4">
        <Form layout="vertical">
          <Form.Item label="字体大小">
            <Select
              defaultValue="14"
              options={[
                { value: '12', label: '12px' },
                { value: '14', label: '14px' },
                { value: '16', label: '16px' },
                { value: '18', label: '18px' },
              ]}
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item label="自动保存">
            <Select
              defaultValue="30"
              options={[
                { value: '0', label: '关闭' },
                { value: '30', label: '30 秒' },
                { value: '60', label: '60 秒' },
                { value: '120', label: '120 秒' },
              ]}
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item label="版本历史保存数量">
            <Select
              defaultValue="20"
              options={[
                { value: '10', label: '10 个版本' },
                { value: '20', label: '20 个版本' },
                { value: '50', label: '50 个版本' },
              ]}
              style={{ width: 200 }}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="数据管理" className="mb-4">
        <Space direction="vertical">
          <div>
            <h3 className="font-medium mb-2">备份数据</h3>
            <p className="text-gray-500 text-sm mb-2">
              导出所有文章、配置和图片到本地文件
            </p>
            <Button>导出备份</Button>
          </div>
          <Divider />
          <div>
            <h3 className="font-medium mb-2">恢复数据</h3>
            <p className="text-gray-500 text-sm mb-2">
              从备份文件恢复所有数据
            </p>
            <Button>选择备份文件</Button>
          </div>
        </Space>
      </Card>

      <Card title="关于">
        <div className="text-gray-500">
          <p>BlogForge v0.1.0</p>
          <p className="mt-2">一款面向个人用户的跨平台桌面博客管理软件</p>
          <p>提供从内容创作、本地预览到静态网站发布的完整解决方案</p>
        </div>
      </Card>

      <div className="mt-4">
        <Button type="primary" onClick={handleSave}>
          保存设置
        </Button>
      </div>
    </div>
  );
};

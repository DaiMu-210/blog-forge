import React from 'react';
import { Card, Button, Steps, Space, message } from 'antd';
import { CloudUploadOutlined, RocketOutlined } from '@ant-design/icons';

export const Deploy: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">发布中心</h1>
      <Card className="mb-4">
        <Steps
          current={0}
          items={[
            { title: '生成静态文件', description: '将文章转换为 HTML' },
            { title: '构建网站', description: '应用主题模板' },
            { title: '部署上线', description: '上传到服务器或平台' },
          ]}
        />
      </Card>
      <Card>
        <div className="text-center py-8">
          <Space direction="vertical" size="large">
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={() => message.info('生成功能开发中')}
            >
              生成并发布网站
            </Button>
            <Button
              size="large"
              icon={<CloudUploadOutlined />}
              onClick={() => message.info('部署配置开发中')}
            >
              配置部署设置
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

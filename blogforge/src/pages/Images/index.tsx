import React from 'react';
import { Card } from 'antd';

export const Images: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">图片管理</h1>
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">图片管理功能开发中...</p>
          <p className="text-gray-400 text-sm mt-2">
            支持 GitHub、阿里云 OSS、腾讯云 COS、Cloudflare R2 等图床
          </p>
        </div>
      </Card>
    </div>
  );
};
